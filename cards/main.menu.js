const builder = require('botbuilder');

module.exports = function(session, appBaseUrl) {
    const message = new builder.Message(session);
    message.attachmentLayout(builder.AttachmentLayout.carousel)
    message.attachments([
        new builder.HeroCard(session)
            .title('Welcome to the Cockpit Bot')
            .subtitle('I can help you plan your next gateaway.')
            .text('What would you like to do today?')
            .images([builder.CardImage.create(session, appBaseUrl + '/images/cockpitbot.png')])
            .buttons([
                builder.CardAction.imBack(session, 'Explore Destinations', 'Explore Destinations'),
                builder.CardAction.imBack(session, 'Search Flights', 'Search Flights'),
                builder.CardAction.imBack(session, 'Help', 'Help')
            ])
    ]);
    return message;
}