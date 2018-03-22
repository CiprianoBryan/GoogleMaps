function myPosition() {
  var coordinate = null;
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      coordinate = position.coords;
    }, function() {});
  }
  return coordinate;
}

function addMarker(location) {
  map.setCenter(location);
  markerInit.setOptions({
    map: map,
    draggable: true,
    position: location
  });
}

function updateLocation(request, index) {
  geocoder.geocode(request, function(results, status) {
    if (status === 'OK') {
      if (results[0]) {
        pointLocation[index] = results[0].geometry.location;
        document.getElementById(pointName[index]).value = results[0].formatted_address;
      }
    }
  });
}

function computeTotalDistance(result) {
  let totalDistance = 0;
  let totalDuration = 0;
  let myroute = result.routes[0];
  let order = result.routes[0].waypoint_order;
  let waypoints = result.geocoded_waypoints;
  for (let i=0; i < waypoints.length; i++) {
    updateLocation({'placeId': waypoints[i].place_id}, i);
  }
  for (let i=0; i < nroPoints-1; i++) {
    totalDistance += myroute.legs[i].distance.value;
    totalDuration += myroute.legs[i].duration.value;
  }
  totalDuration = totalDuration/60;
  totalDistance = totalDistance/1000;
  document.getElementById('total').innerHTML = totalDistance + ' km';
}

var markerInit;
var pointName;
var geocoder;
var directionsService;
var directionsDisplay;
var pointLocation;
// var buttonOptimate;
var buttonAdd;
var formPoints;
var nroPoints;
var map;
/*------------------------- INIT PROJECT ---------------------- */

function initialize() {
  nroPoints = 0;
  markerInit = new google.maps.Marker;
  pointLocation = [null, null];
  pointName = ['point1', 'point2'];
  geocoder = new google.maps.Geocoder;
  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer;
  var ParqueJohnFKennedy = new google.maps.LatLng(-12.1220124, -77.0307685);
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 16,
    center: ParqueJohnFKennedy
  });
  directionsDisplay.setOptions({
    map: map,
    draggable: true,
    panel: document.getElementById('panel'),
    polylineOptions: {
      clickable: false,
      strokeColor: '#2C6DAC',
      strokeWeight: 4
    },
    markerOptions: {
      // draggable:true
      // animation: google.maps.Animation.DROP,
    }
  });
  AutocompleteDirectionsHandler(0);
  AutocompleteDirectionsHandler(1);
  buttonAdd = document.getElementById('buttonAdd');
  // buttonOptimate = document.getElementById('buttonOptimate');
  formPoints = document.getElementById('formPoints');
  buttonAdd.addEventListener('click', pressButtonAdd, false);
  // buttonOptimate.addEventListener('click', pressButtonOptimate, false);
  directionsDisplay.addListener('directions_changed', function() {
    computeTotalDistance(directionsDisplay.getDirections());
  });
  markerInit.addListener('mouseup', function() {
    updateLocation({location: markerInit.position}, 0);
  });
}

function pressButtonAdd(event) {
  if(pointLocation.length != nroPoints) {
    return;
  }
  var input = document.createElement('input');
  var newId = 'point' + (nroPoints + 1);
  pointLocation.push(null);
  pointName.push(newId);
  input.setAttribute('id', newId);
  input.setAttribute('class', 'controls');
  input.setAttribute('placeholder', "Elige un destino");
  formPoints.insertBefore(input, buttonAdd);
  buttonAdd.setAttribute('class', 'disabled');
  AutocompleteDirectionsHandler(nroPoints);
}

// function pressButtonOptimate(event) {
//   var orderedPointLocation = pointLocation;
//   for(let i=nroPoints-1; i >= 1; i --) {
//     swap(pointLocation[i], pointLocation[nroPoints-1]);
//     alert(pointLocation[i]);
//     alert(orderedPointLocation[i]);
//   }
// }

function AutocompleteDirectionsHandler(index) {
  pointInput = document.getElementById(pointName[index]);
  pointAutocomplete = new google.maps.places.Autocomplete(pointInput);
  setupPlaceChangedListener(pointAutocomplete, index);
}

function setupPlaceChangedListener(autocomplete, index) {
  autocomplete.bindTo('bounds', map);
  autocomplete.addListener('place_changed', function() {
    var place = autocomplete.getPlace();
    if (!place.geometry) {
      alert("Please select an option from the dropdown list.");
      return;
    }
    if(!pointLocation[index]) {
      nroPoints ++;
    }
    if(nroPoints >= 2) {
      buttonAdd.setAttribute('class', 'enabled');
    }
    pointLocation[index] = place.geometry.location;
    displayRoute(false);
  });
};

function displayRoute(isOptime) {
  if(nroPoints == 1) {
    addMarker(pointLocation[0]);
    return;
  }
  if(nroPoints == 2) {
    markerInit.setMap(null);
  }
  let waypoints = [];
  for(let i = 1 ; i < nroPoints-1; i ++) {
    waypoints.push({
      location: pointLocation[i]
    });
  }
  directionsService.route({
    origin: pointLocation[0],
    destination: pointLocation[nroPoints-1],
    waypoints: waypoints,
    travelMode: 'DRIVING',
    // optimizeWaypoints: isOptime
  }, function(response, status) {
    if (status === 'OK') {
      directionsDisplay.setDirections(response);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
};

window.addEventListener('load',initialize,false);