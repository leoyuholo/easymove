const amqplib = require('amqplib')
const _ = require('lodash')
const uuidv4 = require('uuid/v4')
const promiseRetry = require('promise-retry')

const amqp = {}

amqp.setup = (uri, queues) => {
	return promiseRetry(retry => amqplib.connect(uri).catch(retry))
		.then(conn => conn.createChannel())
		.then(ch => {
			amqp.ch = ch
			ch.prefetch(1)
			_.forEach(queues, queue => ch.assertQueue(queue.name, queue.options))
		})
}

amqp.sendToWorker = (queueName, payloadObj) => {
	const ok = amqp.ch.sendToQueue(queueName, Buffer.from(JSON.stringify(payloadObj)), {persistent: true})
	return ok ? Promise.resolve() : Promise.reject(new Error('AMQP channel buffer is full'))
}

amqp.receiveWork = (queueName, callback) => {
	const consumerTag = uuidv4()

	amqp.ch.consume(queueName, (msg) => {
		callback(JSON.parse(msg.content.toString()))
			.then(() => amqp.ch.ack(msg))
			.catch(err => {
				console.error(err.message)
				amqp.ch.nack(msg)
			})
	}, {noack: false, consumerTag})

	return Promise.resolve(() => amqp.ch.cancel(consumerTag))
}

module.exports = amqp
