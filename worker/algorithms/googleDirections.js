const googleMaps = require('@google/maps')
const config = require('config')
const _ = require('lodash')

const algorithm = {}

const googleMapsClient = googleMaps.createClient({
	Promise,
	key: config.get('apiKeys.google.maps')
})

const query = (origin, destination, waypoints) => {
	return googleMapsClient.directions({origin, destination, waypoints, mode: 'driving', optimize: true})
		.asPromise()
		.then(response => {
			if (response.json.error_message)
				throw new Error(response.json.error_message)
			return response
		})
		.then(response => response.json.routes[0].legs)
		.then(legs => {
			const start = [legs[0].start_location.lat, legs[0].start_location.lng]
			const path = legs.map(leg => ([leg.end_location.lat, leg.end_location.lng]))
			const readablePath = [legs[0].start_address].concat(legs.map(leg => (leg.end_address)))
			return {
				readablePath,
				path: [start].concat(path),
				totalDistance: _.sum(legs.map(leg => leg.distance.value)),
				totalTime: _.sum(legs.map(leg => leg.duration.value))
			}
		})
}

algorithm.computeRoute = (start, dropoffs) => {
	const queries = dropoffs.map(dropoff => query(start, dropoff, _.without(dropoffs, dropoff)))
	return Promise.all(queries)
		.then(routes => _.minBy(routes, 'totalDistance'))
}

module.exports = algorithm
