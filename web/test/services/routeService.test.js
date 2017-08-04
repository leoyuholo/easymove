const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

chai.use(sinonChai)
chai.should()

const dbConnections = require('../../dbConnections')
const routeService = require('../../services/routeService')

describe('services', () => {

	before(() => {
		return dbConnections.setup()
	})

	beforeEach(() => {
		sinon.stub(dbConnections.amqp, 'sendToWorker').resolves()
	})

	afterEach(() => {
		dbConnections.amqp.sendToWorker.restore()
	})

	describe('routeService', () => {
		describe('createRequest', () => {
			it('should a promise that resolve to a token', () =>{
				const start = ["22.372081", "114.107877"]
				const dropoffs = [
					["22.284419", "114.159510"],
					["22.326442", "114.167811"]
				]

				return routeService.createRequest(start, dropoffs)
					.then(token => {
						token.should.be.a('string')
					})
			})

			it('should call sendToWorker', () =>{
				const start = ["22.372081", "114.107877"]
				const dropoffs = [
					["22.284419", "114.159510"],
					["22.326442", "114.167811"]
				]

				return routeService.createRequest(start, dropoffs)
					.then(token => {
						dbConnections.amqp.sendToWorker.should.be.calledOnce
					})
			})
		})

		describe('findRoute', () => {
			it('should find a created route by token', () => {
				const start = ["22.372081", "114.107877"]
				const dropoffs = [
					["22.284419", "114.159510"],
					["22.326442", "114.167811"]
				]

				return routeService.createRequest(start, dropoffs)
					.then(token => routeService.findRoute(token))
					.then(route => {
						route.start.should.be.deep.equal(start)
						route.dropoffs.should.be.deep.equal(dropoffs)
					})
			})
		})

		describe('updateRoute', () => {
			it('should update success route', () => {
				const start = ["22.372081", "114.107877"]
				const dropoffs = [
					["22.284419", "114.159510"],
					["22.326442", "114.167811"]
				]
				const status = 'success'
				const path = [
					["22.372081", "114.107877"],
					["22.326442", "114.167811"],
					["22.284419", "114.159510"]
				]
				const totalDistance = 20000
				const totalTime = 1800

				return routeService.createRequest(start, dropoffs)
					.then(token =>
						routeService.updateRoute({token, status, path, totalDistance, totalTime})
							.then(() => routeService.findRoute(token))
							.then(route => {
								route.status.should.be.equal(status)
								route.path.should.be.deep.equal(path)
								route.totalDistance.should.be.equal(totalDistance)
								route.totalTime.should.be.equal(totalTime)
							})
					)
			})

			it('should update failure error', () => {
				const start = ["22.372081", "114.107877"]
				const dropoffs = [
					["22.284419", "114.159510"],
					["22.326442", "114.167811"]
				]
				const status = 'failure'
				const error = {
					message: 'ERROR_DESCRIPTION'
				}

				return routeService.createRequest(start, dropoffs)
					.then(token =>
						routeService.updateRoute({token, status, error})
							.then(() => routeService.findRoute(token))
							.then(route => {
								route.status.should.be.equal(status)
								route.error.should.be.deep.equal(error)
							})
					)
			})
		})
	})
})
