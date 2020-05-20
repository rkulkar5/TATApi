let express = require('express'),
   path = require('path'),
   mongoose = require('mongoose'),
   cors = require('cors'),
   bodyParser = require('body-parser'),
   dbConfig = require('./database/db');



var cfenv = require('cfenv');
const assert = require('assert');
const util = require('util')


var appEnv1 = cfenv.getAppEnv();
var vcap_services = JSON.parse(process.env.VCAP_SERVICES);

console.log("*****1  VCAP_application *****",cfenv.getAppEnv().app );


console.log("***** 2 get services *****",appEnv1.getServices() );

console.log("***** VCAP_SERVICES *****",appEnv1.services );
console.log("***** process.VCAP_SERVICES *****",process.env.VCAP_SERVICES );




var vcapLocal;
try {
    vcapLocal = require('./vcap-local.json');
    console.log("Loaded local VCAP");
} catch (e) {
    // console.log(e)
}

const appEnvOpts = vcapLocal ? { vcap: vcapLocal } : {}

const appEnv = cfenv.getAppEnv(appEnvOpts);

// Within the application environment (appenv) there's a services object
let services = appEnv.services;

let mongodb_services;
if (appEnv.services['compose-for-mongodb']) { 
   mongodb_services =  appEnv.services['compose-for-mongodb']; 
} else if (appEnv.getService(/.*[Mm][Oo][Nn][Gg][Oo][dD][bB].*/)) { 
   mongodb_services =  appEnv.getService(/.*[Mm][Oo][Nn][Gg][Oo][dD][bB].*/); 
} else if (appEnv.getService('TATDB')) {
    mongodb_services =  appEnv.getService('TATDB');
  }


// This check ensures there is a services for MongoDB databases
console.log("***** mongodb_services *****",mongodb_services);
// This check ensures there is a services for MongoDB databases
//assert(!util.isUndefined(mongodb_services), "App must be bound to databases-for-mongodb service");

// We now take the first bound MongoDB service and extract it's credentials object
let credentials = mongodb_services[0].credentials;





// Connecting with mongo db
mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.db, {
   useNewUrlParser: true
}).then(() => {
      console.log('Database sucessfully connected')
   },
   error => {
      console.log('Database could not connected: ' + error)
   }
)

// Setting up port with express js
const candidateRoute = require('./routes/candidate.route');
const bandRoute = require('./routes/band.route');
const jrssRoute = require('./routes/jrss.route');
const testConfigRoute = require('./routes/testConfig.route');
const quizQuestionsRoute = require('./routes/questionBank.route');
const userAnswerRoute = require('./routes/userAnswer.route');
const loginRoute = require('./routes/login.route');
const resultRoute = require('./routes/userResult.route');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
   extended: false
}));

var whitelist = ['http://localhost:4200']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Untrusted source of access!!!'))
    }
  }
}

app.use(cors(corsOptions));

app.use(express.static(path.join(__dirname, 'dist/mean-stack-crud-app')));
app.use('/', express.static(path.join(__dirname, 'dist/mean-stack-crud-app')));
app.use('/api', candidateRoute)
app.use('/api/band', bandRoute);
app.use('/api/testConfig', testConfigRoute);
app.use('/api/jrss', jrssRoute);
app.use('/api/quiz', quizQuestionsRoute)
app.use('/api/userAnswer', userAnswerRoute)
app.use('/api/login', loginRoute)
app.use('/result', resultRoute)




app.get('/rajesh/rk', (req, res) => res.send('Hello World!'))

// Create port
const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
  console.log('Connected to port ' + port)
})

// Find 404 and hand over to error handler
app.use((req, res, next) => {
   next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  console.error(err.message); // Log error message in our server's console
  if (!err.statusCode) err.statusCode = 500; // If err has no specified error code, set error code to 'Internal Server Error (500)'
  res.status(err.statusCode).send(err.message); // All HTTP requests must have a response, so let's send back an error with its status code and message
});
