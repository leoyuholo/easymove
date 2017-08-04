const path = require('path')
const chai = require('chai')
const nock = require('nock')

const googleDirectionsAlgorithm = require('../../algorithms/googleDirections')

const should = chai.should()

describe('algorithms', () => {
	describe('computeRoute', () => {
		const nockBack = nock.back
		nockBack.setMode('record')
		nockBack.fixtures = path.join(__dirname, '/nockFixtures')
		const nockBackPromisified = (filename) => {
			return new Promise((resolve, reject) => {
				nockBack(filename, nockDone => resolve(nockDone))
			})
		}

		it('should find path, distance and time', () => {
			return nockBackPromisified('directions.json')
				.then(nockDone => {
					const start = ['22.372081', '114.107877']
					const dropoffs = [
						['22.284419', '114.159510'],
						['22.326442', '114.167811']
					]
					const path = [
						[22.3720481, 114.107857],
						[22.3264374, 114.1678099],
						[22.2844098, 114.1595265]
					]
					const totalDistance = 18132
					const totalTime = 1755

					return googleDirectionsAlgorithm.computeRoute(start, dropoffs)
						.then(route => {
							route.path.should.be.deep.equal(path)
							route.totalDistance.should.be.equal(totalDistance)
							route.totalTime.should.be.equal(totalTime)
						})
						.then(nockDone)
				})
		})

		it('should find path with only one dropoff', () => {
			return nockBackPromisified('one_dropoff.json')
				.then(nockDone => {
					const start = ['22.372081', '114.107877']
					const dropoffs = [
						['22.284419', '114.159510']
					]
					const path = [
						[22.3720481, 114.107857],
						[22.2844098, 114.1595265]
					]
					const totalDistance = 15518
					const totalTime = 995

					return googleDirectionsAlgorithm.computeRoute(start, dropoffs)
						.then(route => {
							route.path.should.be.deep.equal(path)
							route.totalDistance.should.be.equal(totalDistance)
							route.totalTime.should.be.equal(totalTime)
						})
						.then(nockDone)
				})
		})

		it('should find path with many dropoffs', () => {
			return nockBackPromisified('many_dropoffs.json')
				.then(nockDone => {
					const start = ['22.372081', '114.107877'] // tsuen wan
					const dropoffs = [
						['22.284419', '114.159510'], // hong kong station
						['22.326442', '114.167811'], // prince edward
						['22.3353481', '114.1761146'], // innocenter
						['22.4311816', '114.215094'], // science park
						['22.2619385', '114.1295144'], // cyberport
						['22.2466607', '114.1757239'], // ocean park
						['22.3129666', '114.0412819'], // disney
						['22.308047', '113.9184808'], // airport
						['22.2758835', '114.145532'], // victoria peak
						['22.3371045', '114.1747205'], // festival walk
						['22.337127', '114.17279'], // cityu
						['22.4162632', '114.2109318'], // cuhk
						['22.2829989', '114.1370848'], // hku
						['22.3363998', '114.2654655'], // hkust
						['22.28588', '114.158131'] // ifc
					]
					const path = [
						[22.3720481, 114.107857],
						[22.3264374, 114.1678099],
						[22.3353048, 114.1757062],
						[22.3372351, 114.1727785],
						[22.3373288, 114.174766],
						[22.4160458, 114.2106948],
						[22.4267453, 114.2130474],
						[22.3365004, 114.2650157],
						[22.246737, 114.175666],
						[22.276304, 114.1456563],
						[22.282659, 114.137257],
						[22.2620283, 114.1293508],
						[22.286168, 114.1582973],
						[22.2844098, 114.1595265],
						[22.3142587, 114.0403563],
						[22.2970161, 113.9203579]
					]
					const totalDistance = 143016
					const totalTime = 13517

					return googleDirectionsAlgorithm.computeRoute(start, dropoffs)
						.then(route => {
							route.path.should.be.deep.equal(path)
							route.totalDistance.should.be.equal(totalDistance)
							route.totalTime.should.be.equal(totalTime)
						})
						.then(nockDone)
				})
		})

		it('should fail with too many dropoffs', () => {
			return nockBackPromisified('too_many_dropoffs.json')
				.then(nockDone => {
					const start = ['22.372081', '114.107877']
					const dropoffs = [
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
						['22.28588', '114.158131'],
					]
					const errorMessage = 'Too many dropoffs in the request (30). The maximum allowed dropoffs for this request is 24.'

					return googleDirectionsAlgorithm.computeRoute(start, dropoffs)
						.catch(err => {
							should.exist(err)
							err.message.should.be.equal(errorMessage)
						})
						.then(route => {
							// should not be a successful call
							should.not.exist(route)
						})
						.then(nockDone)
				})
		})
	})
})
