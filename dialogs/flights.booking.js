const builder = require('botbuilder');
const rp = require('request-promise')

const { AmadeusAPIKey, AmadeusBaseURL, AppBaseUrl } = process.env;
const flightList = require('../cards/flight.list');

module.exports = function(bot) {
    bot.dialog('flightsBookingDialog', [
    (session) => {
        session.sendTyping();
        builder.Prompts.text(session, 'Pleaes type IATA code of the city to which you want to go. For example: NYC');
    },
    (session, results, next) => {
        if (results.response && results.response.length === 3) {
            session.dialogData.destination = results.response;
            session.sendTyping();
            builder.Prompts.text(session, 'Where are you flying from? For example: SFO');
        } else {
            session.send(invalidIATACodeMessage(session, results.response));
            session.sendTyping();
            session.replaceDialog('flightsBookingDialog', { reprompt: true });
        }
    },
    (session, results) => {
        if (results.response && results.response.length === 3) {
            session.dialogData.origin = results.response;
        } else {
            session.send(invalidIATACodeMessage(session, results.response));
            session.sendTyping();
            session.endConversation();
        }

        if (session.dialogData.origin && session.dialogData.destination) {
            session.sendTyping();
            const searchUrl = `${AmadeusBaseURL}flights/extensive-search?apikey=${AmadeusAPIKey}&origin=${session.dialogData.origin}&destination=${session.dialogData.destination}&duration=1--7&aggregation_mode=WEEK`;
            rp(searchUrl)
                .then(res => {
                    const response = JSON.parse(res);
                    const { origin, results } = response;
                    const flights = flightList(session, origin, results);
                    session.send(flights);
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
}
function invalidIATACodeMessage(session, result) {
    const card = new builder.ThumbnailCard(session)
        .title('Oops!')
        .text(`We only support IATA code. "${result}" is not a valid IATA code. We are working hard to create a user friendly bot.`);
    const message = new builder.Message(session).addAttachment(card);
    return message;
}