

const http = require('http');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');


const HOST = 'localhost';
const PORT = 9300;
const ES_PORT = 9200;

const servicesApp = express();

servicesApp.all(/^\/pelias(.*)$/, (req, res)=> {

	let opts = {
		port: ES_PORT,
		hostname: req.hostname,
		path: req.url,
		method: req.method,
		headers: _.extend({}, req.headers, {
			host: 'localhost:'+ES_PORT
		})
	}
	console.log('ELASTIC REQUEST',opts)
	req.pipe(process.stdout);
	var proxy = http.request(opts, function (resp) {
		
		console.log("\nELASTIC RESPONSE",resp.statusCode, resp.headers)

		res.writeHead(resp.statusCode, resp.headers)
		
		resp.pipe(res);

		resp.pipe(process.stdout);
	});
	req.pipe(proxy);
});

const serverParser = servicesApp.listen(PORT, HOST, () => {
	console.log('[PARSER-LITE-SERVICES] listening on %s:%s', HOST, PORT)
	process.on('SIGTERM', () => {
		console.error('[PARSER-LITE-SERVICES] closing...')
		serverParser.close();
	});
});