const WebSocket = require('ws');
const Redis = require('ioredis');
const connectDB = require('./db.js');
const Subscription = require("./models/Subscription.js");
const Notification = require("./models/Notification.js");
require('dotenv').config();

const pub = new Redis(process.env.REDIS_URI);
const sub = new Redis(process.env.REDIS_URI);

const wss = new WebSocket.Server({ port: 8080 });
const clients = new Map(); // ws → topic

connectDB();
console.log("Server running on port 8080");

// when Redis fires, only send to clients on that topic
sub.on('message', (channel, message) => {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && clients.get(client) === channel) {
            client.send(message); // only send if topic matches
        }
    });
});

wss.on('connection', async (ws) => {
    console.log("New user connected");
    // step 1: user tells us their username and topic
    ws.on('message', async (data) => {
        const { username, topic, message } = JSON.parse(data);

        // step 2: if user is subscribing (no message, just username+topic)
        if (!message) {
            await Subscription.create({ username, topic });
            clients.set(ws, topic);       // remember this client's topic
            sub.subscribe(topic);         // subscribe to this Redis channel
            ws.send(JSON.stringify({ type: 'subscribed', topic }));

            // send notification history for this topic
            const history = await Notification.find({ topic })
                .sort({ createdAt: -1 })
                .limit(20);
            ws.send(JSON.stringify({ type: 'history', messages: history.reverse() }));
            return;
        }

        // step 3: if user is publishing a notification
        const saved = await Notification.create({ username, topic, message });
        await pub.publish(topic, JSON.stringify({
            type: 'notification',
            notification: saved
        }));
    });

    ws.on('close', () => {
        clients.delete(ws); // cleanup when user disconnects
        console.log("User disconnected");
    });
});