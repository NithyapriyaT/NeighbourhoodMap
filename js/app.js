//Declaration of all the necessary variables
var placeArray = [
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
var placeArrayLength = placeArray.length;
var locationList;
var stringStartsWith = function (string, startsWith) { 
console.log("hai");        
        string = string || "";
        if (startsWith.length > string.length)
            return false;
        return string.substring(0, startsWith.length) === startsWith;
    };

var viewModel = function(){
//Added a function for the click databind to display the infowindow on clicking the list
	this.locationList = ko.observable(placeArray);

	this.displayInfoWindow = function(place){
		for(var i=0; i<placeArrayLength; i++){
			if(place.name === placeArray[i].name){
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
			return this.locationList();
		}
		else {
			return ko.utils.arrayFilter(this.locationList(), function(list) {
            	return stringStartsWith(list.name.toLowerCase(), queryThePlaces);	
        	});
		}	
	},this);
};
ko.applyBindings(new viewModel());	


//initMap callback function.
function initMap() {
	largeInfowindow = new google.maps.InfoWindow();
    // Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 42.1427778, lng: -77.055},
          zoom: 15
        }); 
        for(i=0;i<placeArrayLength; i++){
        	//console.log("inside marker")
	        marker = new google.maps.Marker({
	            map: map,
	            position: placeArray[i].location,
	            title: placeArray[i].name,
	            animation: google.maps.Animation.DROP
	        });	
	        markers.push(marker);
	     	// Create an onclick event to open an infowindow at each marker.
	       	marker.addListener('click', function() {
				toggleMarker(this);
	    		populateInfoWindow(this, largeInfowindow);
			});	 
		}	
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
          	console.log("close");
            infowindow.marker = null;
          });
        }
      }


