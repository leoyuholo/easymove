const Route = require('../models/Route')
const dbConnections = require('../dbConnections')
const config = require('config')

const service = {}

const sendRequest = (route) => {
	return dbConnections.amqp.sendToWorker(config.get('queues.routeRequest'), {
		token: route.token,
		start: route.start,
		dropoffs: route.dropoffs
	})
		.then(() => route)
}

service.createRequest = (start, dropoffs) => {
	const route = new Route({start, dropoffs})
	return route
		.save()
		.then(route => sendRequest(route))
		.then(route => route.token)
}

service.findRoute = (token) => {
	return Route.findOne({token})
		.then(route => route.toObject())
}

service.updateRoute = ({token, status, error, path, totalDistance, totalTime}) => {
	let setRoute = {}

	if (status === 'success') {
		setRoute = {
			status,
			path,
			totalDistance,
			totalTime
		}
	} else if (status === 'failure') {
		setRoute = {
			status,
			error
		}
	}

	return Route.findOneAndUpdate({token}, {$set: setRoute})
}

module.exports = service
