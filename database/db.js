// get cfenv 
var cfenv = require('cfenv');
const assert = require('assert');
const util = require('util')

var vcapLocal;
try {
    vcapLocal = require('../vcap-local.json');
    console.log("Loaded local VCAP");
} catch (e) {
    // console.log(e)
}

const appEnvOpts = vcapLocal ? { vcap: vcapLocal } : {}

const appEnv = cfenv.getAppEnv(appEnvOpts);

console.log("********* appEnv ************", appEnv.services);
console.log("********* ************");
// Within the application environment (appenv) there's a services object
let services = appEnv.services;

let mongodb_services = services["compose-for-mongodb"];


//console.log("********* mongodb_services ************", mongodb_services);
// This check ensures there is a services for MongoDB databases
assert(!util.isUndefined(mongodb_services), "App must be bound to databases-for-mongodb service");

// We now take the first bound MongoDB service and extract it's credentials object
let credentials = mongodb_services[0].credentials;

console.log("********* credentials.mongodb.certificate.certificate_base64 ************", credentials);

// We always want to make a validated TLS/SSL connection
let options = {
    ssl: true,
    sslValidate: true
};

// If there is a certificate available, use that, otherwise assume Lets Encrypt certifications.
if (credentials.hasOwnProperty("ca_certificate_base64")) {
    let ca = [new Buffer(credentials.certificate.certificate_base64, 'base64')];
    options.sslCA = ca;
}

module.exports = {

   db:'mongodb://ibm_cloud_b5d223ef_8437_4fb0_9faa_b56b324cd57a:382425ab8920cdd7c7d24959ceda6eeb6b589f053c51c6d9a51af4bca1a592aa@1190a2a4-473b-4c03-8cd8-aded77b5122c-0.bn2a0fgd0tu045vmv2i0.databases.appdomain.cloud:31109,1190a2a4-473b-4c03-8cd8-aded77b5122c-1.bn2a0fgd0tu045vmv2i0.databases.appdomain.cloud:31109/ibmclouddb?authSource=admin&replicaSet=replset'
};
