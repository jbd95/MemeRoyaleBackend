/*
        Main Server File
*/
const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

server.listen(procces.env.PORT)

app.get('/index', function (req, res) {
    res.send("Thanks for visiting")
})
