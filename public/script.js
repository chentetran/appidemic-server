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
					zoom: 11,
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

		var infected = messageData[i].infected;
		if (infected) {
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
		
		infectionRadius = new google.maps.Circle({
			strokeColor: "#ff0000",
	        strokeOpacity: 0.25,
	        strokeWeight: 2,
	        fillColor: "#ff0000",
	        fillOpacity: .15,
	        map: map,
	        radius: 100 // in meters
		});
		// On click, display radius of infection
		// and statistics
		google.maps.event.addListener(marker, 'click', function() {

			// infowindow.setContent(this.content);
			// infowindow.open(this.getMap(), this);

			// Show right panel & statistics
			var panel = document.getElementById('panel');
			panel.style.display = 'inline';
			var infectedText = document.getElementById('infected');
			if (infected) {
				infectedText.innerHTML = "INFECTED";
				infectedText.style.color = "#ff0000";
			} else {
				infectedText.innerHTML = "HEALTHY";
				infectedText.style.color = "#00ff00";
			}

			// Show radius of infection
			infectionRadius.center = pos;
			infectionRadius.bindTo('center', this, 'position');
		});

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