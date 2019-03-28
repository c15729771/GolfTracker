var geo = navigator.geolocation;
var mapLineCoordinates = [];//Holds coordinates for moving user, stored as geocode pairs i.e. [[123,123],[124,124]]
var map; //Class level reference to map object
var watchId; //The Id of the Geolocation watcher, needed to turn off watching(i.e. tracking)
window.onload = function(){
    getCurrentLocation();
    showStartTrackingButton();
    getGameRecordById();
}
/*
    @Description    Makes an AJAX call to Postgres database to retrieve current users Game entry by Id
*/
function getGameRecordById(){
    $urlGameId = getUrlParam('gameId');
    if($urlGameId != ''){
        $csrfToken = getCookie('csrftoken');
        $.ajax({
    		url: 'getGameEntryById',
    		type: 'POST',
    		async: true,
    		data:{
    			gameId: $urlGameId,
    			csrfmiddlewaretoken: $csrfToken
    		},
    		success: function(response){
    			replaceHeader(response.gameName);
    		}
        });
    }
}

/*
    @Description    Attempts to get Users current GeoLocation codes
*/
function getCurrentLocation(){
    //document.getElementById('startTrackingDiv').style.display = 'none';
    if(geo){
        geo.getCurrentPosition(initMapWithCurrentLocation, geoInfoErrorCallback, {timeout:10000, enableHighAccuracy:true});
    }
}

/*
    @Description    Begins tracking a users GeoLocation for movement
*/
function startGeoLocationTracking(){
    console.log('Tracking started!');
    //The success callback method is called whenever a users position is updated
    watchId = geo.watchPosition(setCurrentLocationOnMap, geoInfoErrorCallback, {timeout:10000, enableHighAccuracy:true});
    showStopTrackingButton();
}

/*
    @Description    Stops tracking users location
*/
function stopGeoLocationTracking(){
    console.log('Tracking stopped!');
    geo.clearWatch(watchId);
    showStartTrackingButton();
    var lastEnteredCoOrds = mapLineCoordinates[mapLineCoordinates.length-1];
    createMapMarker(map, 'End', lastEnteredCoOrds[0], lastEnteredCoOrds[1], false);
}

/*
    @Description    Parses a Geolocation position object and prints the result to the console
*/
function initMapWithCurrentLocation(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    var div = document.getElementById( 'location' );
    initMap(longitude, latitude);
}

/*
    @Description    Sets the current location on the Map when a user first open the TrackNow functionality
*/
function setCurrentLocationOnMap(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    drawLineOnMap(map, longitude, latitude);
}

/*
    @Description    Used to process an error response from a Geolocation callout
*/
function geoInfoErrorCallback(){
    console.log('Geo Info not available!');
}

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

    createMapMarker(map, "Hole 1 Tee off", latitude, longitude, true);
    drawLineOnMap(map, longitude, latitude);
}

/*
    @Description     Creates a marker on the map
    @param           startMarker - set to true for a start marker, false for an end
*/
function createMapMarker(map, markerMessage, latitude, longitude, startMarker) {
    var marker;
    if(startMarker){
        marker = marker = setCustomGpsMarker(map, latitude, longitude, 'green_gps_marker.png');

    }
    else{
        marker = setCustomGpsMarker(map, latitude, longitude, 'red_gps_marker.png');
    }
    marker.bindPopup(markerMessage);
    marker.on('click', showMarkerBaloon);
}

/*
    @Description    Shows baloon above marker
*/
function showMarkerBaloon(e) {
    var popup = e.target.getPopup();
    var content = popup.getContent();
}

/*
    @Description    draws a line on the map based on the geocode values stored in mapLineCoordinates
    @param          longitude - the longitude value to add to mapLineCoordinates
    @param          latitude - the latitude value to add to mapLineCoordinates
*/
function drawLineOnMap(map, longitude, latitude) {
    var coordinatePair = [latitude, longitude];
    mapLineCoordinates.push(coordinatePair);

    var polyline = L.polyline(mapLineCoordinates,
        {
            color: 'blue',
            weight: 3,
            opacity: 5,
            dashArray: '10,5',
            lineJoin: 'round'
        }
    ).addTo(map);
}

/*
    @Description    Hides the stop tracking button and shows the start tracking button
*/
function showStartTrackingButton(){
    $("#startTrackingDiv").show();
    $("#stopTrackingDiv").hide();
}

/*
    @Description    Hides the start tracking button and shows the stop tracking button
*/
function showStopTrackingButton(){
    $("#startTrackingDiv").hide();
    $("#stopTrackingDiv").show();
}

/*
    @Description    Adds a red marker to the map
*/
function setCustomGpsMarker(map, latitude, longitude, imageName){
    /*var myIcon = L.icon({
        iconSize: [28, 42],
        iconAnchor: [13,42],
        popupAnchor: [-3, -42],
        iconUrl: '../static/images/icons/'+imageName
    });
    var marker = L.marker([latitude, longitude], {icon: myIcon}).addTo(map);
    return marker;*/
    var marker = L.marker([latitude, longitude]).addTo(map);
    return marker;
}

function getUrlParam(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return results[1] || 0;
    }
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

/*
    @Description    Replaces the header with the value provided
*/
function replaceHeader(newHeaderValue){
    $("#trackingHeaderDiv h1").html(newHeaderValue);
}