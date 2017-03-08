//Declaration of all the necessary variables
var locations = [
	{ name: 'Corning Museum Of Glass',location:{lat: 42.149839, lng: -77.054048},address:'1 Museum Way, Corning, NY 14830'},
	{ name: 'Rockwell Museum' ,location:{lat: 42.142627, lng: -77.052871},address:'111 Cedar St, Corning, NY 14830'},
	{ name: 'Benjamin Patterson inn',location:{lat: 42.142852, lng: -77.054690 },address:'73 W Pulteney St, Corning, NY 14830'},
	{ name: 'Corning Incorp',location:{lat: 42.159780, lng: -77.121191 },address:'Lynn Morse Rd,Painted Post, NY 14870'},
	{ name: 'Wegmans Foods',location:{lat: 42.149085, lng: -77.060578},address:'24 South Bridge St, Corning, NY 14830'}
];
var map;
var bounds;
var marker;
var markers=[];
var largeInfowindow;
var locationsLength = locations.length;

//initMap callback function.
function initMap() {
	largeInfowindow = new google.maps.InfoWindow();
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 42.150897, lng: -77.079306},
      zoom: 14
    });
    // Create a marker for the given locations
    for(i=0;i<locationsLength; i++){
        marker = new google.maps.Marker({
            map: map,
            position: locations[i].location,
            title: locations[i].name,
            address: locations[i].address,
            animation: google.maps.Animation.DROP
        });	
        //Create a marker for the locations array to store the every marker for their associated locations.
        locations[i].marker = marker;
 		//Push the marker to the markers array.
        markers.push(marker);
     	//Create an onclick event to open an infowindow at each marker.
       	marker.addListener('click', function() {
			toggleMarker(this);
    		populateInfoWindow(this, largeInfowindow);
		});	 		
	}
	//Bounds are created to place all the markers visible
	bounds = new google.maps.LatLngBounds();
	//Listener are added to load and resize the window so we can fit all the given markers.
	google.maps.event.addDomListener(window, 'load',showListings);
	google.maps.event.addDomListener(window, 'resize', showListings);
	//This function is called by the listener to show all the markers.
	function showListings () {
		map.setCenter({lat: 42.150897, lng: -77.079306});
	        // Extend the boundaries of the map for each marker and display the marker.
	        for (var i = 0; i < markers.length; i++) {
	          markers[i].setMap(map);
	          bounds.extend(markers[i].position);
	        }
	    map.fitBounds(bounds);      
    }
	//Apply the bindings here to make sure first my map is properly loaded.    
	ko.applyBindings(new viewModel());
}

//This function is to create an animation when the marker is clicked in the map or in the list.
function toggleMarker(marker) {
 	if (marker.getAnimation() !== null) {
    		marker.setAnimation(null);
   	} else {
      	marker.setAnimation(google.maps.Animation.DROP);
   	}
}
//This function is to create an infowindow for every marker.
function populateInfoWindow(marker, infowindow) {
	var streetUrl = 'https://maps.googleapis.com/maps/api/streetview?size=200x100&location=' + marker.address +'';
	//Used an ajax function to call wikipedia API to get the details about the location.
	var wikiRequestTimeout = setTimeout(function(){
        infowindow.setContent("Failed to load wikipedia resources for" + '<div>' + marker.title + '</div>');
        infowindow.open(map,marker);
    },1000);
	var wikipediaUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';
	$.ajax({
		url: wikipediaUrl,
		dataType: "jsonp",
		//jsonp : "callback",
		//The response from wikipedia are stored to use in the code.Response[2] gives the article about the location.response[3] give sthe wikipedia link 
		//about the location.Both link and article is used in the infowindow to give details about the location.
		success: function( response ) {
			var article = response[2];
			var link = response[3];
			if(infowindow.marker != marker) {
	        	infowindow.marker = marker;
	          	infowindow.setContent('<li><a href="' + link +'">'+ marker.title +'</a></li>'+'<div>'+ marker.address +'</div>'+'<div>' + article + '</div>'+'<img class="bgimg" src="' + streetUrl + '">');
	          	infowindow.open(map, marker);
	          	// Make sure the marker property is cleared if the infowindow is closed.
	          	infowindow.addListener('closeclick', function() {
	            infowindow.marker = null;
	            map.fitBounds(bounds);
         	 	});
        	}
        	clearTimeout(wikiRequestTimeout);
		}
	});
}
//view model      
var viewModel = function(){
	this.locations = ko.observable(locations);
//Added a function for the click databind to display the infowindow on clicking the list location.Matched the location when clicked with the model data.
//Accoding to the location marker is selected.Then toggles the marker and the infowindow will be opening to the respective marker.
	this.displayInfoWindow = function(place){
		for(var i=0; i<locationsLength; i++){
			if(place.name === locations[i].name){
				var markerNewRef = markers[i];
				toggleMarker(markerNewRef);
				populateInfoWindow(markerNewRef, largeInfowindow);
			}
		}
	};
	this.queryThePlaces = ko.observable('');
	//This function is to filter the list according to what letter are you typing.If the search bar is empty then it displays all the list of locations.
	this.query = ko.computed(function(){
		//makes the map to show the markers.
		map.fitBounds(bounds);
		largeInfowindow.close();
		var queryThePlaces = this.queryThePlaces().toLowerCase();
		//This utils function help to filter the search according to the letter you type in and it makes the respective markers visible.
		return ko.utils.arrayFilter(this.locations(), function(list) {
    	var result = list.name.toLowerCase().indexOf(queryThePlaces) > -1;
    	list.marker.setVisible(result);
      	return result;
		});	
	},this);
};
