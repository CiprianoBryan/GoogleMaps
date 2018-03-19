function getIconMarker(feature) {
  let iconBase = 'http://maps.google.com/mapfiles/kml/';
  var icons = {
    mark: 'paddle/red-circle.png',
    parking: 'shapes/parking_lot_maps.png',
    library: 'shapes/library_maps.png',
    info: 'shapes/info-i_maps.png'
  };
  return iconBase + icons[feature];
}

function myPosition() {
  var coordinate = null;
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      coordinate = position.coords;
    }, function() {});
  }
  return coordinate;
}

function computeTotalDistance(result) {
  let total = 0;
  let myroute = result.routes[0];
  for (let i = 0; i < myroute.legs.length; i++) {
    total += myroute.legs[i].distance.value;
  }
  total = total / 1000;
  document.getElementById('total').innerHTML = total + ' km';
}

var pointName;
var directionsService;
var directionsDisplay;
var pointPlaceId;
var map;
/*------------------------- INIT PROJECT ---------------------- */

function initialize() {
  pointName = ['point1', 'point2', 'point3', 'point4', 'point5', 'point6'];
  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer;
  pointPlaceId = [null, null, null, null, null, null];
  var ParqueJohnFKennedy = new google.maps.LatLng(-12.1220124, -77.0307685);
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 16,
    center: ParqueJohnFKennedy
  });
  directionsDisplay.setOptions({
    map: map,
    draggable: true,
    panel: document.getElementById('panel'),
    markerOptions: {
      animation: google.maps.Animation.DROP,
    }
  });
  directionsDisplay.addListener('directions_changed', function() {
    computeTotalDistance(directionsDisplay.getDirections());
  });
  AutocompleteDirectionsHandler();
}

function AutocompleteDirectionsHandler() {
  for(let i = 0; i <= 5; i ++) {
    pointInput = document.getElementById(pointName[i]);
    pointAutocomplete = new google.maps.places.Autocomplete(pointInput, {placeIdOnly: true});
    setupPlaceChangedListener(pointAutocomplete, i);
  }
}

function setupPlaceChangedListener(autocomplete, index) {
  autocomplete.bindTo('bounds', map);
  autocomplete.addListener('place_changed', function() {
    var place = autocomplete.getPlace();
    if (!place.place_id) {
      alert("Please select an option from the dropdown list.");
      return;
    }
    pointPlaceId[index] = place.place_id;
    displayRoute();
  });
};

function displayRoute() {
  for( let i = 1; i <= 5; i ++ ) {
    if( pointPlaceId[i] && !pointPlaceId[i-1] ) {
      alert("Falta ingresar el anterior punto");
      pointPlaceId[i] = null;
      return;
    }
  }
  var n = 1;
  for( ; n <= 5; n ++ ) {
    if( !pointPlaceId[n] ) {
      break;
    }
  }
  let waypoints = [];
  for(let i = 1 ; i < n - 1; i ++) {
    waypoints.push({
      location: {'placeId': this.pointPlaceId[i]}
    });
  }
  directionsService.route({
    origin: {'placeId': pointPlaceId[0]},
    destination: {'placeId': pointPlaceId[n-1]},
    waypoints: waypoints,
    travelMode: 'DRIVING',
    // transitOptions: TransitOptions,
    // drivingOptions: DrivingOptions,
    // unitSystem: UnitSystem,
    // avoidHighways: Boolean,
    // avoidTolls: true
  }, function(response, status) {
    if (status === 'OK') {
      directionsDisplay.setDirections(response);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
};