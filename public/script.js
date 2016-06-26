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
			  
function init()
{
	getMyLocation();
	map = new google.maps.Map(document.getElementById("map"), options);

};

function getMyLocation() {
	if (navigator.geolocation) { // if browser supported

		navigator.geolocation.getCurrentPosition( 
			function(position) {
				lat = position.coords.latitude;
				lng = position.coords.longitude;
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