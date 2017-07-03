const builder = require('botbuilder');

module.exports = function invalidIATACodeMessage(session, result) {
    const card = new builder.ThumbnailCard(session)
        .title('Oops!')
        .text(`We only support IATA code. "${result}" is not a valid IATA code. We are working hard to create a user friendly bot.`);
    const message = new builder.Message(session).addAttachment(card);
    return message;
}