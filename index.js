const express = require('express');
const path = require('path');
const builder = require('botbuilder');
const rp = require('request-promise');
const app = express();

require('dotenv').config();

const port = process.env.PORT || 3978;

const amadeusAPIKey = process.env.AmadeusAPIKey;
const amadeusBaseURL = process.env.AmadeusBaseURL;
const appBaseUrl = process.env.AppBaseUrl;

const connector = new builder.ChatConnector({
    appId: process.env.AppId,
    appPassword: process.env.AppPassword
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/webchat', express.static('public'));

app.post('/api/messages', connector.listen());

const bot = new builder.UniversalBot(connector, [
    (session) => {
        const msg = buildChoiceCard(session);
        builder.Prompts.choice(session, msg, 'advice|flight|hotes|concierge');
    },
    (session, results) => {
        console.log(session.response);
        const choice = results.response.entity;
        switch (choice) {
            case 'advice':
                session.beginDialog('inspirationDialog');
                break;
            case 'flight':
                session.beginDialog('flightBookingDialog');
                break;
            case 'hotes':
                session.beginDialog('hotelBookingDialog');
                break;
            default:
                session.beginDialog('unknownDialog');
        }
    },
    (session, results) => {
        if (results.response) {
            const data = results.response;
            session.send(`You\'re flying from ${data.origin} and going to ${data.destination}. Here are some choices.`);
            session.sendTyping();
        } else {
            session.endConversation('We will comeback to you as soon as we have this feature. Thank you!');
        }
    }
]);

bot.dialog('inspirationDialog', [
    (session) => {
        session.endConversation('Sorry we don\'t support booking advice yet!');
    }
]);

bot.dialog('flightBookingDialog', [
    (session) => {
        session.sendTyping();
        builder.Prompts.text(session, 'Pleaes type IATA code of the city to which you want to go. For example: NYC');
    },
    (session, results, next) => {
        if (results.response) {
            session.dialogData.destination = results.response;
            session.sendTyping();
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
            session.sendTyping();
            let flightInspirationSearchUrl = `${amadeusBaseURL}flights/extensive-search?apikey=${amadeusAPIKey}&origin=${session.dialogData.origin}&destination=${session.dialogData.destination}&duration=2--3`;
            rp(flightInspirationSearchUrl)
                .then(res => {
                    const response = JSON.parse(res);
                    const results = response.results;
                    let cards = [];
                    var msg = new builder.Message(session);
                    msg.attachmentLayout(builder.AttachmentLayout.carousel)
                    session.sendTyping();
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

bot.dialog('unknownDialog', [
    (session) => {
        session.endDialog('Sorry I didn\'t get it! Would you like to perform another search?');
    }
]);

app.listen(port, () => console.log('Bot is listening to  ' + port));

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

function buildChoiceCard(session) {
    const choiceCard = new builder.Message(session);
    choiceCard.attachmentLayout(builder.AttachmentLayout.carousel)
    choiceCard.attachments([
        new builder.HeroCard(session)
            .title("Welcome to Cockpit Bot")
            .subtitle("Hi there! I'm here to help you plan your next vacation.")
            .text("Let's get started. Please choose one of the option: ")
            .images([builder.CardImage.create(session, appBaseUrl + '/images/cockpitbot.png')])
            .buttons([
                builder.CardAction.imBack(session, "inspiration", "Inspiration"),
                builder.CardAction.imBack(session, "flight", "Flight Search"),
                builder.CardAction.imBack(session, "hotels", "Hotels Search")
            ])
    ]);
    return choiceCard;
}
