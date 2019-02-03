/*
	Main Server File
*/

const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const PORT = process.env.PORT || 3000
const MAX_ROOM_COUNT = 1000000
const mLab = require('mongolab-data-api')('w3f-NV1j2Csrdt0WOoC38yI2Rm2IgAj7')
const DATABASE_NAME = "memeroyale"
const meme = require('./getMeme')
const memegen = require('./memes')

app.use('/meme',meme)
app.set('json spaces', 4)

let sockets = []

http.listen(PORT, function () {
	console.log('listening on *:', PORT)
})

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
	createRoom(newRoom, res)
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
			res.json({rooms : {}})
		}
	})
})

app.get('/users/create', function(req, res)
{

	let newUser = {
		name : req.query.username,
		room : {},
		score : 0,
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


const randomCode = max => {
	return  Math.floor((Math.random() * max) + 1).toString(16).toUpperCase();
}

/*const func1 = token => {

}


const func2 = (token, val2) => {

}*/
			

function createRoom(roomCode, res) { 

	let options = {
		database: DATABASE_NAME,
		collectionName: "Rooms",
		query: JSON.stringify({ code : roomCode.code})
	}

	mLab.listDocuments(options, function(err, data) {
		if (err) throw err;

		if (data.length === 0)
		{
			delete options['query']
			options['documents'] = roomCode
			mLab.insertDocuments(options, function(err, data)
			{
				if (err) throw err;
					res.json({message: "success"})
			})
		}
		else
		{
			res.json({message: "fail - room already exists"})
		}
	})
}

const updateEntry = (dbName, colName, query, updates) => {
	
	let options = {
		database: dbName,
		collectionName: colName,
		data: updates,
		query: query,
	}

	mLab.updateDocuments(options, function(err, data)
	{
		if(err) throw err
		return
	})

}

const submitCaption = (dbName, colName, query, caption, socket) => {
	let options = {
		database: dbName,
		collectionName: colName,
		query: JSON.stringify(query)
	}

	mLab.listDocuments(options, function(err, data)
	{
		if(err) throw err
		if (data.length <= 0)
		{
			return
		}
	
		let replaced = false
		for (let i = 0; i < data[0].captions.length; i++)
		{
			if (data[0].captions[i].name === caption.name)
			{
				data[0].captions[i] = caption
				replaced = true
			}
		}

		if(!replaced)
		{
			data[0].captions.push(caption)
		}

		options['data'] = { captions : data[0].captions}

		mLab.updateDocuments(options, function(err, input)
		{
			if (err) throw err;
			console.log(input)
			socket.emit('debug', 'caption recieved')
		})
	})
}

/* SOCKET IO COMMUNICATION */

io.on('connection', function(socket)
{
	console.log("client connected")

	socket.on('user', function(username)
	{
		sockets.push(socket)
		socket.username = username
		socket.currentRoom = {}
		socket.emit('debug', 'User configured')
	})
	socket.on('room', function(newRoom)
	{
		socket.emit('debug', 'starting room')
		joinRoom(socket, newRoom)
		socket.emit('debug', 'joined new room')
		io.to(socket.currentRoom.code).emit('debug', 'You are in room ' + socket.currentRoom.code)
	})
	socket.on('to_general', function(message)
	{
		console.log("server recieved: " + message)
		io.to("general").emit('general_message', message)
	})

	socket.on('creator', function(data)
	{
		//updateEntry(DATABASE_NAME, 'Rooms', { creator : data.name });)	
	})
		
	socket.on('caption', function(data)
	{
		console.log(data)
		submitCaption(DATABASE_NAME, 'Rooms', { code : data.code }, { name : data.name, caption : data.caption, votes : 0 }, socket) 
	})
	
	socket.on('disconnect', function()
	{
		console.log("client disconnected")
		socket.leave(socket.currentRoom)
	})
})

function sendRoomMessage(roomCode, msgTag, msg)
{

	let ns = io.of("/");

	if(ns)
	{
		for(let id in ns.connected) {
			if (ns.connected[id].rooms[roomCode])
			{
				ns.connected[id].emit(msgTag, msg)
			}
		}
	}
}



function joinRoom(socket, newRoom) {
	
	let options = {
		database: DATABASE_NAME,
		collectionName: "Rooms",
		query: JSON.stringify(newRoom)
	}

	mLab.listDocuments(options, function(err, data) {
		if (err) throw err;

		if (data.length === 0)
		{
			socket.emit('debug', 'fail - room does not exist')
		}
		else
		{
			if(socket.currentRoom.code !== {}) {
				socket.leave(socket.currentRoom.code)
			}
			socket.join(newRoom.code)
			socket.currentRoom = newRoom
			socket.emit('debug', 'success')
		}
	})
	
	options = {
		database: DATABASE_NAME,
		collectionName: "Users",
		data: { room : socket.currentRoom.code},
		query: JSON.stringify({ name : socket.username })
	}

	mLab.updateDocuments(options, function(err, data) {
		if (err) throw err;
	})
}
