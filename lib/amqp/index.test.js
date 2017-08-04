const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const bluebird = require('bluebird')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

chai.use(sinonChai)
chai.use(chaiAsPromised)
chai.should()

const amqp = require('./index')

describe('amqp', () => {
	const queues = {
		routeRequest: {name: 'lib.amqp.test.route.request', options: {durable: true}}
	}

	before(() => {
		return amqp.setup('amqp://rabbitmq', queues)
	})

	it('should send task to worker', () => {
		const request = {
			start: ["22.372081", "114.107877"],
			dropoffs: [
				["22.284419", "114.159510"],
				["22.326442", "114.167811"]
			]
		}

		const consummerStub = sinon.stub()
		consummerStub.resolves()

		return amqp.receiveWork(queues.routeRequest.name, consummerStub)
			.then(unsubscribe =>
				amqp.sendToWorker(queues.routeRequest.name, request)
					.then(() => bluebird.delay(1500))
					.then(() => {
						consummerStub.should.be.calledOnce
						consummerStub.firstCall.args[0].start.should.be.deep.equal(request.start)
						consummerStub.firstCall.args[0].dropoffs.should.be.deep.equal(request.dropoffs)
					})
					.then(() => unsubscribe())
			)
	})
})
