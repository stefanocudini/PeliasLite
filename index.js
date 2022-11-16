
const express = require('express')
	, _ = require('lodash')
    , cors = require('cors');

const {resolve} = require('path');
const {config} = require(resolve(__dirname,'./lib'));

const {formatters, services, combineResults, textDistance, orderResult} = require('./utils')(config, _);

let envId = config.envId || '';

process.env.PELIAS_CONFIG = `${__dirname}/pelias${envId}.json`;
console.log('PELIAS_CONFIG file:', process.env.PELIAS_CONFIG);

//PATCH for pelias-api that require this file
const AddressParser = require('pelias-parser/parser/AddressParser');
const peliasParser = require('pelias-parser/server/routes/parse');
const peliasApiApp = require('pelias-api/app');

const app = express();

app.use(cors(config.cors));

if (config.envId == 'dev') {
   app.set('json spaces', 2);
}

app.use(express.json());

app.locals.parser = { address: new AddressParser() };

function reqLog(req, res) {
	console.log('[pelias-libs] ',req.url, req.query)
	res.json({});
}
app.get('/libpostal/parse', peliasParser);
app.get(/^\/placeholder(.*)$/, reqLog);
app.get(/^\/pip(.*)$/, reqLog);
app.get(/^\/interpolation(.*)$/, reqLog);
app.post(/^\/_search(.*)$/, reqLog);
//TODO implement pelias /v1/search

//ElasticSearch internal proxy
app.post(/^\/pelias(.*)$/, (req, res) => {
	const {text, lang} = formatters.elasticsearchRequest(req, res);

	if(!_.isString(text) || text.length < Number(config.min_text_length)) {

		res.json( formatters.elasticsearch([]) )
	}
	else {
		combineResults(text, lang, jsonres => {
			res.json(orderResult(text, jsonres));
		});
	}
});

app.use('/tests', express.static('tests'));

app.use('/', peliasApiApp);

const serverParser = app.listen(config.listen_port, function() {
	console.log('internal services paths', app._router.stack.filter(r => r.route).map(r => `${Object.keys(r.route.methods)[0]} ${r.route.path}`) );
    console.log(`listening at http://localhost:${this.address().port}`);
});
