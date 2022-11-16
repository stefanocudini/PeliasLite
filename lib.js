
const _ = require('lodash')
    , express = require('express')
    , cors = require('cors')
    , dotenv = require('dotenv').config()
    , configyml = require('@stefcud/configyml');

const basepath = require.main.path //process.cwd() //path of module that includes this
    , {name, version} = require(`${basepath}/package.json`)
    , config = configyml({basepath});

config.endpoints = _.mapValues(config.endpoints, conf => {
    return _.defaults(conf, config.endpoints.default);
});
delete config.endpoints.default;

console.log(`Starting ${name} v${version}...`)
console.log(`Config:\n`, config);

module.exports = {
    config
};