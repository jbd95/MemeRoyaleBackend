/*
        Main Server File
*/
const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const PORT = process.env.PORT || 3001

server.listen(PORT)

app.get('/index', function (req, res) {
    res.send("Thanks for visiting")
})
