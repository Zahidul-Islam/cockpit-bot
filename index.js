const express = require('express');
const path = require('path');
const builder = require('botbuilder');
const rp = require('request-promise');
const app = express();

const port = process.env.PORT || 3978;
const public = __dirname + "/public/";
const amadeusAPIKey = 'T5ANeTGYtcD4cMOAGnGaSHo84VZz5phw';
const amadeusBaseURL = 'https://api.sandbox.amadeus.com/v1.2/';

app.use('/', express.static(public));

const connector = new builder.ChatConnector({
    appId: '85021f43-ab03-4916-908e-c113dbf0d195',
    appPassword: '4AVKb6sHChCXQFfbNrGfCBP'
});


app.get('/', (req, res) => res.sendFile(path.join(public + "index.html")));
app.post('/api/messages', connector.listen());

let bot = new builder.UniversalBot(connector, [
    (session) => {
        session.send('Welcome to Cockpit Bot.');
        session.sendTyping();
        builder.Prompts.choice(session,
            'Hi there! I\'m here to help you to find the best and affortable flight and hotels.Please choose one of the option to search:',
            ['Advice', 'Flight', 'Hotes', 'Concierge'],
            builder.ListStyle.button);
    },
    (session, results) => {
        console.log(session.response);
        const choice = results.response.entity;
        switch (choice) {
            case 'Advice':
                session.beginDialog('adviceBookingDialog');
                break;
            case 'Flight':
                session.beginDialog('flightBookingDialog');
                break;
            case 'Hotes':
                session.beginDialog('hotelBookingDialog');
                break;
            case 'Concierge':
                session.beginDialog('conciergeDialog');
                break;
            default:
                session.beginDialog('unknownDialog');
        }
    },
    (session, results) => {
        if (results.response) {
            const data = results.response;
            session.send(`You\'re flying from ${data.origin} and going to ${data.destination}. Have a nice and safe journey!`);
            session.endConversation();
        } else {
            session.endDialog('We will comeback to you as soon as we have this feature. Thank you!');
        }
    }
]);

bot.dialog('adviceBookingDialog', [
    (session) => {
        session.endDialog('Sorry we don\'t support booking advice yet!');
    }
]);

bot.dialog('flightBookingDialog', [
    (session) => {
        builder.Prompts.text(session, 'Pleaes type IATA code of the city to which you want to go. For example: NYC');
    },
    (session, results, next) => {
        if (results.response) {
            session.dialogData.destination = results.response;
            builder.Prompts.text(session, 'Where are you flying from? For example: SFO');
        } else {
            next();
        }
    },
    (session, results) => {
        if (results.response) {
            session.dialogData.origin = results.response;
        }
        if (session.dialogData.origin && session.dialogData.destination) {
            let flightInspirationSearchUrl = `${amadeusBaseURL}flights/extensive-search?apikey=${amadeusAPIKey}&origin=${session.dialogData.origin}&destination=${session.dialogData.destination}&duration=2--3`;
            rp(flightInspirationSearchUrl)
                .then(res => {
                    const response = JSON.parse(res);
                    const results = response.results;
                    let cards = [];
                    var msg = new builder.Message(session);
                    msg.attachmentLayout(builder.AttachmentLayout.carousel)
                    
                    results.forEach((result, index) => {
                        if(index < 10){
                            cards.push(buildCard(session, result, response.origin)); 
                        }                       
                    })
                    
                    msg.attachments([...cards]);
                   session.send(msg);
                })
                .catch(error => console.error(error));
            session.endDialogWithResult({
                response: {
                    origin: session.dialogData.origin,
                    destination: session.dialogData.destination
                }
            });
        } else {
            session.endDialogWithResult({
                resumed: builder.ResumeReason.notCompleted
            });
        }
    }
]);

bot.dialog('hotelBookingDialog', [
    (session) => {
        session.endDialog('Sorry we don\'t support hotel booking yet!');
    }
]);

bot.dialog('conciergeDialog', [
    (session) => {
        session.endDialog('Sorry we don\'t support concierge service yet!');
    }

]);

bot.dialog('unknownDialog', [
    (session) => {
        session.endDialog('Sorry I didn\'t get it! Would you like to perform another search?');
    }
]);

app.listen(port, () => console.log('Bot is listening on port: ' + port));

function buildCard(session, result, origin) {
    return new builder.HeroCard(session)
        .title(`Flight from ${origin} to ${result.destination}`)
        .subtitle(`Price: $ ${result.price}`)
        .text(`Departure: ${result.departure_date} Return: ${result.return_date}`)
        .images([builder.CardImage.create(session, 'http://messagecardplayground.azurewebsites.net/assets/airplane.png')])
        .buttons([
            builder.CardAction.imBack(session, "View details", "View details")
        ]);
}


function buildACard(session, result, origin) {
    return new builder.Message(session)
        .addAttachment({
            contentType: "application/vnd.microsoft.card.adaptive",
            content: {
                "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                "version": "0.5",
                "type": "AdaptiveCard",
                "body": [
                    {
                        "type": "TextBlock",
                        "text": result.departure_date,
                        "weight": "bolder"
                    },
                    {
                        "type": "ColumnSet",
                        "separation": "strong",
                        "columns": [
                            {
                                "type": "Column",
                                "size": 1,
                                "items": [
                                    {
                                        "type": "TextBlock",
                                        "size": "extraLarge",
                                        "color": "accent",
                                        "text": origin
                                    }
                                ]
                            },
                            {
                                "type": "Column",
                                "size": "auto",
                                "items": [
                                    {
                                        "type": "TextBlock",
                                        "text": "&nbsp;"
                                    },
                                    {
                                        "type": "Image",
                                        "url": "http://messagecardplayground.azurewebsites.net/assets/airplane.png",
                                        "size": "small"
                                    }
                                ]
                            },
                            {
                                "type": "Column",
                                "size": 1,
                                "items": [
                                    {
                                        "type": "TextBlock",
                                        "horizontalAlignment": "right",
                                        "size": "extraLarge",
                                        "color": "accent",
                                        "text": result.destination
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "type": "TextBlock",
                        "text": "Non-Stop",
                        "separation": "strong",

                        "weight": "bolder"
                    },
                    {
                        "type": "TextBlock",
                        "text": result.return_date,
                        "weight": "bolder"
                    },
                    {
                        "type": "ColumnSet",
                        "columns": [
                            {
                                "type": "Column",
                                "size": 1,
                                "items": [
                                    {
                                        "type": "TextBlock",
                                        "size": "extraLarge",
                                        "color": "accent",
                                        "text": result.destination
                                    }
                                ]
                            },
                            {
                                "type": "Column",
                                "size": "auto",
                                "items": [
                                    {
                                        "type": "TextBlock",
                                        "text": "&nbsp;"
                                    },
                                    {
                                        "type": "Image",
                                        "url": "http://messagecardplayground.azurewebsites.net/assets/airplane.png",
                                        "size": "small"
                                    }
                                ]
                            },
                            {
                                "type": "Column",
                                "size": 1,
                                "items": [
                                    {
                                        "type": "TextBlock",
                                        "topSpacing": "none",
                                        "horizontalAlignment": "right",
                                        "size": "extraLarge",
                                        "color": "accent",
                                        "text": origin
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "type": "ColumnSet",
                        "separation": "strong",

                        "columns": [
                            {
                                "type": "Column",
                                "size": "1",
                                "items": [
                                    {
                                        "type": "TextBlock",
                                        "text": "Total",
                                        "size": "medium",
                                        "isSubtle": true
                                    }
                                ]
                            },
                            {
                                "type": "Column",
                                "size": 1,
                                "items": [
                                    {
                                        "type": "TextBlock",
                                        "horizontalAlignment": "right", "text": "$ " + result.price,
                                        "size": "medium",
                                        "weight": "bolder"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        });
}