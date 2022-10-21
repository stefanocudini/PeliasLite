
const _ = require('lodash')
    , express = require('express')
    , cors = require('cors')
    , dotenv = require('dotenv').config()
    , configyml = require('@stefcud/configyml');

const basepath = require.main.path //process.cwd() //path of module that includes this
    , {name, version} = require(`${basepath}/package.json`)
    , serviceName = `service ${name} v${version}`
    , config = configyml({basepath});

config.endpoints = _.mapValues(config.endpoints, conf => {
    return _.defaults(conf, config.endpoints.default);
});
delete config.endpoints.default;

const app = express();

app.use(cors(config.cors));

if (config.envId == 'dev') {
   app.set('json spaces', 2);
}

console.log(`Starting ${serviceName}... ${version}\nConfig:\n`, config);

module.exports = {
    app,
    config,
    //libs
    express,
    _
};