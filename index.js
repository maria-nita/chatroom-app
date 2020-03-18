const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const uuid = require('uuid/v4');

uuid(); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'

app.get('/', function(request, response) {
	response.render('index.ejs');
});

app.get('/meeting-setup', function(request, response) {
	response.render('meeting-setup.ejs');
});

io.sockets.on('connection', function(socket) {
	// write all the realtime communication functions here

	socket.on('username', function(username) {
		socket.username = username;
		io.emit('is_online', '🔵 <i>' + socket.username + ' join the chat..</i>');
	});

	socket.on('disconnect', function(username) {
		io.emit('is_online', '🔴 <i>' + socket.username + ' left the chat..</i>');
	})

	socket.on('chat_message', function(message) {
		io.emit('chat_message', '<strong>' + socket.username + '</strong>: ' + message);
	});
});

const server = http.listen(8080, function() {
	console.log('listening on *:8080');
	console.log(uuid());
});