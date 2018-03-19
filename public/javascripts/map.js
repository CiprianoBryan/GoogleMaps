function mapLocation() {
  function getIconMarker(feature) {
    let iconBase = 'http://maps.google.com/mapfiles/kml/';
    var icons = {
      mark: {
        icon: iconBase + 'paddle/red-circle.png'
      },
      parking: {
        icon: iconBase + 'shapes/parking_lot_maps.png'
      },
      library: {
        icon: iconBase + 'shapes/library_maps.png'
      },
      info: {
        icon: iconBase + 'shapes/info-i_maps.png'
      }
    };
    return icons[feature].icon;
  }

  var pointName = ['point1', 'point2', 'point3', 'point4', 'point5', 'point6'];

  /*------------------------- INIT PROJECT ---------------------- */

  function initialize() {
    var infoWindow = new google.maps.InfoWindow({map: map});
    function myPosition() {
      var coordinate = null;
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          coordinate = position.coords;
        }, function() {});
      }
      return coordinate;
    }
    var ParqueJohnFKennedy = new google.maps.LatLng(-12.1220124, -77.0307685);
    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 16,
      center: ParqueJohnFKennedy
    });
    new AutocompleteDirectionsHandler(map);
  }

  function AutocompleteDirectionsHandler(map) {
    this.map = map;
    this.pointPlaceId = [null, null, null, null, null, null];
    this.directionsService = new google.maps.DirectionsService;
    this.directionsDisplay = new google.maps.DirectionsRenderer;

    var pointInput = [null, null, null, null, null, null];
    for(let i = 0; i <= 5; i ++) {
      pointInput[i] = document.getElementById(pointName[i]);
    }
    var pointAutocomplete = [];
    for(let i = 0; i <= 5; i ++) {
      pointAutocomplete[i] = new google.maps.places.Autocomplete(pointInput[i], {placeIdOnly: true});
    }

    this.directionsDisplay.setOptions({
      map: map,
      draggable: true,
      panel: document.getElementById('panel'),
      markerOptions: {
        // icon: getIconMarker('mark'),
        animation: google.maps.Animation.DROP,
      }
    });
    for(let i = 0; i <= 5; i ++) {
      this.setupPlaceChangedListener(pointAutocomplete[i], i);
    }
    // this.directionsDisplay.addListener('directions_changed', computeTotalDistance);
    
    // this.directionsDisplay.addListener('directions_changed', function() {
    //   computeTotalDistance(this.directionsDisplay.getDirections());
    // });
  }

  AutocompleteDirectionsHandler.prototype.setupPlaceChangedListener = function(autocomplete, index) {
    var me = this;
    autocomplete.bindTo('bounds', this.map);
    autocomplete.addListener('place_changed', function() {
      var place = autocomplete.getPlace();
      if (!place.place_id) {
        alert("Please select an option from the dropdown list.");
        return;
      }
      me.pointPlaceId[index] = place.place_id;
      me.route();
    });
  };

  AutocompleteDirectionsHandler.prototype.route = function () {
    for( let i = 1; i <= 5; i ++ ) {
      if( this.pointPlaceId[i] && !this.pointPlaceId[i-1] ) {
        alert("Falta ingresar el anterior punto");
        return;
      }
    }
    var n = 1;
    for( ; n <= 5; n ++ ) {
      if( !this.pointPlaceId[n] ) {
        break;
      }
    }
    var waypoints = [];
    for(let i = 1 ; i < n - 1; i ++) {
      waypoints.push({
        location: {'placeId': this.pointPlaceId[i]}
      });
    }
    var me = this;
    this.directionsService.route({
      origin: {'placeId': this.pointPlaceId[0]},
      destination: {'placeId': this.pointPlaceId[n-1]},
      waypoints: waypoints,
      travelMode: 'WALKING',
      // transitOptions: TransitOptions,
      // drivingOptions: DrivingOptions,
      // unitSystem: UnitSystem,
      // avoidHighways: Boolean,
      // avoidTolls: true
    }, function(response, status) {
      if (status === 'OK') {
        me.directionsDisplay.setDirections(response);

      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  };

  function computeTotalDistance(result) {
    var total = 0;
    alert("compute distance");
    var myroute = result.routes[0];
    for (var i = 0; i < myroute.legs.length; i++) {
      total += myroute.legs[i].distance.value;
    }
    total = total / 1000;
    document.getElementById('total').innerHTML = total + ' km';
  }
  
  google.maps.event.addDomListener(window, 'load', initialize);
}