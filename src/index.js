/*
        Main Server File
*/

const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const PORT = process.env.PORT || 5001
const MAX_ROOM_COUNT = 1000000
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
    if (createRoom(newRoom)) {
        res.json({ 'message': 'success' })
    }
    else {
        res.json({ 'message': 'fail - name needs to be unique' })
    }
})

app.get('/rooms', function (req, res) {
    res.json({ 'rooms': All_Rooms })
})

/* SOCKET IO COMMUNICATION */
io.on('connection', function (socket) {
    console.log("client connected to socket")


})

const randomCode = max => {
    let proposedCode = Math.floor((Math.random() * max) + 1).toString(16).toUpperCase();
    if (!(proposedCode in All_Rooms)) {
        return proposedCode;
    }
    return randomCode(max);
}

const func1 = token => {

}


const func2 = (token, val2) => {

}
function createRoom(roomCode) {
    if (!(roomCode in All_Rooms)) {
        All_Rooms.push(roomCode)
        return true;
    }
    return false;
}

function joinRoom(socket, roomCode) {
    if (roomCode in All_Rooms) {
        socket.leave(socket.currentRoom)
        socket.join(roomCode)
        socket.currentRoom = roomCode
        console.log("client changed room")
    }
}
