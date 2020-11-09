/*
const express = require('express');
//const https = require('https');

var app = express();
var server = app.listen(PORT, function () {
   console.log("Listening on port ", PORT);
})
*/
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');

const PORT = 8088;
const PORT_SERVICES = 8087;

const HOST = 'localhost';

const apiApp = require('pelias-api/app');



const servicesApp = express();

const AddressParser = require('pelias-parser/parser/AddressParser');
servicesApp.locals.parser = { address: new AddressParser() }

servicesApp.use((req, res, next) => {
  //res.header('Charset', 'utf8')
  console.log('[parser] request', req.method, req.url)
  next();
});

servicesApp.use(bodyParser.urlencoded({ extended: true }));


servicesApp.get('/libpostal/parse', require('pelias-parser/server/routes/parse'))

//example POST /pelias/_search?search_type=dfs_query_then_fetch HTTP/1.1
servicesApp.post('/pelias_search', (req, res)=> {

	let text = req.body.query.bool.must[0].match['name.default'].query;

	console.log('PELIAS', req.body)

	//TODO pass to 3rd party search API
});

const serverParser = servicesApp.listen(PORT_SERVICES, HOST, () => {
	console.log('[parser] listening on %s:%s', HOST, PORT_SERVICES)
	process.on('SIGTERM', () => {
		console.error('[parser] closing...')
		serverParser.close();
	});
});

const serverApi = apiApp.listen( PORT, HOST, () => {
	console.log('[api] listening on %s:%s', HOST, PORT)
	process.on('SIGTERM', () => {
		console.error('[api] closing...')
		serverApi.close();
	});
});

servicesApp.use('/test', express.static('public', {
//	maxAge: 1000*60*60*24*30*3,//in milliseconds, 3 months
//	etag: false
}));