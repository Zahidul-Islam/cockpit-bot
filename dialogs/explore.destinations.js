const builder = require('botbuilder');

module.exports = function(bot) {
    bot.dialog('exploreDestinationsDialog', [
        (session) => {
            builder.Prompts.text(session, 'Where are you flying from?');
        },
        (session, results, next) => {
            if (results.response && results.response.length === 3) {
                session.endConversation(`You are flying from ${results.response}`);
            }
        }
    ]);
}