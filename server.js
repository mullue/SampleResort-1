var express = require("express");
var app = express();
var cfenv = require("cfenv");
var bodyParser = require('body-parser')

var fs = require('fs');
var http = require('http');
var request = require('request');
var url = require('url');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

var mydb;

/* Endpoint to greet and add a new visitor to database.
* Send a POST request to localhost:3000/api/visitors with body
* {
* 	"name": "Bob"
* }
*/
app.post("/api/visitors", function (request, response) {
  var userName = request.body.name;
  if(!mydb) {
    console.log("No database.");
    response.send("Hello " + userName + "!");
    return;
  }
  // insert the username as a document
  mydb.insert({ "name" : userName }, function(err, body, header) {
    if (err) {
      return console.log('[mydb.insert] ', err.message);
    }
    response.send("Hello " + userName + "! I added you to the database.");
  });
});

/**
 * Endpoint to get a JSON array of all the visitors in the database
 * REST API example:
 * <code>
 * GET http://localhost:3000/api/visitors
 * </code>
 *
 * Response:
 * [ "Bob", "Jane" ]
 * @return An array of all the visitor names
 */
app.get("/api/visitors", function (request, response) {
  var names = [];
  if(!mydb) {
    response.json(names);
    return;
  }

  mydb.list({ include_docs: true }, function(err, body) {
    if (!err) {
      body.rows.forEach(function(row) {
        if(row.doc.name)
          names.push(row.doc.name);
      });
      response.json(names);
    }
  });
});

//-------------------------------------------------------------------

app.get("/api/apiCallTest", function (req, rep) {
  request({
    url: "http://bluemix.insator.io:8088/site/CB00000000/things",
    method: "GET",
    headers: {"Authorization" : "Basic Q0IwMDAwMDAwMCt0ZXN0X2Jhc2ljX2F1dGg6dGVzdF9iYXNpY19hdXRo"},
    followRedirect: true,
    maxRedirects: 10
  },(error_2nd, response_2nd, body_2nd)=>{
    //if (error_2nd) {throw error_2nd};
    rep.json(response_2nd.body);
  });

});

app.get("/api/attrsCurrent", function (req, rep) {
  console.log(req.param('device'));
  console.log("------------------------------");
  var device = req.param('device');
  var url = "http://bluemix.insator.io:8088/v1.0/sites/C000000001/things/" + device + "/attrsCurrent";
  request({
    url: url,
    method: "GET",
    headers: {"Authorization" : "Basic QzAwMDAwMDAwMStTYW1wbGVSZXNvcnQ6Qmx1ZW1peA=="},
    followRedirect: true,
    maxRedirects: 10
  },(error_2nd, response_2nd, body_2nd)=>{
    if (error_2nd) {throw error_2nd};
    rep.json(response_2nd.body);
  });
  
});

// app.get("/api/callButton", function (req, rep) {
//   console.log(req.param('device'));
//   console.log("------------------------------");
//   var device = req.param('device');
//   var url = "http://bluemix.insator.io:8088/v1.0/sites/C000000001/things/" + device + "/attrsCurrent";
//   request({
//     url: url,
//     method: "GET",
//     headers: {"Authorization" : "Basic QzAwMDAwMDAwMStTYW1wbGVSZXNvcnQ6Qmx1ZW1peA=="},
//     followRedirect: true,
//     maxRedirects: 10
//   },(error_2nd, response_2nd, body_2nd)=>{
//     if (error_2nd) {throw error_2nd};
//     console.log(response_2nd);
//     console.log(response_2nd.body.connectionStateCode);
//     if (response_2nd.connectionStateCode == 'ACT'){
//         var url2 = "http://bluemix.insator.io:8088/v1.0/site/C000000001/thingName/" + device + "/notify";
//         request({
//           url: url2,
//           method: "POST",
//           headers: {"Authorization" : "Basic QzAwMDAwMDAwMStTYW1wbGVSZXNvcnQ6Qmx1ZW1peA=="},
//           followRedirect: true,
//           maxRedirects: 10
//         },(error_3nd, response_3nd, body_3nd)=>{
//           if (error_2nd) {throw error_2nd};
//           console.log(response_3nd.statusCode);
//           rep.json(response_3nd.body);
//         });
//     }
//     else{
//       rep.json({"code": "504","message": "Response Message Timeout"});
//     }

//   });
  
// });
app.get("/api/callButton", function (req, rep) {
  console.log(req.param('device'));
  console.log("------------------------------");
  var device = req.param('device');
  var url = "http://bluemix.insator.io:8088/v1.0/site/C000000001/thingName/" + device + "/notify";
  request({
    url: url,
    method: "POST",
    headers: {"Authorization" : "Basic QzAwMDAwMDAwMStTYW1wbGVSZXNvcnQ6Qmx1ZW1peA=="},
    followRedirect: true,
    maxRedirects: 10,
    data: {"data": "Message from the main office" }
  },(error_2nd, response_2nd, body_2nd)=>{
    if (error_2nd) {throw error_2nd};
    console.log(response_2nd.statusCode);
    rep.json(response_2nd.body);
  });
  
});

function callInsatorAPI(){
  request({
    url: "http://bluemix.insator.io:8088/site/CB00000000/things",
    method: "GET",
    headers: {"Authorization" : "Basic Q0IwMDAwMDAwMCt0ZXN0X2Jhc2ljX2F1dGg6dGVzdF9iYXNpY19hdXRo"},
    followRedirect: true,
    maxRedirects: 10
  },(error, response, body)=>{
    console.log('after_call--');
    console.log('---------------------');
    console.log(response.statusCode);
    console.log('---------------------');
    console.log(response.body);
    console.log('---------------------');
    console.log(JSON.parse(response.body));
    console.log('---------------------');
    return response.body;
  });
  
}


//-------------------------------------------------------------------


// load local VCAP configuration  and service credentials
var vcapLocal;
try {
  vcapLocal = require('./vcap-local.json');
  console.log("Loaded local VCAP", vcapLocal);
} catch (e) { }

const appEnvOpts = vcapLocal ? { vcap: vcapLocal} : {}

const appEnv = cfenv.getAppEnv(appEnvOpts);

if (appEnv.services['cloudantNoSQLDB']) {
  // Load the Cloudant library.
  var Cloudant = require('cloudant');

  // Initialize database with credentials
  var cloudant = Cloudant(appEnv.services['cloudantNoSQLDB'][0].credentials);

  //database name
  var dbName = 'mydb';

  // Create a new "mydb" database.
  cloudant.db.create(dbName, function(err, data) {
    if(!err) //err if database doesn't already exists
      console.log("Created database: " + dbName);
  });

  // Specify the database we are going to use (mydb)...
  mydb = cloudant.db.use(dbName);
}

//serve static file (index.html, images, css)
app.use(express.static(__dirname + '/views'));



var port = process.env.PORT || 3000
app.listen(port, function() {
    console.log("To view your app, open this link in your browser: http://localhost:" + port);
});
