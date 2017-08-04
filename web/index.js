const express = require('express')
const bodyParser = require('body-parser')
const config = require('config')

const dbConnections = require('./dbConnections')
const route = require('./routes/route')
const routeResultSubscriber = require('./subscribers/routeResultSubscriber')

const app = express()

app.use(bodyParser.json({limit: '100mb', type: '*/*'}))

app.use('/route', route)

dbConnections.setup()
	.then(() => routeResultSubscriber.subscribe(config.get('queues.routeResult')))
	.then(() => {
		app.listen(config.get('port'), () => {
			console.log(`web started listening on port ${config.get('port')}`)
		})
	})
