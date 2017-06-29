const express = require('express');
const path = require('path');
const builder = require('botbuilder');
const app = express();

const port = process.env.PORT || 3978;
const public = __dirname + "/public/";

app.use('/', express.static(public));

const connector = new builder.ChatConnector({
    appId: '85021f43-ab03-4916-908e-c113dbf0d195',
    appPassword: '4AVKb6sHChCXQFfbNrGfCBP'
});

app.get('/', (req, res) => {
    res.sendFile(path.join(public + "index.html"));
});

app.post('/api/messages', connector.listen());

let bot = new builder.UniversalBot(connector, (session) => {
    session.send(`You said: ${session.message.text}`);
});

app.listen(port, () => console.log('Bot is listening on port: ' + port));