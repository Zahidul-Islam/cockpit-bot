const rp = require('require-promise');

function inspiration(url) {
rp(searchUrl)
    .then(res => {
        const response = JSON.parse(res);
        const { origin, results } = response;
        const flights = flightList(session, origin, results);
        session.send(flights);
    })
    .catch(error => console.error(error));
}