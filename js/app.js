//Declaration of all the necessary variables
var locations = [
			{ name: 'Corning Museum Of Glass',location:{lat: 42.149839, lng: -77.054048}},
			{ name: 'Rockwell Museum' ,location:{lat: 42.142627, lng: -77.052871}},
			{ name: 'Corning Bottles and Corks',location:{lat: 42.144192, lng: -77.059808 }},
			{ name: 'Anellios Pizzeria',location:{lat: 42.142722, lng: -77.051751 }},
			{ name: 'Wegmans',location:{lat: 42.149085, lng: -77.060578}},
			{ name: 'Atlas Pizzeria',location:{lat: 42.1427778, lng: -77.055 }}
		];
var map;
var marker;
var markers=[];
var largeInfowindow;
var locationsLength = locations.length;

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
          center: {lat: 42.1427778, lng: -77.055},
          zoom: 15
        }); 
        for(i=0;i<locationsLength; i++){
	        marker = new google.maps.Marker({
	            map: map,
	            position: locations[i].location,
	            title: locations[i].name,
	            animation: google.maps.Animation.DROP
	        });	
	        //create a marker property for the locations array to store the every marker for their associated locations
	        locations[i].marker = marker;
	 		//push the marker to the markers array.
	        markers.push(marker);
	     	// Create an onclick event to open an infowindow at each marker.
	       	marker.addListener('click', function() {
				toggleMarker(this);
	    		populateInfoWindow(this, largeInfowindow);
			});	 
		}	
		ko.applyBindings(new viewModel());
}

function toggleMarker(marker) {
 	if (marker.getAnimation() !== null) {
    		marker.setAnimation(null);
   	} else {
      	marker.setAnimation(google.maps.Animation.DROP);
   	}
}
function populateInfoWindow(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if(infowindow.marker != marker) {
          infowindow.marker = marker;
          infowindow.setContent('<div>' + marker.title + '</div>');
          infowindow.open(map, marker);
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
          });
        }
      }
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

	this.query = ko.computed(function(){

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
