var lat = 0;
var lng = 0;
var me;
var infowindow;
var map;
var marker;
var messageData;
var options;

function init()
{
	// Get user's location
	if (navigator.geolocation) { // if browser supported
		navigator.geolocation.getCurrentPosition( 
			function(position) {
				lat = position.coords.latitude;
				lng = position.coords.longitude;
				console.log(lat);
				console.log(lng);
				renderMap();
			});
	}
	else {
		alert("Your browser does not support location");
		renderMap();
	}
}


function renderMap()
{
	me = new google.maps.LatLng(lat, lng);
	infowindow = new google.maps.InfoWindow();
	options = {
					zoom: 7,
					center: me,
					mapTypeId: google.maps.MapTypeId.ROADMAP
			  };

	map = new google.maps.Map(document.getElementById("map"), options);
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