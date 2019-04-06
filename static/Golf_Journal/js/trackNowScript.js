var geo = navigator.geolocation;
var watchId; //The Id of the Geolocation watcher, needed to turn off watching(i.e. tracking)
var holeName;//class level, for storing the current hole being recorded
var recordingStartTime;
var geoCodesCurrentlyBeingTracked = [];
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
        var distanceInMeters = 0,
            length = this._latlngs.length;
        for (var i = 1; i < length; i++) {
            distanceInMeters += this._latlngs[i].distanceTo(this._latlngs[i - 1]);
        }

        return distanceInMeters
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
    var distanceInYards = convertMetersToYards(L.polyline(geoCodesCurrentlyBeingTracked).getDistance());
    recordingTime = parseInt(recordingStartTime);

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
    			distance: distanceInYards,
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
    @Description    Attempts to get Users current GeoLocation codes
*/
function getCurrentLocation(){
    //document.getElementById('startTrackingDiv').style.display = 'none';
    if(geo){
        geo.getCurrentPosition(initMapWithCurrentLocation, geoInfoErrorOnInit, {timeout:10000, enableHighAccuracy:true});
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
    showStopTrackingButton();
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
    @Description    Used to process an error response from a Geolocation callout
*/
function geoInfoErrorOnInit(){
    alert('Geo Info is not available, Please try refresh the page');
    initMap(-8.269958, 52.265636);
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

function convertMetersToYards(meterNumber){
    if(typeof(meterNumber) !== 'undefined' && meterNumber != 0){
        return (meterNumber * 1.09361);
    }
    return 0;
}