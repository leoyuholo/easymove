const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const request = require('supertest')
const bluebird = require('bluebird')
const promiseRetry = require('promise-retry')

chai.use(chaiAsPromised)
const should = chai.should()

describe('e2e', () => {
	const host = 'http://web'

	before(() => {
		return promiseRetry(retry => {
			return request(host)
				.get('/route/not-a-valid-token')
				.catch(retry)
		})
	})

	it('should create a route request and return a token', () => {
		const requestBody = [
			['22.372081', '114.107877'],
			['22.284419', '114.159510'],
			['22.326442', '114.167811']
		]

		return request(host)
			.post('/route/')
			.send(requestBody)
			.expect(200)
			.then(res => {
				should.exist(res.body.token)
				res.body.token.should.be.a('string')
			})
	})

	it('should retrieve route', () => {
		const requestBody = [
			['22.372081', '114.107877'],
			['22.284419', '114.159510'],
			['22.326442', '114.167811']
		]

		return request(host)
			.post('/route/')
			.send(requestBody)
			.expect(200)
			.then(res => res.body.token)
			.then(token => {
				return request(host)
					.get(`/route/${token}`)
					.expect(200)
					.then(res => {
						res.body.status.should.be.equal('in progress')
					})
			})
	})

	it('should retrieve a successfully computed route', () => {
		const requestBody = [
			['22.372081', '114.107877'],
			['22.284419', '114.159510'],
			['22.326442', '114.167811']
		]
		const path = [
			['22.3720481', '114.107857'],
			['22.3264374', '114.1678099'],
			['22.2844098', '114.1595265']
		]
		const totalDistance = 18132
		const totalTime = 1755

		return request(host)
			.post('/route/')
			.send(requestBody)
			.expect(200)
			.then(res => res.body.token)
			.then(token => bluebird.delay(1500).then(() => token))
			.then(token => {
				return request(host)
					.get(`/route/${token}`)
					.expect(200)
					.then(res => {
						res.body.status.should.be.equal('success')
						res.body.path.should.be.deep.equal(path)
						res.body.total_distance.should.be.equal(totalDistance)
						res.body.total_time.should.be.equal(totalTime)
					})
			})
	})

	it('should retrieve a failed route', () => {
		const requestBody = [
			['22.284419', '114.159510'],
			['22.326442', '114.167811'],
			['22.3353481', '114.1761146'],
			['22.4311816', '114.215094'],
			['22.2619385', '114.1295144'],
			['22.2466607', '114.1757239'],
			['22.3129666', '114.0412819'],
			['22.308047', '113.9184808'],
			['22.2758835', '114.145532'],
			['22.3371045', '114.1747205'],
			['22.337127', '114.17279'],
			['22.4162632', '114.2109318'],
			['22.2829989', '114.1370848'],
			['22.3363998', '114.2654655'],
			['22.28588', '114.158131'],
			['22.284419', '114.159510'],
			['22.326442', '114.167811'],
			['22.3353481', '114.1761146'],
			['22.4311816', '114.215094'],
			['22.2619385', '114.1295144'],
			['22.2466607', '114.1757239'],
			['22.3129666', '114.0412819'],
			['22.308047', '113.9184808'],
			['22.2758835', '114.145532'],
			['22.3371045', '114.1747205'],
			['22.337127', '114.17279'],
			['22.4162632', '114.2109318'],
			['22.2829989', '114.1370848'],
			['22.3363998', '114.2654655'],
			['22.28588', '114.158131']
		]

		return request(host)
			.post('/route/')
			.send(requestBody)
			.expect(200)
			.then(res => res.body.token)
			.then(token => bluebird.delay(1500).then(() => token))
			.then(token => {
				return request(host)
					.get(`/route/${token}`)
					.expect(200)
					.then(res => {
						res.body.status.should.be.equal('failure')
						res.body.error.should.be.equal('Too many dropoffs in the request (29). The maximum allowed dropoffs for this request is 24.')
					})
			})
	})
})
