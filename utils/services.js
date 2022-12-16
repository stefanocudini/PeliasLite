
const https = require('https');

const heremap = {
	opts: {},
	config: opts => {
		heremap.opts = opts;
	},
	geocode: (text, params) => {

		const {api_key} = heremap.opts;

		var latitude = params.lat,
			longitude = params.lon,
			limit = params.maxresults,
			country = params.country,
			{maxLat, minLon, minLat, maxLon} = params.bbox,
			//bbox = `${maxLat},${minLon},${minLat},${maxLon}`,
			bbox = `${minLon},${minLat},${maxLon},${maxLat}`,
			lang = params.language,
			text = encodeURIComponent(text),
			url = 'https://autosuggest.search.hereapi.com/v1/autosuggest?'
				+`&apiKey=${api_key}`
				+`&q=${text}`
				//+`&lang=${lang}`
				//+'&result_types=address,place'
				+`&in=bbox:${bbox}`
				//+`&in=countryCode:${country}`
				+`&limit=${limit}`;

		// https://stackoverflow.com/questions/68664953/here-autosuggest-get-complete-address-informations
		//console.log('HERE_REQUEST',url)

		return new Promise((resolve, reject) => {
	        const req = https.request(url, res => {
	            if (res.statusCode===401) {
	                console.error(`[geocoder] error endpoint 'HERE', ${res.statusCode} ${res.statusMessage}`);
                  reject(res.statusMessage)
	                return;
	            }
	            var str = "";
	            res.on('data', chunk => {
	                str += chunk;
	            });
	            res.on('end', () => {
	                try {
	                    const data = JSON.parse(str);
	                    resolve(data);
	                }
	                catch(err) {
	                    console.error(`[geocoder] error endpoint 'HERE' "${err}" to connect endpoint ${endpoint.hostname}${endpoint.path}`);
	                    //reject(err)
	                }
	            });
	        })
	        .on('error', err => {
	            console.error(`[geocoder] error endpoint 'HERE' "${err.code}" to connect endpoint ${endpoint.hostname}${endpoint.path}`);
	            reject(err)
	        })
	        .end();
	    });
	}
}

module.exports = (config, _) => {
	return {
		'here': async(text = '', lang) => {

/*			if (!_.get(config,'endpoints.here.appId') ||
				!_.get(config,'endpoints.here.appCode') ||
				config.endpoints.here.appId === '${HERE_APPID}' ||
				config.endpoints.here.appCode === '${HERE_APPCODE}'
	    	) {
				console.warn("[geocoder] error in Endpoint: 'here' api appId/appCode/ not found");
				return [];
			}*/

			heremap.config({
			  app_id: config.endpoints.here.appId,
			  app_code: config.endpoints.here.appCode,
			  api_key: config.endpoints.here.apiKey
			});

			let bbox;
			if(config.endpoints.here.boundary.rect) {
				const {maxLat, minLon, minLat, maxLon} = config.endpoints.here.boundary.rect
				bbox = `${maxLat},${minLon};${minLat},${maxLon}`;
			}

			//docs AUTOCOMPLETE https://developer.here.com/documentation/geocoder-autocomplete/dev_guide/topics/resource-suggest.html
			//docs geocoder https://developer.here.com/documentation/geocoder/dev_guide/topics/api-reference.html
			try {
				//console.log('HERE',bbox,mapview)
				const params = {
					//search: text,	//only AUTOCOMPLETE
					maxresults: Number(config.endpoints.here.size),
					country: 'ITA',
					//resultType: 'street',//only AUTCOMPLETE
					language: lang || config.server.default_lang,
					//bbox: bbox,
					bbox: config.endpoints.here.boundary.rect,
					mapview: bbox
				};
				//console.log('HERE REQUEST OPTS',params)
				return await heremap.geocode(text, params);
			}catch(err) {
				console.log(err)
				return []
			}
		}
	}
}