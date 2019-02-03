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
const memegen = require('./memes')
const main = require('./mainRouter')
let mLabHelpers = require('./mLabHelpers')

app.set('json spaces', 4)
app.use('/',main)

let sockets = []

http.listen(PORT, function () {
	console.log('listening on *:', PORT)
})


const randomCode = max => {
	return  Math.floor((Math.random() * max) + 1).toString(16).toUpperCase();
}

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

	socket.on('creator', function(data)
	{
		console.log('received update for creator')
		mLabHelpers.updateEntry(DATABASE_NAME, 'Rooms', { code : data.code }, { creator : data.name })	
	})
		
	socket.on('caption', function(data)
	{
		console.log(data)
		mLabHelpers.submitCaption(DATABASE_NAME, 'Rooms', { code : data.code }, { name : data.name, caption : data.caption, votes : 0 }, socket) 
	})
	
	socket.on('disconnect', function()
	{
		console.log("client disconnected")
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
