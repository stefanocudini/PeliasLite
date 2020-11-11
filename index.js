
const http = require('http');

const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');

const apiApp = require('pelias-api/app');
const AddressParser = require('pelias-parser/parser/AddressParser');

const HOST = 'localhost';
const PORT = 8088;
const PORT_SERVICES = 8087;

const servicesApp = express();

servicesApp.use(bodyParser.json());
servicesApp.locals.parser = { address: new AddressParser() }
//HACK from pelias-parser/server/...

servicesApp.get('/libpostal/parse', require('pelias-parser/server/routes/parse'))

//ElasticSearch proxy
servicesApp.post(/^\/pelias(.*)$/, (req, res)=> {
	
  console.log('ES REQUEST', JSON.stringify(req.body,null,4))
  
	let q_search = _.get(req.body, "query.bool.must[0].match['name.default'].query");
  let q_autocomplete = _.get(req.body, "query.bool.must[0].constant_score.filter.multi_match.query");

  q = q_search || q_autocomplete;
	
  res.json(result(q));

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

function result(text) {

  let hits = [hit(text),hit(text+' 2'),hit(text+' 3')];

  return {
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
}

function hit(name) {
	return {
        "_index" : "pelias",
        "_type" : "_doc",
        "_id" : "venue:venues:1::venues"+name,
        "_score" : 1.0,
        "_source" : {
          "name" : {
            "default" : name
          },
          "center_point" : {
            "lon" : 11.047358,
            "lat" : 46.078325
          },
          "source" : "venue",
          "source_id" : "1::tte::venues",
          "layer" : "venue",
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
          }
        }
      };
}