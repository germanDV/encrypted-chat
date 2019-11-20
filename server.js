// Dependencies
const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

// Set up
const app = express();
app.use(express.static(path.join(__dirname, 'dist')));
const httpServer = http.createServer(app);
const io = socketIO(httpServer);

// Array of socket ids (online contacts)
let contacts = [];

// Handler for socket events
io.on('connection', (socket) => {
    // Send list of already online contacts to new socket
    io.to(socket.id).emit('all-contacts', JSON.stringify(contacts));

    // Let new socket know its own socket.id
    io.to(socket.id).emit('your-socket-id', socket.id);

    // Add new contact to contacts array
    contacts.push(socket.id);

    // Send new contact to the rest of the sockets
    socket.broadcast.emit('new-contact', socket.id);

    socket.on('new-message', (msg) => {
        // Parse incoming msg object
        const msgObj = JSON.parse(msg);

        // Send to individual socketid (private message)
        io.to(msgObj.to).emit('new-message', msg);
    });

    socket.on('disconnect', () => {
        contacts = contacts.filter(i => i !== socket.id);
        socket.broadcast.emit('contact-die', socket.id);
    });
});

// Route handler for react
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
httpServer.listen(3000, () => console.log('Listening on 3000'));
