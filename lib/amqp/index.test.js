const chai = require('chai')
const bluebird = require('bluebird')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const config = require('config')

chai.use(sinonChai)
chai.should()

const amqp = require('./index')

describe('amqp', () => {
	const uri = config.get('rabbitmq.uri')
	const queues = {
		routeRequest: {name: config.get('queues.routeRequest'), options: {durable: true}}
	}

	before(() => {
		return amqp.setup(uri, queues)
	})

	it('should send task to worker', () => {
		const request = {
			start: ['22.372081', '114.107877'],
			dropoffs: [
				['22.284419', '114.159510'],
				['22.326442', '114.167811']
			]
		}

		const consummerStub = sinon.stub()
		consummerStub.resolves()

		return amqp.receiveWork(queues.routeRequest.name, consummerStub)
			.then(unsubscribe =>
				amqp.sendToWorker(queues.routeRequest.name, request)
					.then(() => bluebird.delay(1500))
					.then(() => {
						consummerStub.callCount.should.be.equal(1)
						consummerStub.firstCall.args[0].start.should.be.deep.equal(request.start)
						consummerStub.firstCall.args[0].dropoffs.should.be.deep.equal(request.dropoffs)
					})
					.then(() => unsubscribe())
			)
	})

	it('should send task to worker', () => {
		const request = {
			start: ['22.372081', '114.107877'],
			dropoffs: [
				['22.284419', '114.159510'],
				['22.326442', '114.167811']
			]
		}

		const consummerStub = sinon.stub()
		consummerStub.onFirstCall().rejects(new Error('First call should be rejected'))
		consummerStub.onSecondCall().resolves()

		return amqp.receiveWork(queues.routeRequest.name, consummerStub)
			.then(unsubscribe =>
				amqp.sendToWorker(queues.routeRequest.name, request)
					.then(() => bluebird.delay(1500))
					.then(() => {
						consummerStub.callCount.should.be.equal(2)
						consummerStub.firstCall.args[0].start.should.be.deep.equal(request.start)
						consummerStub.firstCall.args[0].dropoffs.should.be.deep.equal(request.dropoffs)
						consummerStub.secondCall.args[0].start.should.be.deep.equal(request.start)
						consummerStub.secondCall.args[0].dropoffs.should.be.deep.equal(request.dropoffs)
					})
					.then(() => unsubscribe())
			)
	})
})
