/*
        Main Server File
*/

const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const PORT = process.env.PORT || 3000
const MAX_ROOM_COUNT = 1000000
const mLab = require('mongolab-data-api')('w3f-NV1j2Csrdt0WOoC38yI2Rm2IgAj7')
const DATABASE_NAME = "memeroyale"
let All_Rooms = []

http.listen(PORT, function () {
    console.log('listening on *:', PORT)
})

app.get('/', function (req, res) {
    res.json({ message: "success" })
})

app.get('/index', function (req, res) {
    res.send("Thanks for visiting")
})

//app.get('/room/join', function (req, res) {
//    res.json({'value' : key})
//})

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
    //res.json({ message : "room added" })
})

app.get('/rooms', function (req, res) { 
   
    let options = {
        database: DATABASE_NAME,
	collectionName: "Rooms"
    }
    mLab.listDocuments(options, function(err, data) {
        if (err) throw err;

	if(data)
	{
		res.json({rooms : data})
	}
	else
	{
		res.json({rooms : {}})
	}
    })
})

/* SOCKET IO COMMUNICATION */
io.on('connection', function (socket) {
    console.log("client connected to socket")


})

const randomCode = max => {
    let proposedCode = Math.floor((Math.random() * max) + 1).toString(16).toUpperCase();
    if (!(proposedCode in All_Rooms)) {
        return proposedCode
    }
    return randomCode(max)
}

const func1 = token => {

}


const func2 = (token, val2) => {

}


function createRoom(roomCode, res) { 
    
    let options = {
        database: DATABASE_NAME,
	collectionName: "Rooms",
        query: JSON.stringify(roomCode)
    }

    mLab.listDocuments(options, function(err, data) {
        if (err) throw err;

	if (!data)
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

function joinRoom(socket, roomCode) {
    if (roomCode in All_Rooms) {
        socket.leave(socket.currentRoom)
        socket.join(roomCode)
        socket.currentRoom = roomCode
        console.log("client changed room")
    }
}
