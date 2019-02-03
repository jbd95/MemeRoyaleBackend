const express = require('express')
const app = express.Router()
const mLab = require('mongolab-data-api')('w3f-NV1j2Csrdt0WOoC38yI2Rm2IgAj7')
let mLabHelpers = require('./mLabHelpers')
const meme = require('./getMeme')
const DATABASE_NAME = "memeroyale"

app.use('/meme',meme)


app.get('/', function (req, res) {
	res.json({ message: "success" })
})

app.get('/index', function (req, res) {
	res.send("Thanks for visiting")
})

app.get('/rooms/msg', function (req, res) {
   
	sendRoomMessage(req.query.code, req.query.tag, req.query.msg)
	res.send("thanks")
})

app.get('/rooms/create', function (req, res) {

	let newRoom = {
		name: '',
		code: randomCode(MAX_ROOM_COUNT),
		creator: "",
		currentChooser: "",
		isActive: 0,
		hasStarted: 0,
		isMemeSelected: 0,
		currentMeme: {},
		captions: [],
		isSubmissionEnded: 0,
		isVotingEnded: 0
	}

	if (req.query.name && req.query.name !== "") {
		newRoom.name = req.query.name
	}
	else {
		newRoom.name = newRoom.code
	}
	mLabHelpers.createRoom(newRoom, res)
})

app.get('/rooms', function (req, res) { 

	let options = {
		database: DATABASE_NAME,
		collectionName: "Rooms"
	}
	mLab.listDocuments(options, function(err, data) {
		if (err) throw err;

		if(data.length !== 0)
		{
			res.json({rooms : data})
		}
		else
		{
			res.json({rooms: []})
		}
	})
})

app.get('/users/create', function(req, res)
{

	let newUser = {
		name : req.query.username,
		room : {},
		score : 0
	}

	let options = {
		database: DATABASE_NAME,
		collectionName: "Users",
		query: JSON.stringify({ name : req.query.username})
	}

	mLab.listDocuments(options, function(err, data) {
			if (err) throw err;

			if (data.length === 0)
			{
				delete options['query']
				options['documents'] = newUser
				mLab.insertDocuments(options, function(err, data)
				{
					if (err) throw err;
						res.json({message: "success"})
				})
			}
			else
			{
				res.json({message: "fail - user already exists"})
			}
	})

})

app.get('/users', function(req, res)
{
	let options = {
		database: DATABASE_NAME,
		collectionName: "Users",
		query: JSON.stringify({ name : req.query.username})
	}

	if (req.query.username)
	{
		mLab.listDocuments(options, function(err, data) {
			if (err) throw err;

			if (data.length === 0)
			{
				res.json({ message: "fail - user does not exist" })
			}
			else
			{
				res.json(data[0])
			}
		})
	}
	else if(req.query.room)
	{
		options['query'] = JSON.stringify({ room : req.query.room})
		mLab.listDocuments(options, function(err, data) {
			if (err) throw err;

			if (data.length === 0)
			{
				res.json({ users : [] })
			}
			else
			{
				res.json( { users : data })
			}
		})
	}


})

module.exports = app;
