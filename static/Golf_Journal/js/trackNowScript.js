var geo = navigator.geolocation;
var map; //Class level reference to map object
var watchId; //The Id of the Geolocation watcher, needed to turn off watching(i.e. tracking)
var holeName;//class level, for storing the current hole being recorded
var recordingStartTime;
var geoCodesCurrentlyBeingTracked = [];
var markersLayer; //The markerLayer holds all markers added to the map, used to easily clear
var trackingStartMarkerDrawn = true; //stores wheter the tracking marker has been drawn or not yet
var currentLat;
var currentLong;
var intervalId;

window.onload = function(){
    markersLayer = new L.LayerGroup();
    getCurrentLocation();
    showStartTrackingButton();
    getGameRecordById();
    populateGolfGameHolesTable();
    addTableClickListeners();

    //Extend Polyline to add distance method
    L.Polyline = L.Polyline.include({
        getDistance: function(system) {
            // distance in meters
            var mDistanse = 0,
                length = this._latlngs.length;
            for (var i = 1; i < length; i++) {
                mDistanse += this._latlngs[i].distanceTo(this._latlngs[i - 1]);
            }
            // optional
            if (system === 'imperial') {
                return mDistanse / 1609.34;
            } else {
                return mDistanse / 1000;
            }
    }
});
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
    @Description    Makes an AJAX call to Postgres database to retrieve the holes that have been populated for the current game
*/
function populateGolfGameHolesTable(){
    $urlGameId = getUrlParam('gameId');
    if($urlGameId != ''){
        $csrfToken = getCookie('csrftoken');
        $.ajax({
    		url: 'getGameHolesByGameId',
    		type: 'POST',
    		async: true,
    		data:{
    		    gameId: $urlGameId,
    			res: 1,
    			csrfmiddlewaretoken: $csrfToken
    		},
    		success: function(response){
    			$('#courseHoleTable').html(response);
    			$('#courseHoleTableId').DataTable( {
                    searching: false,
                    rowReorder: {
                        selector: 'td:nth-child(2)'
                    },
                    responsive: true
                } );
    		}
        });
    }
}

/*
    @Description    Makes an AJAX call to return modal form for creating a course hole, renders in div
*/
function renderAddHoleModal(){
    $csrfToken = getCookie('csrftoken');
    $.ajax({
		url: 'getNewHoleModal',
		type: 'POST',
		async: true,
		data:{
			res: 1,
			csrfmiddlewaretoken: $csrfToken
		},
		success: function(response){
			$('#createCourseHoleModalDiv').html(response);
			$('#createCourseHoleModal').modal('show');
			addModalClickListeners();
		}
    });
}

/*
    @Description    Sets the current location on the Map when a user first open the TrackNow functionality
*/
function saveCourseHole(){
    $csrfToken = getCookie('csrftoken');
    $urlGameId = getUrlParam('gameId');
    $holeCoordinates = convert2DArrayTo1D(geoCodesCurrentlyBeingTracked);
    recordingTime = parseInt(recordingStartTime);
    console.log('recordingTime: ' + recordingTime);

    if(holeName != '' && $csrfToken != '' && $urlGameId != ''){
        $.ajax({
    		url: 'saveCourseHole',
    		type: 'POST',
    		async: true,
    		data:{
    			gameId: $urlGameId,
    			holeName: holeName,
    			recordingStartTime: recordingTime,
    			holeCoordinates: $holeCoordinates,
    			csrfmiddlewaretoken: $csrfToken
    		},
    		success: function(response){
    			geo.clearWatch(watchId);
                showStartTrackingButton();
                var lastEnteredCoOrds = geoCodesCurrentlyBeingTracked[geoCodesCurrentlyBeingTracked.length-1];
                //Clear any saved geocodes so we can start tracking from fresh
                geoCodesCurrentlyBeingTracked = [];
                createMapMarker(map, 'Current Location', lastEnteredCoOrds[0], lastEnteredCoOrds[1], false);
                populateGolfGameHolesTable();
    		}
        });
    }
}

function convert2DArrayTo1D(lineCoordinates){
    var newArr = [];

    for(var i = 0; i < lineCoordinates.length; i++){
        newArr = newArr.concat(lineCoordinates[i]);
    }
    return newArr;
}

/*
    @Description    Deletes a hole from a specific game
*/
function deleteCourseHole(event){
    $csrfToken = getCookie('csrftoken');
    $id = event.target.name;

    if($id != '' && $csrfToken != ''){
        $.ajax({
            url: 'deleteGameHole',
            type: 'POST',
            async: true,
            data: {
                id: $id,
                csrfmiddlewaretoken: $csrfToken
            },
            success: function(){
                populateGolfGameHolesTable();
            }
        });
    }
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

function drawHoleCoordinatesOnMap(geoCodes, holeNumber){
    var geoCodePairList = convertArrayTo2D(geoCodes);
    drawGeoCodeListOnMap(geoCodePairList, holeNumber);
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
    @Description    Attempts to get Users current GeoLocation codes
*/
function getCurrentLocation(){
    //document.getElementById('startTrackingDiv').style.display = 'none';
    if(geo){
        geo.getCurrentPosition(initMapWithCurrentLocation, geoInfoErrorCallback, {timeout:10000, enableHighAccuracy:true});
    }
    else{
        alert('Geolocation is not avaiable, please try to refresh the page!');
    }
}

/*
    @Description    Begins tracking a users GeoLocation for movement
                    Clears all markers currently on map
*/
function startGeoLocationTracking(){
    console.log('Tracking started!');

    markersLayer.clearLayers();
    trackingStartMarkerDrawn = false;
    watchId = geo.watchPosition(setCurrentLocationOnMap, geoInfoErrorCallback, {timeout:10000, enableHighAccuracy:true});
    showStopTrackingButton();
}

/*
    @Description    Stops tracking users location
*/
function stopGeoLocationTracking(){
    console.log('Tracking stopped!');
    markersLayer.clearLayers();
    clearLinesFromMap();
    clearInterval(intervalId);
    saveCourseHole();
}

/*
    @Description    Parses a Geolocation position object and prints the result to the console
*/
function initMapWithCurrentLocation(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    initMap(longitude, latitude);
}

/*
    @Description    Sets the current location on the Map when a user first open the TrackNow functionality
                    Starts a timer that stores the users location every 10 seconds
*/
function setCurrentLocationOnMap(position) {
    //Set class level lat and long values so can be read by time based action
    currentLat = position.coords.latitude;
    currentLong = position.coords.longitude;


    //Draw the initial marker and start the line, this will only be called when tracking first starts
    if(!trackingStartMarkerDrawn){
        drawLineOnMap(map, currentLat, currentLong, geoCodesCurrentlyBeingTracked);
        createMapMarker(map, "Tee Off", currentLat, currentLong, false);
        trackingStartMarkerDrawn = true;

        //Start the timer that will store the users geolocation every x seconds
        intervalId = setInterval(addCurrentPositionToPolyline, 10000);
    }
}

/*
    @Description    adds a geocode to the line being drawn on the map
                    Called on a timer to draw new line Coordinates
*/
function addCurrentPositionToPolyline(){
    if(typeof(currentLat) != 'undefined' && typeof(currentLong) != 'undefined'){
        drawLineOnMap(map, currentLat, currentLong, geoCodesCurrentlyBeingTracked);
    }
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

    markersLayer.addTo(map);

    createMapMarker(map, "Current Location", latitude, longitude, true);
}

/*
    @Description     Creates a marker on the map
    @param           startMarker - set to true for a start marker, false for an end
*/
function createMapMarker(map, markerMessage, latitude, longitude, startMarker) {
    var marker;
    if(startMarker){
        marker = setCustomGpsMarker(map, latitude, longitude, 'green_gps_marker.png');

    }
    else{
        marker = setCustomGpsMarker(map, latitude, longitude, 'red_gps_marker.png');
    }
    marker.bindPopup(markerMessage);
    marker.on('click', showMarkerBaloon);
    markersLayer.addLayer(marker);
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
function drawLineOnMap(map, latitude, longitude, geoCodeArrayToAddTo) {
    console.log('geoCodesCurrentlyBeingTracked: ' , geoCodesCurrentlyBeingTracked);

    var coordinatePair = [latitude, longitude];

    if(geoCodeArrayToAddTo.length < 2 || positionChanged(geoCodeArrayToAddTo, coordinatePair)){

        geoCodeArrayToAddTo.push(coordinatePair);

        //if(geoCodeArrayToAddTo.length > 200) geoCodeArrayToAddTo = runDouglasPeuckerOnGeoArrayList(geoCodeArrayToAddTo);

        clearLinesFromMap();

        var polyLine = L.polyline(geoCodeArrayToAddTo,
            {
                color: 'blue',
                weight: 3,
                opacity: 5,
                lineJoin: 'round'
            }
        ).addTo(map);

        console.log('Distance: ' + polyLine.getDistance());

        var polylineBufferLine = L.polyline(geoCodeArrayToAddTo,
            {
                color: 'blue',
                weight: 23,
                opacity: 0.3,
                lineJoin: 'round'
            }
        ).addTo(map);

        map.fitBounds(polylineBufferLine.getBounds());
    }
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

/*
    @Description    Compares a new geocode to the last geocode recorded
                    returns true if the geocodes are different, false otherwise
*/
function positionChanged(geoCodeArrayToAddTo, coordinatePair){
    if(geoCodeArrayToAddTo.length > 1){
        var geoCodes = geoCodeArrayToAddTo[geoCodeArrayToAddTo.length - 1];
        if(geoCodes[0] != coordinatePair[0] || geoCodes[1] != coordinatePair[1]){
            return true;
        }
    }
    return false;
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
    var marker = L.marker([latitude, longitude]);
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

/*
    @Description    Registers methods on buttons
*/
function addTableClickListeners(){
    //Register a click listener on all delete buttons on my holes table
    $(document).on('click', '.delete-hole-event' ,function(event){
        deleteCourseHole(event);
    });

    //Register a click listener on all 'show on map' buttons on my holes table
    $(document).on('click', '.show-on-map-event' ,function(event){
        if(!$("#stopTrackingDiv").is(":visible")){
            getCoordinatesForHole(event);
        }
        else alert('Please stop tracking first');
    });
}

/*
    @Description    Registers methods on buttons
*/
function addModalClickListeners(){
    //Register a click listener on createCourseButton button, when clicked calls createNewCourse
    $('#createHoleSaveButton').on('click', function(event){
        //Store hole name
        holeName = $('#courseNameInput').val();
        recordingStartTime = new Date().getTime();
        console.log('recordingStartTime: ' + recordingStartTime);
        startGeoLocationTracking();
        $('#createCourseHoleModal').modal('hide');
    });
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
    @Description    Returns a more simplified array of geocodes by utilizing the Douglas Peucker algorithm
                    Points are removed from the array but the same general line is still drawn
                    The greatly reduces load on the browser while recording many geocodes
    @param          geoArrayList an array of geo codes e.g. [[0,1], [0,1]]
*/
function runDouglasPeuckerOnGeoArrayList(geoArrayList){
    if(typeof(geoArrayList) !== 'undefined' && geoArrayList.length > 2){
        var flattenedGeoArrayList = convert2DArrayTo1D(geoArrayList);
        var optimizedArray = simplify(flattenedGeoArrayList);
        return convertArrayTo2D(optimizedArray);
    }
    else{
        return geoArrayList;
    }
}

