var rp = require('request-promise');

function getAccessToken() {

	var accessToken;

	request.post({
		url: 'https://api-test.mediavalet.net/authorization/token',
		form: {
			grant_type: 'password',
			username: 'demojedadmin@mediavalet.net',
			password: '1234test!'
		}
	}, function (err, response, body) {
		accessToken = JSON.parse(body).access_token;
		return accessToken;
	});

	
}

console.log(getAccessToken());