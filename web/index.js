const config = require('config')

const app = require('./app')
const dbConnections = require('./dbConnections')
const routeResultSubscriber = require('./subscribers/routeResultSubscriber')

dbConnections.setup()
	.then(() => routeResultSubscriber.subscribe(config.get('queues.routeResult')))
	.then(() => {
		app.listen(config.get('port'), () => {
			console.log(`web started listening on port ${config.get('port')}`)
		})
	})
