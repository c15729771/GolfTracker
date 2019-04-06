window.onload = function(){
    markersLayer = new L.LayerGroup();
    getAllCourseHoles();
    initMap(-8.269958, 52.265636);
}

/*
    @Description    Makes an AJAX call to Postgres database to retrieve the holes that have been populated for the current game
*/
function getAllCourseHoles(){
    $csrfToken = getCookie('csrftoken');
    if($csrfToken != ''){
        $.ajax({
    		url: 'getCommunityHoles',
    		type: 'POST',
    		async: true,
    		data:{
    			csrfmiddlewaretoken: $csrfToken
    		},
    		success: function(response){
    			$('#communityCourseTableDiv').html(response);
    			$('#communityCourseTableId').DataTable( {
                    searching: true,
                    responsive: true,
                } );

                addTableClickListeners();
    		}
        });
    }
}

/*
    @Description    Registers methods on buttons
*/
function addTableClickListeners(){
    //Register a click listener on all 'show on map' buttons on my holes table
    $(document).on('click', '.show-on-map-event' ,function(event){
        getCoordinatesForHole(event);
    });
}
