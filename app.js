// Initialization
var express = require('express');
var bodyParser = require('body-parser'); // Required if we need to use HTTP query or post parameters

var server = "http://appidemic.herokuapp.com/";
// var server = "http://localhost:3000/"

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Required if we need to use HTTP query or post parameters

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://heroku_rms5cs1c:3om1mllrj4bhkqm13ojv3qc70@ds019480.mlab.com:19480/heroku_rms5cs1c';
var MongoClient = require('mongodb').MongoClient, format = require('util').format;
var db = MongoClient.connect(mongoUri, function(error, databaseConnection) {
  db = databaseConnection;
});

// homepage
app.get('/', function(request, response) {
	return response.send();
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
  	return response.send({"error":"Something wrong with data"});
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

  // upsert user; initialize "infected" status to false on insert
  db.collection('users').update({id:id}, {$set:toInsert, $setOnInsert: {"infected":false}}, {upsert: true}, function(err, result) {
    if (err) {response.send('error1');}
    else {
      db.collection('users', function(err, cursor) {
        if (err) {response.send('error2');}
        else {
          cursor.createIndex({'geometry':'2dsphere'}, function(err, index) {
            if (err) {response.send('error3');}
            else {
              cursor.find({geometry:
                {
                  $near: {
                    $geometry: {
                      type: "Point",
                      coordinates: [lng, lat]
                    },
                    $minDistance: 0,
                    $maxDistance: 100
                  }
                }
              }).toArray(function(err, nearbyUsersArr) {
                if (err) response.send('error4');
                else response.send(nearbyUsersArr);
              });
            }
          });
        }
      });
    }
  });

});
      // db.collection('users').find({
      //   point: {
      //     $near: {
      //       $geometry: {type:"Point", coordinates:[lng, lat]}, $minDistance: 0, $maxDistance: 100}
      //     }
      //   }).toArray(function(err, nearbyUsersArr) {
      //     if (err) { response.send(err); }
      //     else {
      //       response.send(nearbyUsersArr);
      //     }
      //   });

app.listen(process.env.PORT || 3000);
