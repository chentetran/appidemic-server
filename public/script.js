var lat = 0;
var lng = 0;
var me;
var infowindow;
var map;
var marker;
var messageData;
var options;

var request = new XMLHttpRequest();
request.open("GET", "https://appidemic.herokuapp.com/stats.json", true);
request.onreadystatechange = parse;

function parse() {
	if (request.readyState == 4 && request.status == 200) {
		messageData = JSON.parse(request.responseText);
		displayStats();
		renderMap();

	} else if (request.readyState == 4 && request.status != 200) {
		alert('Unable to load users');
	}
}

function displayStats() {
	var totalInfected = document.getElementById('totalInfected').innerHTML = messageData.numInfected;
	var totalUsers = document.getElementById('totalUsers').innerHTML = messageData.numUsers;
	document.getElementById('percentInfected').innerHTML = totalInfected/totalUsers * 100;

	var today = new Date();
	var dateStart = messageData.dateStart;
	var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
	document.getElementById('time').innerHTML = diffDays = Math.round(Math.abs((today.getTime() - dateStart.getTime())/(oneDay)));
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
	var usersArr = messageData.usersArr;
	for (var i = 0; i < usersArr.length; i++) {
		pos = usersArr[i]['geometry']['coordinates'];
		pos = new google.maps.LatLng(pos[1], pos[0]);

		var infected = usersArr[i].infected;
		if (infected) {
			marker = new google.maps.Marker({
				position: pos,
				icon: infectedImg
			});
			var dateInfected = document.getElementById('dateInfected');
			dateInfected.style.display = "inline";
			dateInfected.innerHTML = usersArr[i].dateInfected;

		} else {
			marker = new google.maps.Marker({
			position: pos,
			icon: healthyImg
			});
		}
		marker.numInfected = usersArr[i].numInfected;
		
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
			// Show statistics in right panel
			document.getElementById('userStats').style.display = 'inline';
			var infectedText = document.getElementById('infected');
			if (infected) {
				infectedText.innerHTML = "INFECTED";
				infectedText.style.color = "#ff0000";
			} else {
				infectedText.innerHTML = "HEALTHY";
				infectedText.style.color = "#00ff00";
			}
			document.getElementById('numInfected').innerHTML = this.numInfected;

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
