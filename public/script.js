var lat = 0;
var lng = 0;
// var request = new XMLHttpRequest();
var me = new google.maps.LatLng(lat, lng);
var infowindow = new google.maps.InfoWindow();
var map;
var marker;
var messageData;
var options = {
					zoom: 15,
					center: me,
					mapTypeId: google.maps.MapTypeId.ROADMAP
			  };

// request.open("POST", "https://pumpkin-tart-22013.herokuapp.com/sendLocation", true);
// request.onreadystatechange = parse;

// function parse()
// {
// 	if (request.readyState == 4 && request.status == 200) {
// 		messageData = JSON.parse(request.responseText);
// 		render_others();
// 		render_landmarks();
// 		renderMap();
// 	}
// 	else if (request.readyState == 4 && request.status != 200) {
// 		alert("Request status not good!")
// 	}
// }

// function render_others()
// {
// 	img = 'TwoD.png';
// 	for (var i = 0; i < messageData["people"].length; i++) {
// 		name = messageData['people'][i]["login"]
// 		_lat = messageData["people"][i]["lat"];
// 		_lng = messageData["people"][i]["lng"];
// 		pos = new google.maps.LatLng(_lat,_lng);
// 		marker = new google.maps.Marker({
// 			position: pos,
// 			title: name,
// 			icon: img
// 		});
// 		marker.content = "<b>" + name + "</b></br>" + haversine(_lat,_lng) + " miles away";

// 		marker.setMap(map);

// 		google.maps.event.addListener(marker, 'click', function() {
// 			infowindow.setContent(this.content);
// 			infowindow.open(this.getMap(), this);
// 		});
// 	}
// }

// function render_landmarks()
// {	
// 	img = 'chipmarker.png'
// 	for (var i = 0; i < messageData['landmarks'].length; i++) {
// 		details = messageData['landmarks'][i]['properties']['Details'];
		
// 		pos = messageData['landmarks'][i]['geometry']['coordinates'];

// 		pos = new google.maps.LatLng(pos[1],pos[0]);

// 		marker = new google.maps.Marker({
// 			position: pos,
// 			icon: img
// 		});
// 		marker.content = details;

// 		marker.setMap(map);

// 		google.maps.event.addListener(marker, 'click', function() {
// 			infowindow.setContent(this.content);
// 			infowindow.open(this.getMap(), this);
// 		});
// 	}
// }


function init()
{
	map = new google.maps.Map(document.getElementById("map"), options);
	getMyLocation();

};

function getMyLocation() {
	if (navigator.geolocation) { // if browser supported

		navigator.geolocation.getCurrentPosition( 
			function(position) {
				lat = position.coords.latitude;
				lng = position.coords.longitude;
				// request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				// request.send("login=IGNACIO_BOWMAN&lat=" + lat + "&lng=" + lng);
			});
	}
	else {
		alert("Download Chrome.")
	}
};

function renderMap()
{
	me = new google.maps.LatLng(lat, lng);

	map.panTo(me);
	marker = new google.maps.Marker({
		position: me
	});
	marker.setMap(map);

	google.maps.event.addListener(marker, 'click', function(){
		infowindow.setContent(this.content);
		infowindow.open(this.getMap(), this);
	});
}

Number.prototype.toRad = function() {
   return this * Math.PI / 180;
}

// function closestLandmark()
// {
// 	var shortest = 0;
// 	var shortest_haversine = 1000;
// 	for (var i = 0; i < messageData['landmarks'].length; i++) {
// 		_lat = messageData['landmarks'][i]['geometry']['coordinates'][1];
// 		_lng = messageData['landmarks'][i]['geometry']['coordinates'][0];

// 		temp = haversine(_lat,_lng);
// 		if (temp < shortest_haversine) {
// 			shortest = i;
// 			shortest_haversine = temp;
// 		}
// 	}
// 	return [messageData['landmarks'][shortest], shortest_haversine]
// }

// // rounded to thousandths place
// function haversine(destLat, destLng) {
// 	var lat2 = destLat; 
// 	var lon2 = destLng; 
// 	var lat1 = lat; 
// 	var lon1 = lng; 

// 	var R = 3958.756; // miles
// 	var x1 = lat2-lat1;
// 	var dLat = x1.toRad();  
// 	var x2 = lon2-lon1;
// 	var dLon = x2.toRad();  
// 	var a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
// 	                Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
// 	                Math.sin(dLon/2) * Math.sin(dLon/2);  
// 	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
// 	var d = R * c; 

// 	return Number((d).toFixed(3));
// }