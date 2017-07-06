const builder = require('botbuilder');
const rp = require('request-promise')
const mongoClient = require('mongodb').MongoClient;

const { AmadeusAPIKey, AmadeusBaseURL, AppBaseUrl, MONGODB_URL } = process.env;
const flightList = require('../cards/flight.list');
const invalidIATACodeMessage = require('./error.message');

module.exports = function(bot) {
    bot.dialog('flightsBookingDialog', [
    (session) => {
        session.sendTyping();
        builder.Prompts.text(session, 'Where are you going. For example: Auckland');
    },
   async (session, results, next) => {
        if (results.response) {
            session.sendTyping();
            session.dialogData.destination = await getCityName(results.response);
            builder.Prompts.text(session, 'Where are you flying from? For example: San Francisco');
        }
    },
    async (session, results, next) => {
        if (results.response) {
            session.dialogData.origin = await getCityName(results.response);
        } 
        if (session.dialogData.origin && session.dialogData.destination) {
            session.sendTyping();
            const searchUrl = `${AmadeusBaseURL}flights/extensive-search?apikey=${AmadeusAPIKey}&origin=${session.dialogData.origin}&destination=${session.dialogData.destination}&duration=1--7&aggregation_mode=WEEK`; 
            try {
                const response = await rp(searchUrl);
                const { origin, results } = JSON.parse(response);
                console.log('==> ', results);
                const flights = flightList(session, origin, results);
                session.send(flights);
            } catch(error) {
                console.error(error.message);
                session.endConversation('Sorry! No results found for the requiested destination :(');
            }

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
                if (err) {
                    session.endConversation('Sorry! No results found :( You can start again by saying "hi"');
                }
                let airportInfo;
                
                if(result[0].iata === '\\N')
                    airportInfo = result[1];
                else
                    airportInfo = result[0];
                resolve(airportInfo.iata);
            });
        db.close();
    });
    });
}
