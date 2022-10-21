
const wdlevenshtein = require('weighted-damerau-levenshtein');
const ParallelRequest = require('parallel-http-request');

function textDistance(text, result) {
	//ranking algorithm
	/*//https://github.com/mrshu/node-weighted-damerau-levenshtein/blob/master/index.js#L19
	insWeight : 1;
	delWeight : 1;
	subWeight : 1;
	useDamerau : true;*/
	return wdlevenshtein(text, result, {insWeight:2, subWeight:0.5})
}

//TODO replace with _.template
function tmpl(str, data) {
	const tmplReg = /\{\{([\w_\-]+)\}\}/g
	return str.replace(tmplReg, function (str, key) {
		let value = data[key];
		if (value === undefined)
			value = '';
		return value;
	});
}

function makeUrl(opt, text, lang) {
	let prot = 'http'+(opt.port===443?'s':'');
	let host = prot+'://' + opt.hostname;
	let port = (opt.port!=80 && opt.port!=443)? (':'+opt.port) : '';
	let url = tmpl(host + port + opt.path, {
		text: encodeURI(text),
		//text: text,
		size: opt.size,
		lang: lang || config.default_lang
	});
	return url;
}

module.exports = (config, _) => {

	const formatters = require('./formatters')(config, _);
	const services = require('./services')(config, _);

    return {
    	formatters,
    	services,
    	makeUrl,
    	textDistance,
    	orderResult: (text, res) => {
			res.hits.hits = _.sortBy(res.hits.hits, hit => {
				return textDistance(text, hit._source.name.default)
			});
			return res;
		},
		combineResults: (text, lang, cb) => {

			cb = cb || _.noop;

			lang = lang || config.default_lang

			//docs https://github.com/aalfiann/parallel-http-request
			var request = new ParallelRequest();

			_.forOwn(config.endpoints, (eOpt, eKey) => {

				if(eKey==='here') return;

				request.add({
					id: eKey,	//not required by ParallelRequest
					url: makeUrl(eOpt, text, lang),
					method: eOpt.method,
					headers: eOpt.headers
				});
			});

			var requests = request.getCollection();

			console.log(`[geocoder] search: "${text}" parallel remote requests...`);

			request.send( resp => {

				let results = [], i = 0;

				requests.forEach( req => {

					console.log('[geocoder] request',req.url)

					if(_.isFunction(formatters[ req.id ])) {

						let response = resp[i++];

						let eRes = formatters[ req.id ]( response.body, lang );

						console.log(`[geocoder] response Endpoint: '${req.id}' results`, _.size(eRes));

						results.push(eRes);
					}
				});

				results = _.flatten(results);

				if (config.endpoints.here) {
					(async (cbb, poiResults) => {		//prepend here results
						const hereResponse = await services.here(text, lang);
						const hereResults = formatters.here(hereResponse);

						console.log(`[geocoder] response Endpoint: 'HERE' results`, _.size(hereResults));
						//console.log(JSON.stringify(_.get(hereResponse,'body.Response.View[0].Result'),null,4));

						//add here first
						const returnResults = hereResults.concat(poiResults);

						cbb( formatters.elasticsearch(returnResults) );

					})(cb, results);
				}
				else {
					cb(formatters.elasticsearch(results));
				}
			});
		}

    }
}