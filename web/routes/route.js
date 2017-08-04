const express = require('express')
const Joi = require('joi')

const routeService = require('../services/routeService')

const router = express.Router()

const latlngSchema = Joi.array().length(2).ordered(
	Joi.number().min(-90).max(90).required().error(new Error('Latitude must be within range -90 to 90')),
	Joi.number().min(-180).max(180).required().error(new Error('Longitude must be within range -180 to 180'))
).required()
const routeRequestSchema = Joi.array().min(2).items(latlngSchema)
router.post('/', (req, res) => {
	const result = Joi.validate(req.body, routeRequestSchema)
	if (result.error) { return res.status(400).send(result.error.message) }
	const [start, ...dropoffs] = req.body

	routeService.createRequest(start, dropoffs)
		.then(token => {
			res.json({token})
		})
		.catch(err => {
			console.log(err)
		})
})

const tokenSchema = Joi.object().keys({
	token: Joi.string().uuid({version: 'uuidv4'})
})
router.get('/:token', (req, res) => {
	const result = Joi.validate(req.params, tokenSchema)
	if (result.error) { return res.status(400).send(result.error.message) }
	const token = req.params.token

	routeService.findRoute(token)
		.then(route => {
			if (!route) { return res.status(404).send() }

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
