$(document).ready(function(){
    //Get current games user has saved to the Database
    populateGolfGamesTable(getCookie('csrftoken'));

    //Register a click listener on createCourseButton button, when clicked calls createNewCourse
    $('#createCourseButton').on('click', function(){
        createNewCourse();
    });

    //Register a click listener on all delete buttons on my courses table
    $(document).on('click', '.delete-event' ,function(event){
        deleteGame(event);
    });

    //Register a click listener on all delete buttons on my courses table
    $(document).on('click', '.track-event' ,function(event){
        goToTrackNowPage(event);
    });
});

/*
    @Description    Makes an AJAX call to Postgres database to retrieve current users Game entries
*/
function populateGolfGamesTable(csrftoken){
    $.ajax({
		url: 'getGameEntries',
		type: 'POST',
		async: true,
		data:{
			res: 1,
			csrfmiddlewaretoken: csrftoken
		},
		success: function(response){
			$('#golfCourseTable').html(response);
			$('#golfCourseTableId').DataTable( {
                    searching: false,
                    responsive: true
            } );
		}
    });
}

/*
    @Description    Brings user to the Track now page and passes the Game Id in the url
*/
function goToTrackNowPage(event){
    window.location.href = window.location.protocol + "//" + window.location.host + "/" + 'TrackNow?gameId=' + event.target.name;
}

/*
    @Description    Makes an AJAX call to Postgres database to save a new Game to the database
*/
function createNewCourse(){
    $csrfToken = getCookie('csrftoken');
    $courseName = $('#courseNameInput').val();
    $location = $('#locationInput').val();
    $date = $('#courseDateInput').val();
    $notes = $('#notesInput').val();

    if($courseName == "" || $location == ""){
        alert('Please complete the required fields!');
    }
    else{
        $.ajax({
            url: 'createGameEntry',
            type: 'POST',
            data: {
                courseName: $courseName,
                courseLocation: $location,
                csrfmiddlewaretoken: $csrfToken
            },
            success: function(){
                populateGolfGamesTable($csrfToken);
                clearModalValues();
                $('#createCourseModal').modal('hide');
            }
        });
    }
}

/*
    Deletes a game entry for a user
*/
function deleteGame(event){
    $csrfToken = getCookie('csrftoken');
    console.log('event: ', event.target.name);
    $id = event.target.name;
    $.ajax({
        url: 'deleteGameEntry',
        type: 'POST',
        data: {
            id: $id,
            csrfmiddlewaretoken: $csrfToken
        },
        success: function(){
            populateGolfGamesTable($csrfToken);
            alert("Deleted!");
        }
    });
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
    @Description    Clears any values currently on modal form
*/
function clearModalValues(){
    $('#courseNameInput').val('');
    $('#locationInput').val('');
    $('#locationInput').val('');
    $('#notesInput').val('');
}