const builder = require('botbuilder');
const moment = require('moment');
const mongoClient = require('mongodb').MongoClient;
const _ = require('lodash');

const { MONGODB_URL } = process.env;

module.exports = function (session, origin, results) {
    const message = new builder
        .Message(session)
        .attachmentLayout(builder.AttachmentLayout.carousel);

    const itemCards = _.chain(results)
        .uniqBy('price')
        .take(5)
        .map(item => flightItem(session, origin, item));

    return message.attachments([...itemCards]);

}

function flightItem(session, origin, item) {
    let originCity;
    let destinationCity;
    let city;

    return new builder.HeroCard(session)
        .title(`$ ${item.price}`)
        .subtitle(`${origin} to ${item.destination}`)
        .text(`${moment(item.departure_date).format('ddd, MMM d')} - ${moment(item.return_date).format('ddd, MMM d')}`)
        .images([builder.CardImage.create(session, `https://unsplash.it/350/200?image=${generateRandomId(100, 200)}`)]) //http://via.placeholder.com/350x200
        .buttons([
            builder.CardAction.imBack(session, 'Show Itinerary', 'Show Itinerary'),
            builder.CardAction.imBack(session, 'Show Hotel Options', 'Show Hotel Options'),
            builder.CardAction.imBack(session, 'Show Point of Interest', 'Show Point of Interest')
        ]);
}

function getCityName(name) {
    return new Promise((resolve, reject) => {
        mongoClient.connect(MONGODB_URL, (err, db) => {
        if (err) {
            console.log('Error: ', err.message);
            reject(err);
        }
        db.collection('airports')
            .find({ $text: { $search: name } }, { score: { $meta: 'textScore' } })
            .sort({ score: { $meta: 'textScore' } })
            .toArray((err, result) => {
                if (err) throw err;
                let airportInfo = result[0];
                resolve(airportInfo.city);
            });
        db.close();
    });
    });
}

function generateRandomId(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}