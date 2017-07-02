const express = require('express');
const path = require('path');
const builder = require('botbuilder');
const app = express();

const mainMenu = require('./cards/main.menu');


if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const { AmadeusAPIKey, AmadeusBaseURL, AppBaseUrl, AppId, AppPassword, PORT } = process.env;

const connector = new builder.ChatConnector({ 
    appId: AppId, 
    appPassword: AppPassword 
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/webchat', express.static('public'));

app.post('/api/messages', connector.listen());

const bot = new builder.UniversalBot(connector, [
    (session) => {
        const msg = mainMenu(session, AppBaseUrl);
        builder.Prompts.choice(session, msg, ['Explore Destinations', 'Search Flights', 'Search Hotels']);
    },
    (session, results) => {
        const choice = results.response.entity;
        
        switch (choice) {
            case 'Explore Destinations':
                session.beginDialog('exploreDestinationsDialog');
                break;
            case 'Search Flights':
                session.beginDialog('flightsBookingDialog');
                break;
            case 'Search Hotels':
                session.beginDialog('hotelsBookingDialog');
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

bot.dialog('help', [
    (session, args, next) => {
        session.send(`Let's start again!`);
        const msg = menuCard.build(session, AppBaseUrl);
        builder.Prompts.choice(session, msg, 'inspiration|flight|hotes|concierge');
    },
]).triggerAction({ matches: /^help$/i });

bot.dialog('start', [
    (session, args, next) => session.beginDialog('flightBookingDialog')
]).triggerAction({ matches: /(start|search|menu)/i });

require('./dialogs/flights.booking')(bot);
require('./dialogs/explore.destinations')(bot);
require('./dialogs/hotels.booking')(bot);

app.listen(PORT || 3978, () => console.log('Bot is listening to  ' + PORT));


