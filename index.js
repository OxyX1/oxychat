const express = require('express');
const path = require('path');
const http = require('http');
const SocketIO = require('socket.io');
const { text } = require('body-parser');
const wss = new WebSocket.Server({ noServer: true });


const app = express();

const port = process.env.PORT || 8080;
const ip = '0.0.0.0';

const clients = new Map()

wss.on('connection', (ws) => {
    let currentChannel = 'general';

    clients.set(ws, currentChannel);


    ws.on('message', (message) => {
        const [channel, text] = message.split(' ', 2);

        if (channel && channel !== currentChannel) {
            currentChannel = channel;
            clients.set(ws, currentChannel);
        }
    });

    wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN && clients.get(client) === currentChannel) {
            client.send(`[${currentChannel}] ${text}`);
        }
    });
});


ws.on('close', () => {
    clients.delete(ws);
});


app.use(express.static(path.join(__dirname, 'public')));

app.use('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const server = http.createServer(app);
const socketIO = SocketIO(server);

app.listen(port, ip, () => {
    console.log('server is running on port 8080');
});