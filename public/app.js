let params = {};
let KEY = 'cIIEfwv8Df0.cwA.n1g.DpWHaeYt9KjH6-TSQFg7JJNqWlMMWsHtYV7TsZURCXU';
location
    .search
    .substring(1)
    .split("&")
    .forEach(pair => {
        const p = pair.split('=');
        params[p[0]] = decodeURIComponent(p[1]);
    });

const botConnection = new BotChat.DirectLine({
    token: params['key'] || KEY
});

const bot = {
    id: params['botid'] || 'botid',
    name: params['botname'] || 'botname'
};

const loginForm = document.getElementById('loginForm');
const loginDetail = document.getElementById('loginDetail');
const userId = document.getElementById('userId');

loginForm.onsubmit = (e) => {
    e.preventDefault();
    loginDetail.style.display = 'none';

    const user = {
        id: userId.value,
        name: userId.value
    }

    BotChat.App({
        botConnection,
        user,
        bot
    }, document.getElementById('BotChatGoesHere'));
}