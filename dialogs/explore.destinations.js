const builder = require('botbuilder');

module.exports = function(bot) {
    bot.dialog('exploreDestinationsDialog', [
        (session) => {
            session.sendTyping();
            builder.Prompts.text(session, 'Where are you flying from? For example: SFO');
        },
        (session, results, next) => {
            if (results.response && results.response.length === 3) {
                session.endConversation(`You are flying from ${results.response}`);
            }
        }
    ]);
}