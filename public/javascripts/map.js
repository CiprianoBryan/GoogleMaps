function myPosition() {
  var coordinate = null;
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      coordinate = position.coords;
    }, function() {});
  }
  return coordinate;
}

function addMarker(address) {
  geocoder.geocode({'address': address}, function(results, status) {
    if (status === 'OK') {
      if (results[0]) {
        let location = results[0].geometry.location;
        map.setCenter(location);
        markerInit.setOptions({
          map: map,
          draggable: true,
          position: location
        });
      }
    }
  });
}

function updateLocation(request, index) {
  geocoder.geocode(request, function(results, status) {
    if (status === 'OK') {
      if (results[0]) {
        pointAddress[index] = results[0].formatted_address;
        document.getElementById(pointName[index]).value = pointAddress[index];
      }
    }
  });
}

function computeTotalDistance(result) {
  totalDistance = 0;
  let myroute = result.routes[0];
  let order = result.routes[0].waypoint_order;
  let waypts = result.geocoded_waypoints;
  for (let i=0; i < waypts.length; i++) {
    updateLocation({'placeId': waypts[i].place_id}, i);
  }
  for (let i=0; i < nroPoints-1; i++) {
    totalDistance += myroute.legs[i].distance.value;
  }
  totalDistance = totalDistance/1000;
  document.getElementById('total').innerHTML = totalDistance + ' km';
}

var markerInit;
var pointName;
var geocoder;
var totalDistance;
var directionsService;
var directionsDisplay;
var pointAddress;
var buttonOptimate;
var buttonAdd;
var formPoints;
var nroPoints;
var map;
/*------------------------- INIT PROJECT ---------------------- */

function initialize() {
  nroPoints = 0;
  markerInit = new google.maps.Marker;
  pointAddress = [null, null];
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
    }
  });
  AutocompleteDirectionsHandler(0);
  AutocompleteDirectionsHandler(1);
  formPoints = document.getElementById('formPoints');
  buttonAdd = document.getElementById('buttonAdd');
  buttonOptimate = document.getElementById('buttonOptimate');
  buttonAdd.addEventListener('click', pressButtonAdd, false);
  buttonOptimate.addEventListener('click', pressButtonOptimate, false);
  directionsDisplay.addListener('directions_changed', function() {
    computeTotalDistance(directionsDisplay.getDirections());
  });
  markerInit.addListener('mouseup', function() {
    updateLocation({'location': markerInit.position}, 0);
  });
}

function pressButtonAdd(event) {
  if(pointAddress.length != nroPoints) {
    return;
  }
  var input = document.createElement('input');
  var newId = 'point' + (nroPoints + 1);
  pointAddress.push(null);
  pointName.push(newId);
  input.setAttribute('id', newId);
  input.setAttribute('class', 'controls');
  input.setAttribute('placeholder', "Elige un destino");
  formPoints.insertBefore(input, buttonAdd);
  buttonAdd.setAttribute('class', 'disabled');
  buttonOptimate.setAttribute('class', 'disabled');
  AutocompleteDirectionsHandler(nroPoints);
}

function pressButtonOptimate(event) {
  let pointAddressOrig = pointAddress.slice();
  let index = nroPoints-1 , minDistance = totalDistance;
  for(let i=nroPoints-1; i >= 1; i --) {
    let tmp = pointAddress[i];
    pointAddress[i] = pointAddress[nroPoints-1];
    pointAddress[nroPoints-1] = tmp;
    asyncDisplayRoute( callback );
    if(minDistance > totalDistance) {
      minDistance = totalDistance;
      index = i;
    }
    pointAddress = pointAddressOrig.slice();
  }
  let tmp = pointAddress[index];
  pointAddress[index] = pointAddress[nroPoints-1];
  pointAddress[nroPoints-1] = tmp;
  displayRoute(true);
}

function asyncDisplayRoute( callback ) {
}

function callback() {
  displayRoute(true);
}

function AutocompleteDirectionsHandler(index) {
  pointInput = document.getElementById(pointName[index]);
  pointAutocomplete = new google.maps.places.Autocomplete(pointInput);
  setupPlaceChangedListener(pointAutocomplete, index);
}

function setupPlaceChangedListener(autocomplete, index) {
  autocomplete.bindTo('bounds', map);
  autocomplete.addListener('place_changed', function() {
    var place = autocomplete.getPlace();
    if (!place.formatted_address) {
      alert("Please select an option from the dropdown list.");
      return;
    }
    if(!pointAddress[index]) {
      nroPoints ++;
    }
    if(nroPoints >= 2) {
      buttonAdd.setAttribute('class', 'enabled');
      buttonOptimate.setAttribute('class', 'enabled');
    }
    pointAddress[index] = place.formatted_address;
    displayRoute(false);
  });
};

function displayRoute(isOptime) {
  if(nroPoints == 1) {
    addMarker(pointAddress[0]);
    return;
  }
  if(nroPoints == 2) {
    markerInit.setMap(null);
  }
  let waypts = [];
  for(let i = 1 ; i < nroPoints-1; i ++) {
    waypts.push({
      location: pointAddress[i]
    });
  }
  directionsService.route({
    origin: pointAddress[0],
    destination: pointAddress[nroPoints-1],
    waypoints: waypts,
    travelMode: 'DRIVING',
    optimizeWaypoints: isOptime
  }, function(response, status) {
    if (status === 'OK') {
      directionsDisplay.setDirections(response);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
};

window.addEventListener('load',initialize,false);