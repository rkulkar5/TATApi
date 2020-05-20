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


const appEnvOpts = vcapLocal ? { vcapLocal } : {}

console.log("*********appEnvOpts ************", appEnvOpts);


const appEnv = cfenv.getAppEnv(appEnvOpts);

console.log("*********appEnv ************", appEnv);

// Within the application environment (appenv) there's a services object
let services = vcapLocal.services;

console.log("*********services ************", services);

let mongodb_services = services["compose-for-mongodb"];

console.log("*********mongodb_services ************", mongodb_services);

//console.log("********* mongodb_services ************", mongodb_services);
// This check ensures there is a services for MongoDB databases
assert(!util.isUndefined(mongodb_services), "App must be bound to databases-for-mongodb service");

// We now take the first bound MongoDB service and extract it's credentials object
var credentials = mongodb_services[0].credentials;

console.log("********* credentials.mongodb.certificate.certificate_base64 ************", credentials.connection.mongodb.certificate.certificate_base64);

// We always want to make a validated TLS/SSL connection
let options = {
    ssl: true,
    sslValidate: true

};

console.log("********", credentials.connection.mongodb.certificate.hasOwnProperty("certificate_base64"));
// If there is a certificate available, use that, otherwise assume Lets Encrypt certifications.
if (credentials.connection.mongodb.certificate.hasOwnProperty("certificate_base64")) {
console.log("******** INSIDE ********");
    let ca = [new Buffer(credentials.connection.mongodb.certificate.certificate_base64, 'base64')];
    options.sslCA = ca;
	
}

//db: 'mongodb://localhost:27017/sampleDB'
module.exports.db = 'mongodb://admin:TATDBAdmin@1190a2a4-473b-4c03-8cd8-aded77b5122c-0.bn2a0fgd0tu045vmv2i0.databases.appdomain.cloud:31109/TATDB?authSource=admin&readPreference=primaryPreferred';

module.exports.options = options;

