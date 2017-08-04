const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const request = require('supertest')
const bluebird = require('bluebird')
const promiseRetry = require('promise-retry')

chai.use(chaiAsPromised)
const should = chai.should()

describe('e2e', function () {
	const host = 'http://web'

	before(function () {
		return promiseRetry(retry => {
			return request(host)
				.get('/route/not-a-valid-token')
				.catch(retry)
		})
	});

	it('should create a route request and return a token', function () {
		const requestBody = [
			["22.372081", "114.107877"],
			["22.284419", "114.159510"],
			["22.326442", "114.167811"]
		]

		return request(host)
			.post('/route/')
			.send(requestBody)
			.expect(200)
			.then(res => {
				should.exist(res.body.token)
				res.body.token.should.be.a('string')
			})
	});

	it('should retrieve route', function () {
		const requestBody = [
			["22.372081", "114.107877"],
			["22.284419", "114.159510"],
			["22.326442", "114.167811"]
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
	});

	it('should retrieve a successfully computed route', function () {
		const requestBody = [
			["22.372081", "114.107877"],
			["22.284419", "114.159510"],
			["22.326442", "114.167811"]
		]
		const path = [
			["22.3720481", "114.107857"],
			["22.3264374", "114.1678099"],
			["22.2844098", "114.1595265"]
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
	});
});
