const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const uuid = require('uuid/v4');

app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

uuid(); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'

const rooms = { };

app.get('/', function(request, response) {
	response.render('index', { rooms: rooms });
});

app.post('/room', function(request, response) {
	if (rooms[request.body.room] != null) {
		return response.redirect('/');
	}
	rooms[request.body.room] = { users: {} };
	response.redirect(request.body.room);
	//send message that new room was created
	io.emit('room-created', request.body.room);
});

app.get('/:room', function(request, response) {
	if (rooms[request.params.room] == null) {
		return response.redirect('/');
	}
	response.render('room', {roomName: request.params.room});
});

// app.get('/meeting-setup', function(request, response) {
// 	response.render('meeting-setup.ejs');
// });

io.sockets.on('connection', function(socket) {
	// write all the realtime communication functions here

	socket.on('username', function(room, username) {
		socket.join(room);
		rooms[room].users[socket.username] = username;
		// socket.username = username;
		socket.to(room).broadcast.emit('is_online', '🔵 <i>' + rooms[room].users[socket.username] + ' join the chat..</i>');
		// io.emit('is_online', '🔵 <i>' + socket.username + ' join the chat..</i>');
	});

	socket.on('disconnect', function(username) {
		getUserRooms(socket).forEach(room => {
			socket.to(room).broadcast.emit('is_online', '🔴 <i>' + rooms[room].users[socket.username] + ' left the chat..</i>');
			io.emit('is_online', '🔴 <i>' + rooms[room].users[socket.username] + ' left the chat..</i>');
			delete rooms[room].users[socket.username];
		});
	})

	socket.on('chat_message', function(room, message) {
		socket.to(room).broadcast.emit('chat_message', '<strong>' + rooms[room].users[socket.username] + '</strong>: ' + message);
		// io.emit('chat_message', '<strong>' + socket.username + '</strong>: ' + message);
	});
});

const server = http.listen(8080, function() {
	console.log('listening on *:8080');
	// console.log(uuid());
});

function getUserRooms(socket) {
	return Object.entries(rooms).reduce((names, [name, room]) => {
		if (room.users[socket.username] != null) names.push(name)
		return names
	}, [])
  }