var SpotifyWebApi = require('spotify-web-api-node');

var express = require('express');
var app = express();

var validator = require('validator'); // See documentation at https://github.com/chriso/validator.js

 var bodyParser = require('body-parser'); // Required if we need to use HTTP query or post parameters

 app.use(bodyParser.json());

 app.use(bodyParser.urlencoded({ extended: true })); // Required if we need to use HTTP query or post parameters

var mongoUri = process.env.MONGODB_URI || process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/scores';
var MongoClient = require('mongodb').MongoClient, format = require('util').format;
var db = MongoClient.connect(mongoUri, function(error, databaseConnection) {
  db = databaseConnection;
});

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

//CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var spotifyApi = new SpotifyWebApi({
  clientId : '9fdce97d9986430483b011aaaea50638',
  clientSecret : '4fadb8b5116b46159eeb217c89de86dc'
});

app.get('/', function(request, response) {
  response.send("<!DOCTYPE HTML><html><head><title>Spotify Server</title></head></html>");
});

app.get('/auth', function(request, response) {

  var access_token = '';
  // Retrieve an access token
  spotifyApi.clientCredentialsGrant()
    .then(function(data) {
      console.log('The access token expires in ' + data.body['expires_in']);
      console.log('The access token is ' + data.body['access_token']);
      response.send(data.body['access_token']);

      // Save the access token so that it's used in future calls
      spotifyApi.setAccessToken(data.body['access_token']);
    }, function(err) {
      console.log('Something went wrong when retrieving an access token', err.message);
    });
});

app.get('/getScoreHome', function(request, response){
  var usernameRequest = undefined;
  if(request.query.username){
    usernameRequest = request.query.username;
    console.log("username:" + usernameRequest)
  }
  if(usernameRequest == undefined || usernameRequest == null){
    db.collection('scores', function(error, collection){
      collection.find({ $and: [{score: {$ne: null}}, {score: {$ne: NaN}},{username: {$ne: 'null'}}]}).sort( {score : -1}).limit( 3 ).toArray(function(error, result){
        response.send(result);
      });
    });
    console.log("sending in if");
  } else {
    db.collection('scores', function(error, collection){
      console.log("second username:"+usernameRequest);
      collection.findOne({username:usernameRequest}, function(error, result) {
        if(!result) {
          console.log("sending in else");
          response.send("{}");
        } else {
          response.send(result);
        }
      });
    });
  }
  /*
  db.collection('scores', function(err, coll){
    coll.find().sort( {score : -1}).toArray(function(er, results){
      if(!er) {
        response.send(JSON.stringify(results));
      }
    });
  });
  */
});

app.get('/getScore', function(request, response){
  var usernameRequest = undefined;
  if(request.query.username){
    usernameRequest = request.query.username;
    console.log("username:" + usernameRequest)
  }
  if(usernameRequest == undefined || usernameRequest == null){
    db.collection('scores', function(error, collection){
      collection.find({ $and: [{score: {$ne: null}}, {score: {$ne: NaN}},{username: {$ne: 'null'}}]}).sort( {score : -1}).limit( 25 ).toArray(function(error, result){
        response.send(result);
      });
    });
    console.log("sending in if");
  } else {
    db.collection('scores', function(error, collection){
      console.log("second username:"+usernameRequest);
      collection.findOne({username:usernameRequest}, function(error, result) {
        if(!result) {
          console.log("sending in else");
          response.send("{}");
        } else {
          response.send(result);
        }
      });
    });
  }
  /*
  db.collection('scores', function(err, coll){
    coll.find().sort( {score : -1}).toArray(function(er, results){
      if(!er) {
        response.send(JSON.stringify(results));
      }
    });
  });
  */
});

app.post('/addScore', function(request, response){
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "X-Requested-With");

  var username = request.body.username;
  var score = parseInt(request.body.score);
  var results = {};

  score = parseFloat(score);

  var toInsert = {
    "username":username,
    "score":score
  }

  console.log(toInsert);

  db.collection('scores', function(error, collection) {
    collection.insert(toInsert, function(errorUpdate, result){
      db.collection('scores', function(errorCollection, scoresCollection){
        scoresCollection.find({}).toArray(function(errorFind, scores) {
          results.scores = scores;
          response.send(results); 
        });
      });
    });
  });
  /*
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "X-Requested-With");

  var user = request.body.username;
  var score = parseInt(request.body.score);

  var userObj = '';

  userObj = {
    'username': user,
    'score': score,
  };

  var responseText = '';

  if (typeof user !== 'undefined' && userObj != '') {
    db.collection('scores', function(error, collection) {
      collection.insert(userObj, function(err, saved){
        if(err) {
          console.log("Error");
          response.send(500);
        } else {
          console.log("inserted!")
          response.send(200);
        }
      });
    });
  }*/
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});



//  clientId : '6cf2ef39b7f7482c8b1bf8e82aa50d43',
//  clientSecret : 'f034abd1393a4232b4fea34377a16943'