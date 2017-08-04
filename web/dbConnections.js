const mongoose = require('mongoose')
const config = require('config')

const amqp = require('../lib/amqp')

const connections = {}

const setupMongoose = () => {
	mongoose.Promise = Promise
	return mongoose.connect(config.get('mongo.uri'), {useMongoClient: true})
}

const setupRabbitmq = () => {
	const queues = {
		routeRequest: {
			name: config.get('queues.routeRequest'),
			options: {durable: true}
		},
		routeResult: {
			name: config.get('queues.routeResult'),
			options: {durable: true}
		}
	}

	return amqp.setup(config.get('rabbitmq.uri'), queues)
		.then(() => {
			connections.amqp = amqp
		})
}

let doneSetup = false
connections.setup = () => {
	if (doneSetup) return Promise.resolve()

	doneSetup = true

	return Promise.all([
		setupMongoose(),
		setupRabbitmq()
	])
}

module.exports = connections
