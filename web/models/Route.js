const mongoose = require('mongoose')
const uuidv4 = require('uuid/v4')

const genToken = () => uuidv4()

const schema = new mongoose.Schema({
	token: {type: String, default: genToken},
	start: [String],
	dropoffs: [[String]],
	error: {
		message: String
	},
	status: {type: String, default: 'in progress'},
	path: [[String]],
	totalDistance: Number,
	totalTime: Number
})

schema.index({token: 1}, {unique: 1})

const Route = mongoose.model('Route', schema)

module.exports = Route
