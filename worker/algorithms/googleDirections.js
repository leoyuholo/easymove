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
		.catch(response => {
			throw new Error(response.json ? response.json.error_message : response.message)
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
	if (dropoffs.length > 24)
		return Promise.reject(new Error(`Too many dropoffs in the request (${dropoffs.length}). The maximum allowed dropoffs for this request is 24.`))
	const queries = dropoffs.map(dropoff => query(start, dropoff, _.without(dropoffs, dropoff)))
	return Promise.all(queries)
		.then(routes => _.minBy(routes, 'totalDistance'))
}

module.exports = algorithm
