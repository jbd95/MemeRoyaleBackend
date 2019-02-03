var io = require('socket.io-client');

var socket = io('http://34.238.153.107/');

socket.on('connect', function () {
    console.log("connected to server");
    socket.emit('user', process.argv[2]);
    socket.emit('room', { name: process.argv[3], code: process.argv[4] })
});

socket.on('debug', function (data) {
    console.log("recieved from server: " + data);
    socket.emit('message', 'hello from client');
});

socket.on('general_message', function (data)
{
    console.log("general chat: " + data);
})

socket.on('relay_message', function (data) {
    console.log("relayed: " + data);
});

socket.on('disconnect', function () {
    console.log("socket disconnected");
});
