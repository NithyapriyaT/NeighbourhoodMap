var placeArray = [
			{ name: 'Corning Museum Of Glass',location:{lat: 42.149839, lng: -77.054048}},
			{ name: 'Rockwell Museum' ,location:{lat: 42.142627, lng: -77.052871}},
			{ name: 'Corning Bottles and Corks',location:{lat: 42.144192, lng: -77.059808 }},
			{ name: 'Anellios Pizzeria',location:{lat: 42.142722, lng: -77.051751 }},
			{ name: 'Wegmans',location:{lat: 42.149085, lng: -77.060578}},
			{ name: 'Atlas Pizzeria',location:{lat: 42.1427778, lng: -77.055 }}
		];
		ko.applyBindings(placeArray);

var map;
var markers=[];

function initMap() {
    // Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 42.1427778, lng: -77.055},
          zoom: 15
        }); 
        for(i=0;i<placeArray.length; i++){
	        var marker = new google.maps.Marker({
	            map: map,
	            position: placeArray[i].location,
	            title: placeArray[i].name,
	            animation: google.maps.Animation.DROP
	        });	
	        
	        var largeInfowindow = new google.maps.InfoWindow();
	        // Push the marker to our array of markers.
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
 			//console.log("hello");
    		marker.setAnimation(null);
   	} else {
    		//console.log("else");
      	marker.setAnimation(google.maps.Animation.DROP);
   	}
}
function populateInfoWindow(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
          infowindow.marker = marker;
          infowindow.setContent('<div>' + marker.title + '</div>');
          infowindow.open(map, marker);
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
          });
        }
      }