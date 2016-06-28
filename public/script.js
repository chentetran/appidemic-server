var lat = 0;
var lng = 0;
var me;
var infowindow;
var map;
var marker;
var messageData;
var options;

var request = new XMLHttpRequest();
request.open("GET", "https://appidemic.herokuapp.com/users.json", true);
request.onreadystatechange = parse;

function parse() {
	if (request.readyState == 4 && request.status == 200) {
		messageData = JSON.parse(request.responseText);
		renderMap();

	} else if (request.readyState == 4 && request.status != 200) {
		alert('Unable to load users');
	}
}

function init()
{
	

	// Get user's location to center map
	if (navigator.geolocation) { // if browser supported
		navigator.geolocation.getCurrentPosition( 
			function(position) {
				lat = position.coords.latitude;
				lng = position.coords.longitude;
				request.send();
			});
	}
	else {
		alert("Your browser doesn't support location");
	}
}

function renderMap()
{
	// Center on user's location
	me = new google.maps.LatLng(lat, lng);
	infowindow = new google.maps.InfoWindow();
	options = {
					zoom: 7,
					center: me,
					mapTypeId: google.maps.MapTypeId.ROADMAP
			  };

	map = new google.maps.Map(document.getElementById("map"), options);
	map.panTo(me);

	// Load all users as markers
	var healthyImg = 'healthy.png';
	var infectedImg = 'biohazard_location.png';
	var pos;
	for (var i = 0; i < messageData.length; i++) {
		pos = messageData[i]['geometry']['coordinates'];
		pos = new google.maps.LatLng(pos[1], pos[0]);

		if (messageData[i].infected) {
			marker = new google.maps.Marker({
			position: pos,
			icon: infectedImg
		});
		} else {
			marker = new google.maps.Marker({
			position: pos,
			icon: healthyImg
			});
		}
		marker.setMap(map);
	}

	// marker = new google.maps.Marker({
	// 	position: me,
	// 	icon: 'biohazard_location.png'
	// });
	// marker.content = "You are here";
	// marker.setMap(map);

	// google.maps.event.addListener(marker, 'click', function(){
	// 	infowindow.setContent(this.content);
	// 	infowindow.open(this.getMap(), this);
	// });
}