
const http = require('http');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');


const HOST = 'localhost';
const PORT = 8088;
const PORT_SERVICES = 8087;


const apiApp = require('pelias-api/app');

const servicesApp = express();

servicesApp.use(bodyParser.json());

const AddressParser = require('pelias-parser/parser/AddressParser');
servicesApp.locals.parser = { address: new AddressParser() }
//HACK from pelias-parser/server/...

servicesApp.get('/libpostal/parse', require('pelias-parser/server/routes/parse'))

//ElasticSearch proxy
servicesApp.all(/^\/pelias(.*)$/, (req, res)=> {
	
	let text = req.body.query.bool.must[0].match['name.default'].query;

	console.log('ElasticSearch request', req.body)

	let hits = [hit(text),hit(text+' 2'),hit(text+' 3')];
	let result = {
	  "took" : 1,
	  "timed_out" : false,
	  "_shards" : {
	    "total" : 1,
	    "successful" : 1,
	    "skipped" : 0,
	    "failed" : 0
	  },
	  "hits" : {
	    "total" : {
	      "value" : hits.length,
	      "relation" : "eq"
	    },
	    "max_score" : 1.0,
	    "hits" : hits
	  }
	};

	res.json(result);

});

const serverParser = servicesApp.listen(PORT_SERVICES, HOST, () => {
	console.log('[PARSER-LITE-SERVICES] listening on %s:%s', HOST, PORT_SERVICES)
	process.on('SIGTERM', () => {
		console.error('[PARSER-LITE-SERVICES] closing...')
		serverParser.close();
	});
});

const serverApi = apiApp.listen( PORT, HOST, () => {
	console.log('[PELIAS-LITE] listening on %s:%s', HOST, PORT)
	process.on('SIGTERM', () => {
		console.error('[PELIAS-LITE] closing...')
		serverApi.close();
	});
});

servicesApp.use('/test', express.static('public'));

function hit(name) {
	return {
        "_index" : "pelias",
        "_type" : "_doc",
        "_id" : "transit:stops:1::tte::stops"+name,
        "_score" : 1.0,
        "_source" : {
          "center_point" : {
            "lon" : 11.047358,
            "lat" : 46.078325
          },
          "parent" : {
            "country" : [
              "Italy"
            ],
            "country_id" : [
              "85633253"
            ],
            "country_a" : [
              "ITA"
            ],
            "macroregion" : [
              "Trentino-Alto Adige/South Tyrol"
            ],
            "macroregion_id" : [
              "404227499"
            ],
            "macroregion_a" : [
              null
            ],
            "region" : [
              "Bolzano"
            ],
            "region_id" : [
              "85685271"
            ],
            "region_a" : [
              "BZ"
            ],
            "localadmin" : [
              "Bolzano"
            ],
            "localadmin_id" : [
              "404473063"
            ],
            "localadmin_a" : [
              null
            ]
          },
          "name" : {
            "default" : [
              name,
              name+"28105z",
              name+"Stop 28105z"
            ]
          },
          "source" : "transit",
          "source_id" : "1::tte::stops",
          "layer" : "stops"
        }
      };
}