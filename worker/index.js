const amqp = require('../lib/amqp')
const config = require('config')

const routeRequestSubscriber = require('./subscribers/routeRequestSubscriber')

const queues = {
	routeRequest: {
		name: config.get('queues.routeRequest'),
		options: {
			durable: true
		}
	},
	routeResult: {
		name: config.get('queues.routeResult'),
		options: {
			durable: true
		}
	}
}

amqp.setup(config.get('rabbitmq.uri'), queues)
	.then(() => routeRequestSubscriber.subscribe(queues.routeRequest.name))
	.then(() => console.log(`worker started receiving work from queue ${queues.routeRequest.name}`))
