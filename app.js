// Initialization
var express = require('express');
var bodyParser = require('body-parser'); // Required if we need to use HTTP query or post parameters

var server = "http://appidemic.herokuapp.com/";
// var server = "http://localhost:3000/"

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://heroku_rms5cs1c:3om1mllrj4bhkqm13ojv3qc70@ds019480.mlab.com:19480/heroku_rms5cs1c';
var MongoClient = require('mongodb').MongoClient, format = require('util').format;
var db = MongoClient.connect(mongoUri, function(error, databaseConnection) {
  db = databaseConnection;
});

// radius of infection in meters
var radius = 100;

// homepage
app.get('/', function(request, response) {
	return response.send();
});

app.post('/getStatus', function(request, response) {
  // allow cross-origin resource sharing
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "X-Requested-With");

  var id = request.body.id;
  if (!id) return response.send({"Error":"Missing ID"});

  db.collection('users').findAndModify(
    {id:id},
    {$setOnInsert: {infected:false}},
    {new: true, upsert: true}
  ).toArray(function(err, userArr) {
    console.log(userArr);
  });
});

app.post('/sendLocation', function(request, response) {
	// allow cross-origin resource sharing
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "X-Requested-With");

  var id = request.body.id;
  var lat = Number(request.body.lat);
  var lng = Number(request.body.lng);
  var date = new Date();

  if (!id || !lat || !lng) {
  	return response.send({"Error":"Missing ID or coordinates"});
  }

  console.log("id: " + id);
  console.log("lat: " +lat);
  console.log("lng: " + lng);

  // order must be longitude, latitude
  var toInsert = {
  	id: id,
  	date: date,
    geometry: {
      type: "Point",
      coordinates: [
        lng, lat
      ]
    }
  };

  // Insert or update user location
  // Initializes "infected" to false if inserted
  // Searches for other users within var radius
  db.collection('users').update({id:id}, {$set:toInsert, $setOnInsert: {"infected":false}}, {upsert: true}, function(err, result) {
    db.collection('users').find({id:id}).toArray(function(err, user) {



      // Four cases:
      // 1. User is infected and infected nobody
      // 2. User is infected and infected people. Get a count.
      // 3. User is healthy and got infected. V
      // 4. User is healthy and didn't get infected. V



      // Check user's infection status
      if (user[0].infected) {
        db.collection('users', function(err, userCursor) {
          userCursor.createIndex({geometry:'2dsphere'}, function(err, res) {
            db.collection('users').find({
              geometry:
                {
                  $near: {
                    $geometry: {
                      type: "Point",
                      coordinates: [lng, lat]
                    },
                    $minDistance: 0,
                    $maxDistance: radius
                  }
                }
            }).toArray(function(err, usersNearbyArr) {
              var numInfected = 0;
              for (var i=0; i < usersNearbyArr.length; i++) {
                if (!usersNearbyArr[i].infected) { // user is healthy -> infect them
                  numInfected++;
                  db.collection('users').update({_id:usersNearbyArr[i]._id}, {$set: {infected: true}});
                }
              }
              if (numInfected === 0) {      // case 1
                return response.send({result:1, message:"You didn't infect anyone"});
              } else {                      // case 2
                // TODO: add numInfected as an entry in the user doc on DB
                return response.send({result:2, message:"You infected " + numInfected + " people", numInfected:numInfected});
              }
            });
          });
        });
      } else {
        db.collection('users', function(err, userCursor) {
          userCursor.createIndex({geometry:'2dsphere'}, function(err, result) {
            userCursor.find({geometry:
              {
                $near: {
                  $geometry: {
                    type: "Point",
                    coordinates: [lng, lat]
                  },
                  $minDistance: 0,
                  $maxDistance: radius
                }
              }
            }).toArray(function(err, usersNearbyArr) {
              for (var i=0; i < usersNearbyArr.length; i++) {
                if (usersNearbyArr[i].infected) {
                  userCursor.update({id:id}, {$set: {infected: true}});
                  return response.send({result:3, message:"You were infected"}); // case 3
                }
              }
              return response.send({result:4, message:"You are still healthy"}); // case 4
            });
          });
        });
      }
    });
  });
});

app.listen(process.env.PORT || 3000);