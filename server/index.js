"use strict";

/**
 * Load Twilio configuration from .env config file - the following environment
 * variables should be set:
 * process.env.TWILIO_ACCOUNT_SID
 * process.env.TWILIO_API_KEY
 * process.env.TWILIO_API_SECRET
 */
require("dotenv").load();

var http = require("http");
var path = require("path");
var Twilio = require("twilio");
var AccessToken = Twilio.jwt.AccessToken;
var VideoGrant = AccessToken.VideoGrant;
var express = require("express");
var session = require("express-session");
var user = require("./routes/user");
var bodyParser = require("body-parser");
var randomName = require("./randomname");
var mongoose = require("mongoose");

mongoose.connect(
  "mongodb://" +
    process.env.MONGO_DATABASE_HOST +
    ":" +
    process.env.MONGO_PORT +
    "/" +
    process.env.DATABASE_NAME,
  {
    useNewUrlParser: true,
    user: process.env.DB_USER,
    pass: process.env.DB_PASSWORD
  }
);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// Create Express webapp.
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  session({
    secret: "s5sdf12sdf4ot5fhd",
    proxy: true,
    resave: true,
    saveUninitialized: true
  })
);
app.use("/users", user);

// Set up the paths for the examples.
[
  "bandwidthconstraints",
  "codecpreferences",
  "localvideofilter",
  "localvideosnapshot",
  "mediadevices"
].forEach(function(example) {
  var examplePath = path.join(__dirname, `../examples/${example}/public`);
  app.use(`/${example}`, express.static(examplePath));
});

// Set up the path for the quickstart.
var quickstartPath = path.join(__dirname, "../quickstart/public");
app.use("/quickstart", express.static(quickstartPath));

// Set up the path for the examples page.
var examplesPath = path.join(__dirname, "../examples");
app.use("/examples", express.static(examplesPath));

/**
 * Default to the Quick Start application.
 */
app.get("/", function(request, response) {
  response.redirect("/quickstart");
});

/**
 * Generate an Access Token for a chat application user - it generates a random
 * username for the client requesting a token, and takes a device ID as a query
 * parameter.
 */
app.get("/token", function(request, response) {
  var identity = randomName();

  // Create an access token which we will sign and return to the client,
  // containing the grant we just created.
  var token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET
  );

  // Assign the generated identity to the token.
  token.identity = identity;

  // Grant the access token Twilio Video capabilities.
  var grant = new VideoGrant();
  token.addGrant(grant);

  // Serialize the token to a JWT string and include it in a JSON response.
  response.send({
    identity: identity,
    token: token.toJwt()
  });
});

function checkAuth(req, res, next) {
  console.log("checkAuth.session.username", req.session.username);
  if (!req.session.username) {
    res.send({
      status: 2,
      message: "You are not authorized to view this page"
    });
  } else {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
  }
}

app.post("/removeParticipant", checkAuth, function(request, response) {
  var client = new Twilio(
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET,
    { accountSid: process.env.TWILIO_ACCOUNT_SID }
  );

  client.video
    .rooms(request.body.roomid)
    .participants(request.body.participant)
    .update({ status: "disconnected" })
    .then(participant => {
      response.send({
        status: 1
      });
      // console.log(participant.status);
    });
});

// Create http server and run it.
var server = http.createServer(app);
var port = process.env.PORT || 3000;
server.listen(port, function() {
  console.log("Express server running on *:" + port);
});
