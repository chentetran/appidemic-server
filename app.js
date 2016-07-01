// Initialization
var express = require('express');
var bodyParser = require('body-parser'); // Required if we need to use HTTP query or post parameters

var server = "http://appidemic.herokuapp.com/";
// var server = "http://localhost:3000/"

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public')); //serve static content

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://heroku_rms5cs1c:3om1mllrj4bhkqm13ojv3qc70@ds019480.mlab.com:19480/heroku_rms5cs1c';
var MongoClient = require('mongodb').MongoClient, format = require('util').format;
var db = MongoClient.connect(mongoUri, function(error, databaseConnection) {
  db = databaseConnection;
});

// radius of infection in meters
var radius = 100;

// homepage
app.get('/', function(request, response) {
	response.set('Content-Type', 'text/html');
  return response.sendFile(__dirname + '/public/index.html');
});

app.post('/checkInfection', function(request, response) {
  // allow cross-origin resource sharing
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "X-Requested-With");

  var id = request.body.id;
  if (!id) return response.send({"Error":"Missing ID"});

  db.collection('users').find({id:id}).toArray(function(err, userArr) {
    if (userArr.length === 0) {
      return response.send({status:0, message:"User not in database yet"});
    }
    var infected = userArr[0].infected;
    if (!infected) return response.send({status:1, message:"You are not infected"}); 
    if (infected) return response.send({status:2, message:"You are infected"});
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
  	return response.send({result:5, message: "Missing information"});
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
  db.collection('users').update({id:id}, {$set:toInsert, $setOnInsert: {"infected":false, "numInfected":0}}, {upsert: true}, function(err, result) {
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
                // increment number of users infected
                db.collection('users').update({id:id}, {$inc: {"numInfected" : numInfected}});
                return response.send({result:2, message:"You infected " + numInfected + " people!", numInfected:numInfected});
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
                  // increase spreader's numInfected
                  db.collection('users').update({id:usersNearbyArr[i].id}, {$inc: {"numInfected" : 1}});

                  userCursor.update({id:id}, {$set: {infected: true}});
                  return response.send({result:3, message:"You were infected!"}); // case 3
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

app.get('/stats.json', function(request, response) {
  // allow cross-origin resource sharing
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "X-Requested-With");

  db.collection('users').find().toArray(function(err, usersArr) {
    if (err) return response.send('Something went wrong');

    // TODO: send statistics with usersArr
    // like time since first infection, total number of users, num infected, etc
    db.collection('users').count({}, function(err, numUsers) {
      db.collection('users').count({infected:true}, function(err, numInfected) {
        response.send({usersArr, numUsers: numUsers, numInfected: numInfected});
      });
    });

  });
});

app.listen(process.env.PORT || 3000);