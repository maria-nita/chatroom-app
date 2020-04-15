var socket = io.connect('http://localhost:8080');
// submit text message without reload/refresh the page
const chatElements = {
	form: document.querySelector('#chatForm'),
	text: document.querySelector('#txt'),
	messages: document.querySelector('#messages')
}

const roomElements = {
	container: document.querySelector('#room-container')
}

if (chatElements.form != null) {
	// ask username
	var username = prompt('Please tell me your name');
	socket.emit('username', roomName, username);
	
	chatElements.form.addEventListener('submit', function(e) {
		e.preventDefault();
		socket.emit('chat_message', roomName, chatElements.text.value);
		chatElements.text.value;
		return false;
	});
}

socket.on('room-created', function(room) {
	const roomEl = document.createElement('div');
	roomEl.innerText = room;
	const roomLink = document.createElement('a');
	roomLink.href = `/${room}`;
	roomLink.innerText = 'join';
	roomElements.container.append(roomEl);
	roomElements.container.append(roomLink);
});

// append the chat text message
socket.on('chat_message', function(msg) {
	const newMessage = `<li>${msg}</li>`;
	chatElements.messages.insertAdjacentHTML('beforeend', newMessage);
});

// append text if someone is online
socket.on('is_online', function(username) {
	const newUser = `<li>${username}</li>`;
	chatElements.messages.insertAdjacentHTML('beforeend', newUser);
});

