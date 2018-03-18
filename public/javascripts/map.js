function mapLocation() {

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

  function AutocompleteDirectionsHandler(map) {
    this.map = map;
    this.pointPlaceId = [null, null, null, null, null, null];
    this.travelMode = 'WALKING';

    var pointInput = [null, null, null, null, null, null];
    for(let i = 0; i <= 5; i ++) {
      pointInput[i] = document.getElementById(pointName[i]);
    }

    this.directionsService = new google.maps.DirectionsService;
    this.directionsDisplay = new google.maps.DirectionsRenderer;
    this.directionsDisplay.setOptions({
      draggable: true,
      markerOptions: {
        // icon: getIconMarker('mark'),
        animation: google.maps.Animation.DROP,
      }
    });
    this.directionsDisplay.setMap(map);
    
    var pointAutocomplete = [];
    for(let i = 0; i <= 5; i ++) {
      pointAutocomplete[i] = new google.maps.places.Autocomplete(pointInput[i], {placeIdOnly: true});
    }

    for(let i = 0; i <= 5; i ++) {
      this.setupPlaceChangedListener(pointAutocomplete[i], i);
    }
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

  AutocompleteDirectionsHandler.prototype.route = function() {
    for(let i = 1; i <= 5; i ++) {
      if( this.pointPlaceId[i] && !this.pointPlaceId[i-1] ) {
        alert("Falta ingresar el anterior punto");
        return;
      }
    }
    var me = this;
    for(let i = 1; i <= 5; i ++) {
      this.directionsService.route({
        origin: {'placeId': this.pointPlaceId[i-1]},
        destination: {'placeId': this.pointPlaceId[i]},
        travelMode: this.travelMode
      }, function(response, status) {
        if (status === 'OK') {
          me.directionsDisplay.setDirections(response);
          me.directionsDisplay.setRouteIndex(i);
        } else {
          window.alert('Directions request failed due to ' + status);
        }
      });
    }
  };
  
  google.maps.event.addDomListener(window, 'load', initialize);
}