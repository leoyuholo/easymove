const config = require('config')

const amqp = require('../../lib/amqp')
const routeService = require('../services/routeService')

const subscriber = {}

const worker = ({token, start, dropoffs}) => {
	return routeService.computeRoute(start, dropoffs)
		.then(({status, path, totalDistance, totalTime}) => {
			return amqp.sendToWorker(config.get('queues.routeResult'), {
				status: 'success',
				token,
				path,
				totalDistance,
				totalTime
			})
		})
		.catch(err => {
			console.log('failure', err)
			return amqp.sendToWorker(config.get('queues.routeResult'), {
				status: 'failure',
				token,
				error: {
					message: err.message
				}
			})
		})
}

subscriber.subscribe = (queueName) => {
	return amqp.receiveWork(queueName, worker)
		.then(unsubscribe => {
			subscriber.unsubscribe = unsubscribe
		})
}

module.exports = subscriber
