var map;
var markersLayer; //The markerLayer holds all markers added to the map, used to easily clear


/*
    @Description    Initializes the map with the location passed in as parameters
*/
function initMap(longitude, latitude){
    // initialize the map
    map = L.map('map').setView([latitude, longitude], 14.8);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiYzE1NzI5NzcxIiwiYSI6ImNqb2hkZ3I4MzBpYTEzcG8zdG9menE4aWgifQ.omQRZRZ0uMdYT7Dc-qVXwQ'
    }).addTo(map);

    markersLayer.addTo(map);
}

/*
    @Description    Retrieves the cooridates for a hole and renders them as a line on the map
*/
function getCoordinatesForHole(event){
    $csrfToken = getCookie('csrftoken');
    $id = event.target.name;

    if($id != '' && $csrfToken != ''){
        $.ajax({
            url: 'getHoleCoordinates',
            type: 'POST',
    		async: true,
    		data:{
    			id: $id,
    			csrfmiddlewaretoken: $csrfToken
    		},
    		success: function(response){
    		    if(response.holeGeoCodes != '' && response.holeGeoCodes.length > 1){
    		        drawHoleCoordinatesOnMap(response.holeGeoCodes, response.holeNumber);
    		    }
    		}
        });
    }
}

/*
    @Description    Clear lines from the map
*/
function clearLinesFromMap() {
    for(i in map._layers) {
        if(map._layers[i]._path != undefined) {
            try {
                map.removeLayer(map._layers[i]);
            }
            catch(e) {
                console.log("problem with " + e + map._layers[i]);
            }
        }
    }
}

/*
    @Description     Creates a marker on the map
    @param           startMarker - set to true for a start marker, false for an end
*/
function createMapMarker(map, markerMessage, latitude, longitude, startMarker) {
    var marker = L.marker([latitude, longitude]); ;
    marker.bindPopup(markerMessage);
    marker.on('click', showMarkerBaloon);
    markersLayer.addLayer(marker);
}

/*
    @Description    Converts a 1D array to 2D
*/
function convertArrayTo2D(arrayToConvert){
    var newArr = [];
    while(arrayToConvert.length) newArr.push(arrayToConvert.splice(0,2));

    console.log('newArr: ', newArr);
    return newArr;
}

/*
    @Description    Shows baloon above marker
*/
function showMarkerBaloon(e) {
    var popup = e.target.getPopup();
    var content = popup.getContent();
}

/*
    @Description    Retrieves a any cookie from browser by name
*/
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function drawHoleCoordinatesOnMap(geoCodes, holeNumber){
    var geoCodePairList = convertArrayTo2D(geoCodes);
    drawGeoCodeListOnMap(geoCodePairList, holeNumber);
}

/*
    @Description    draws a line on the map based on the geocode values stored in passed geo array
*/
function drawGeoCodeListOnMap(geoArray, holeNumber) {

    clearLinesFromMap();
    markersLayer.clearLayers();

    var polyLine = L.polyline(geoArray,
        {
            color: 'blue',
            weight: 3,
            opacity: 5,
            lineJoin: 'round'
        }
    ).addTo(map);

    //Add the buffer around the polyline
    L.polyline(geoArray,
        {
            color: 'blue',
            weight: 23,
            opacity: 0.3,
            lineJoin: 'round'
        }
    ).addTo(map);

    map.fitBounds(polyLine.getBounds());

    var startLat = geoArray[0][0];
    var startLong = geoArray[0][1];
    var endLat = geoArray[geoArray.length-1][0];
    var endLong = geoArray[geoArray.length-1][1];
    createMapMarker(map, 'Start Hole ' + holeNumber, startLat, startLong, false);
    createMapMarker(map, 'End Hole ' + holeNumber, endLat, endLong, false);
}