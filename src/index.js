/*
	Main Server File
*/

const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const PORT = process.env.PORT || 4000
const MAX_ROOM_COUNT = 1000000
const mLab = require('mongolab-data-api')('w3f-NV1j2Csrdt0WOoC38yI2Rm2IgAj7')
const DATABASE_NAME = "memeroyale"
const meme = require('./getMeme')
const memegen = require('./memes')

app.use('/meme',meme)

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

app.get('/room/join', function (req, res) {
    
})

app.get('/rooms/create', function (req, res) {

	let newRoom = {
		name: '',
		code: randomCode(MAX_ROOM_COUNT)
	}

	if (req.query.name) {
		newRoom.name = req.query.name
	}
	else {
		newRoom.name = newRoom.code
	}
	createRoom(newRoom, res)



	function createRoom(roomCode, res) { 

		let options = {
			database: DATABASE_NAME,
			collectionName: "Rooms",
			query: JSON.stringify(roomCode)
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

app.get('/user/add', function(req, res)
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

app.get('/user', function(req, res)
{
	let options = {
		database: DATABASE_NAME,
		collectionName: "Users",
		query: JSON.stringify({ name : req.query.username})
	}

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
})


const randomCode = max => {
	let proposedCode = Math.floor((Math.random() * max) + 1).toString(16).toUpperCase();
	if (!(proposedCode in All_Rooms)) {
		return proposedCode
	}
	return randomCode(max)
}

/*const func1 = token => {

}


const func2 = (token, val2) => {

}*/
			


/* SOCKET IO COMMUNICATION */
io.on('connection', function (socket) {
	console.log("client connected to socket")


})


io.on('connection', function(socket)
{
	console.log("client connected")
	//socket.emit('message', "hello client");

	socket.on('user', function(username)
	{
		sockets.push({ name : username, connection : socket})
		socket.username = username
		socket.currentRoom = ""
		socket.emit('debug', 'User configured')
	});
	socket.on('room', function(newRoom)
	{
		joinRoom(socket, newRoom)
	});
	socket.on('to_general', function(message)
	{
		console.log("server recieved: " + message);
		io.to("general").emit('general_message', message);
	});
	
	socket.on('disconnect', function()
	{
		console.log("client disconnected");
		socket.leave(socket.currentRoom);
	});
});

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
			if(socket.currentRoom !== "") {
				socket.leave(socket.currentRoom)
			}
			socket.join(newRoom)
			socket.currentRoom = newRoom
			socket.emit('debug', 'success')
		}
	})

}
