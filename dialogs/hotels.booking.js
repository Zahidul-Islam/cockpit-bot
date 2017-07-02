const builder = require('botbuilder');

module.exports = function(bot) {
    bot.dialog('hotelsBookingDialog', [
        (session) => {
            session.endConversation(`We are working hard to finish this feature. Thank you for your interest.`);
        }
    ]);
}