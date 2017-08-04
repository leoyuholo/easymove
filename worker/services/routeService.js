const googleDirectionsAlgorithm = require('../algorithms/googleDirections')

const service = {}

service.computeRoute = (start, dropoffs) => {
	return googleDirectionsAlgorithm.computeRoute(start, dropoffs)
}

module.exports = service
