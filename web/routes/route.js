const express = require('express')

const routeService = require('../services/routeService')

const router = express.Router()

router.post('/', (req, res) => {
	const [start, ...dropoffs] = req.body

	routeService.createRequest(start, dropoffs)
		.then(token => {
			res.json({token})
		})
})

router.get('/:token', (req, res) => {
	const token = req.params.token

	routeService.findRoute(token)
		.then(route => {
			if (!route)
				return res.status(404).send()

			if (route.status === 'success') {
				return res.json({
					status: route.status,
					path: route.path,
					total_distance: route.totalDistance,
					total_time: route.totalTime
				})
			} else if (route.status === 'in progress') {
				return res.json({status: route.status})
			} else if (route.status === 'error') {
				return res.json({status: route.status, error: route.error.message})
			} else {
				console.error(`unknown route status ${route.status}`)
				res.status(500).send()
			}
		})
})

module.exports = router
