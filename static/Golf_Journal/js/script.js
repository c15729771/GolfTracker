// $(document).ready(function(){
//     if($('#result') != null){
//       // Read();
//     }
//     $('#create').on('click', function(){
//         $firstname = $('#firstname').val();
//         $lastname = $('#lastname').val();

//         if($firstname == "" || $lastname == ""){
//             alert("Please complete the required field");
//         }else{
//             $.ajax({
//                 url: 'create',
//                 type: 'POST',
//                 data: {
//                     firstname: $firstname,
//                     lastname: $lastname,
//                     csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
//                 },
//                 success: function(){
//                     Read();
//                     populateGolfGamesTable();
//                     $('#firstname').val('');
//                     $('#lastname').val('');
//                 }
//             });
//         }
//     });

//     $(document).on('click', '.edit', function(){
//         $id = $(this).attr('name');
//         window.location = "edit/" + $id;
//     });

//     $('#update').on('click', function(){
//         $firstname = $('#firstname').val();
//         $lastname = $('#lastname').val();

//         if($firstname == "" || $lastname == ""){
//             alert("Please complete the required field");
//         }else{
//             $id = $('#member_id').val();
//             $.ajax({
//                 url: 'update/' + $id,
//                 type: 'POST',
//                 data: {
//                     firstname: $firstname,
//                     lastname: $lastname,
//                     csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
//                 },
//                 success: function(){
//                     window.location = '/';
//                     alert('Updated!');
//                 }
//             });
//         }

//     });
// /*
//     $(document).on('click', '.delete', function(){
//         $id = $(this).attr('name');
//         $.ajax({
//             url: 'delete/' + $id,
//             type: 'POST',
//             data: {
//                 csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
//             },
//             success: function(){
//                 Read();
//                 alert("Deleted!");
//             }
//         });
//     });*/

// });

// function Read(){
//     $.ajax({
// 		url: 'read',
// 		type: 'POST',
// 		async: true,
// 		data:{
// 			res: 1,
// 			csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
// 		},
// 		success: function(response){
// 			$('#result').html(response);
// 		}
//     });
// }

// function populateGolfGamesTable(){
//     $.ajax({
// 		url: 'getGameEntries',
// 		type: 'POST',
// 		async: true,
// 		data:{
// 			res: 1,
// 			csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
// 		},
// 		success: function(response){
// 			$('#golfCourseTable').html(response);
// 		}
//     });
// }