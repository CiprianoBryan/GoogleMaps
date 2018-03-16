var map;
function initMap() {
    var coordinate = {
        lat: -12.1220128,
        lng: -77.0324022
    }
    map = new google.maps.Map(document.getElementById('map'), {
        center: coordinate,
        zoom: 17
    });
    var marker = new google.maps.Marker({
        position: coordinate,
        map: map
    });
}