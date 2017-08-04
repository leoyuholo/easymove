const amqp = require('../../lib/amqp')
const routeService = require('../services/routeService')

const subscriber = {}

const updateRoute = (route) => {
	return routeService.updateRoute(route)
}

subscriber.subscribe = (queueName) => {
	return amqp.receiveWork(queueName, updateRoute)
		.then(unsubscribe => {
			subscriber.unsubscribe = unsubscribe
		})
}

module.exports = subscriber
