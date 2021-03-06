/*
	Main Server File
*/

const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const PORT = process.env.PORT || 3000
const mLab = require('mongolab-data-api')(/*INSERT MLAB API KEY HERE*/)
const DATABASE_NAME = "memeroyale"
const memegen = require('./memes')
const main = require('./mainRouter')
let mLabHelpers = require('./mLabHelpers')

app.set('json spaces', 4)
app.use('/',main)

let sockets = []

http.listen(PORT, function () {
	console.log('listening on *:', PORT)
})


/* SOCKET IO COMMUNICATION */

io.on('connection', function(socket)
{
	console.log("client connected")

	socket.on('user', function(username)
	{
		sockets.push(socket)
		socket.username = username
		socket.currentRoom = { name : "", code : ""}
	})
	socket.on('room', function(newRoom)
	{
		joinRoom(socket, newRoom)
        io.to(getCurrentRoom(socket)).emit('debug', 'You are in room ' + getCurrentRoom(socket))
	})
	socket.on('to_general', function(message)
	{
		console.log("server recieved: " + message)
		io.to("general").emit('general_message', message)
	})


	/* SET FUNCTIONS*/
	socket.on('creator', function(data)
	{
		mLabHelpers.updateEntry(DATABASE_NAME, 'Rooms', { code : data.code }, { creator : data.name, currentChooser: data.name })	
	})
		
	socket.on('caption', function(data)
	{
		mLabHelpers.submitCaption(DATABASE_NAME, 'Rooms', { code : data.code }, { name : data.name, caption : data.caption, votes : 0 }, socket) 
	})

	socket.on('picker', function(data)
	{
		mLabHelpers.updateEntry(DATABASE_NAME, 'Rooms', { code : data.code }, { currentChooser : data.name})
	})
	
	socket.on('active', function(data)
	{
		mLabHelpers.updateEntry(DATABASE_NAME, 'Rooms', { code : data.code }, { isActive : data.value })
	})

	socket.on('meme_selected', function(data)
	{
		mLabHelpers.updateEntry(DATABASE_NAME, 'Rooms', { code : data.code }, { isMemeSelected : data.value })
	})
	
	socket.on('started', function(data)
	{
		mLabHelpers.updateEntry(DATABASE_NAME, 'Rooms', { code : data.code }, { hasStarted : value })
	})

	socket.on('current_meme', function(data)
	{
		mLabHelpers.updateEntry(DATABASE_NAME, 'Rooms', { code : data.code }, { currentMeme : data.value})
	})

	socket.on('submission_ended', function(data)
	{
		mLabHelpers.updateEntry(DATABASE_NAME, 'Rooms', { code : data.code }, { isSubmissionEnded : data.value })
	})

	socket.on('voting_ended', function(data)
	{
		mLabHelpers.updateEntry(DATABASE_NAME, 'Rooms', { code : data.code }, { isVotingEnded : data.value})
	})


	/* GET FUNCTIONS */
	/*socket.on('get_room', function(data)
	{
		mLabHelpers.getEntry(DATABASE_NAME, 'Rooms', { code : data.code }, socket, 'room')
	}*/


	socket.on('disconnect', function()
	{
		console.log("client disconnected")
		joinRoom(socket, { name: '', code: '' })
		socket.leave(getCurrentRoom(socket))
	})
})

function getCurrentRoom(socket)
{
    if (!socket.currentRoom)
    {
        socket.currentRoom = { name: "", code: "" }
        return socket.currentRoom.code
    }
    return socket.currentRoom.code
}

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
            		if (getCurrentRoom(socket) !== {}) {
                		socket.leave(getCurrentRoom(socket))
			}
			socket.join(newRoom.code)
			socket.currentRoom = newRoom
			//socket.emit('debug', 'success')
		}
	})
	
	options = {
		database: DATABASE_NAME,
		collectionName: "Users",
        data: { room: getCurrentRoom(socket)},
		query: JSON.stringify({ name : socket.username })
	}

	mLab.updateDocuments(options, function(err, data) {
		if (err) throw err;
	})
}
