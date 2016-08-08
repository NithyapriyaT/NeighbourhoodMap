//Declaration of all the necessary variables
var locations = [
			{ name: 'Corning Museum Of Glass',location:{lat: 42.149839, lng: -77.054048}},
			{ name: 'Rockwell Museum' ,location:{lat: 42.142627, lng: -77.052871}},
			{ name: 'Benjamin Patterson inn',location:{lat: 42.142852, lng: -77.054690 }},
			{ name: 'Corning Incorporated',location:{lat: 42.159780, lng: -77.121191 }},
			{ name: 'Wegmans Foods',location:{lat: 42.149085, lng: -77.060578}}
		];
var map;
var marker;
var markers=[];
var largeInfowindow;
var locationsLength = locations.length;
var $wikiElem = $('#wikipedia-links');
  $wikiElem.text("");

//This function is removed in knockout 2.0 so i added the function definition in my code directly.
var stringStartsWith = function (string, startsWith) {        
        string = string || "";
        if (startsWith.length > string.length)
            return false;
        return string.substring(0, startsWith.length) === startsWith;
    };

//initMap callback function.
function initMap() {
	largeInfowindow = new google.maps.InfoWindow();
    // Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 42.150897, lng: -77.079306},
          zoom: 13
        });
        // Create a marker for the given locations
        for(i=0;i<locationsLength; i++){
	        marker = new google.maps.Marker({
	            map: map,
	            position: locations[i].location,
	            title: locations[i].name,
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
		var bounds = new google.maps.LatLngBounds();
		//var bounds = new google.maps.LatLngBounds({lat: 42.170747, lng: -77.020597}, {lat: 42.129512, lng: -77.148829});
		//Listener are added to load and resize the window so we can fit all the given markers.
		google.maps.event.addDomListener(window, 'load',showListings);
		google.maps.event.addDomListener(window, 'resize', showListings);
		//This function is called by the listener to show all the markers.
		function showListings () {
			map.setCenter({lat: 42.150897, lng: -77.079306});
		        // Extend the boundaries of the map for each marker and display the marker
		        for (var i = 0; i < markers.length; i++) {
		          markers[i].setMap(map);
		          bounds.extend(markers[i].position);
		        }
		        map.fitBounds(bounds);      
	    }
	//Apply the bindings here to make sure first my map is properly loaded.    
	ko.applyBindings(new viewModel());
}

//This function is to create an animation when the marker is clicked in the map or in the list
function toggleMarker(marker) {
 	if (marker.getAnimation() !== null) {
    		marker.setAnimation(null);
   	} else {
      	marker.setAnimation(google.maps.Animation.DROP);
   	}
}
//This function is to create an infowindow for every marker.
function populateInfoWindow(marker, infowindow) {
	//Used an ajax function to get the wiki resource about the location.
	var wikiRequestTimeout = setTimeout(function(){
        $wikiElem.text("Failed to load wikipedia resources");
    },8000);
	var wikipediaUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';
	$.ajax({
		url: wikipediaUrl,
		dataType: "jsonp",
		//jsonp : "callback",
		success: function( response ) {
			var article = response[2];
			var link = response[3];
			if(infowindow.marker != marker) {
	        	infowindow.marker = marker;
	          	infowindow.setContent('<li><a href="' + link +'">'+ marker.title +'</a></li>'+'<div>' + article + '</div>');
	          	infowindow.open(map, marker);
	          	// Make sure the marker property is cleared if the infowindow is closed.
	          	infowindow.addListener('closeclick', function() {
	            infowindow.marker = null;
         	 	});
        	}
		}
	});
}
//view model      
var viewModel = function(){
	this.locations = ko.observable(locations);
//Added a function for the click databind to display the infowindow on clicking the list
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
	//This function is to filter the list according to what letter are you typing.
	this.query = ko.computed(function(){
		largeInfowindow.close();
		var queryThePlaces = this.queryThePlaces().toLowerCase();
		if(!queryThePlaces) {
			for(i=0;i<markers.length;i++){	
	            markers[i].setVisible(true);
            }
			return this.locations();
		}
		else {
			return ko.utils.arrayFilter(this.locations(), function(list) {
            	var result = stringStartsWith(list.name.toLowerCase(), queryThePlaces);
            	if(result == true){
            		list.marker.setVisible(true);
            	}
            	else{
            		list.marker.setVisible(false);
				}
        		return result;
        	});
		}	
	},this);
};
