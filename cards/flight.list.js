const builder = require('botbuilder');
const moment = require('moment');
const _ = require('lodash');

module.exports = function(session, origin, results) {
    const message = new builder
                            .Message(session)
                            .attachmentLayout(builder.AttachmentLayout.carousel);

    const itemCards = _.chain(results)
                  .uniqBy('price')
                  .take(5)
                  .map(item =>  flightItem(session, origin, item));
                
    return message.attachments([...itemCards]);
                    
}

function flightItem(session, origin, item) {
    return new builder.HeroCard(session)
        .title(`$ ${item.price}`)
        .subtitle(`${origin} to ${item.destination}`)
        .text(`${moment(item.departure_date).format('ddd, MMM d')} - ${moment(item.return_date).format('ddd, MMM d')}`)
        .images([builder.CardImage.create(session, 'http://via.placeholder.com/350x200')])
        .buttons([
            builder.CardAction.imBack(session, 'Show Itinerary', 'Show Itinerary'),
            builder.CardAction.imBack(session, 'Show Hotel Options', 'Show Hotel Options'),
            builder.CardAction.imBack(session, 'Show Point of Interest', 'Show Point of Interest')
        ]);
}
