const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const request = require('supertest')

chai.use(chaiAsPromised)
const should = chai.should()

const app = require('../../app')
const dbConnections = require('../../dbConnections')

describe('app', () => {

	before(() => {
		return dbConnections.setup()
	})

	describe('route', () => {
		describe('/', () => {
			it('should create a route request', () => {
				const requestBody = [
					["22.372081", "114.107877"],
					["22.284419", "114.159510"],
					["22.326442", "114.167811"]
				]

				return request(app)
					.post('/route/')
					.send(requestBody)
					.expect(200)
					.then(res => {
						should.exist(res.body.token)
						res.body.token.should.be.a('string')
					})
			})

			it('should reject single point route request', () => {
				const requestBody = [
					["22.372081", "114.107877"]
				]

				return request(app)
					.post('/route/')
					.send(requestBody)
					.expect(400)
			})

			it('should reject malformed latitude', () => {
				const requestBody = [
					["114.107877", "22.372081"],
					["22.284419", "114.159510"],
					["22.326442", "114.167811"]
				]

				return request(app)
					.post('/route/')
					.send(requestBody)
					.expect(400)
					.then(res => {
						res.text.should.be.equal('Latitude must be within range -90 to 90')
					})
			})

			it('should reject malformed longitude', () => {
				const requestBody = [
					["22.372081", "200.107877"],
					["22.284419", "114.159510"],
					["22.326442", "114.167811"]
				]

				return request(app)
					.post('/route/')
					.send(requestBody)
					.expect(400)
					.then(res => {
						res.text.should.be.equal('Longitude must be within range -180 to 180')
					})
			})
		})

		describe('/:token', () => {
			it('should retrieve route', () => {
				const requestBody = [
					["22.372081", "114.107877"],
					["22.284419", "114.159510"],
					["22.326442", "114.167811"]
				]

				return request(app)
					.post('/route/')
					.send(requestBody)
					.expect(200)
					.then(res => res.body.token)
					.then(token => {
						console.log(token)
						return request(app)
							.get(`/route/${token}`)
							.expect(200)
							.then(res => {
								res.body.status.should.be.equal('in progress')
							})
					})
			})

			it('should reject malformed token', () => {
				const token = '254eefc8-90d1-4748-a800-3519c4a2'
				return request(app)
					.get(`/route/${token}`)
					.expect(400)
			})
		})
	})
})
