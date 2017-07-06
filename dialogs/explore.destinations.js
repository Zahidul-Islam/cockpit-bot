const builder = require('botbuilder');
const rp = require('request-promise');

const flightList = require('../cards/flight.list');
const mongoClient = require('mongodb').MongoClient;
const { AmadeusAPIKey, AmadeusBaseURL, AppBaseUrl, MONGODB_URL } = process.env;

module.exports = function (bot) {
    bot.dialog('exploreDestinationsDialog', [
        (session) => {
            session.sendTyping();
            builder.Prompts.text(session, 'Where are you flying from? For example: san francisco');
        },
        (session, results, next) => {
            if (results.response) {
                session.sendTyping();
                mongoClient.connect(MONGODB_URL, (err, db) => {
                    if (err) throw err;
                    db.collection('airports')
                        .find({ $text: { $search: results.response } }, { score: { $meta: 'textScore' } })
                        .sort({ score: { $meta: 'textScore' } })
                        .toArray((err, result) => {
                           try {
                                let airportInfo = result[0];
                                session.dialogData.origin = airportInfo.iata;
                                session.send(`You're flying from ${airportInfo.city}, ${airportInfo.country}.`);
                                builder.Prompts.text(session, 'What is your budget for the trip? For example: $500');

                            } catch (err) {
                                console.log(err);
                                session.endConversation(`Sorry I can't fine "${results.response}" in my database.`);
                            }

                        });
                    db.close();
                });
            }
        },
        (session, results, next) => {
            if (results.response) {
                //session.endConversation('Your budget for the trip is $' + results.response);
                const budget = results.response;
                const searchUrl = `${AmadeusBaseURL}flights/inspiration-search?apikey=${AmadeusAPIKey}&origin=${session.dialogData.origin}&max_price=${budget}`;
                rp(searchUrl)
                    .then(res => {
                        const response = JSON.parse(res);
                        const { origin, results } = response;
                        const flights = flightList(session, origin, results);
                        session.send(flights);
                    })
                    .catch(error => {
                        session.endConversation(`No result found with in the budget $${budget}`);
                    });
                session.endDialogWithResult({
                    response: {
                        origin: session.dialogData.origin,
                        destination: session.dialogData.destination
                    }
                });
            }
        }
    ]);
}