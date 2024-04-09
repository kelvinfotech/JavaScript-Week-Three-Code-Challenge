$(document).ready(function() {
  // Function to update movie details based on provided data
  function updateMovieDetails(movieData) {
      const availableTickets = movieData.capacity - movieData.tickets_sold;
      $('#poster').attr('src', movieData.poster);
      $('#title').text(movieData.title);
      $('#runtime').text(movieData.runtime + ' minutes');
      $('#showtime').text(movieData.showtime);
      $('#ticket-num').text(availableTickets);
      $('#film-info').text(movieData.description);
  }

  // Function to fetch all movies and populate the films menu
  function fetchAllMovies() {
      $.ajax({
          url: 'db.json', // Path to the JSON file containing movie data
          type: 'GET',
          dataType: 'json',
          success: function(data) {
              const films = data.films; // Extract films array from JSON data
              films.forEach(function(movie) {
                  const $li = $('<li>').addClass('film-container').attr('data-id', movie.id).text(movie.title);
                  const $button = $('<button>').addClass('delete-btn').text('Delete');
                  $('#films').append($li.append($button)); // Append the delete button to each film item
              });
          },
          error: function(xhr, status, error) {
              console.error('Error fetching movie data:', error);
          }
      });
  }

  // Fetch data for the first movie when the page loads
  $.ajax({
      url: 'db.json', // Path to the JSON file containing movie data
      type: 'GET',
      dataType: 'json',
      success: function(data) {
          // Assuming the first movie's ID is always 1
          const firstMovie = data.films.find(movie => movie.id === "1");
          updateMovieDetails(firstMovie);
      },
      error: function(xhr, status, error) {
          console.error('Error fetching movie data:', error);
      }
  });

  // Populate the films menu when the page loads
  fetchAllMovies();

  // Event listener for clicking on movie titles in the menu
  $('#films').on('click', '.film-container', function() {
      const movieId = $(this).attr('data-id');
      $.ajax({
          url: 'db.json', // Path to the JSON file containing movie data
          type: 'GET',
          dataType: 'json',
          success: function(data) {
              const selectedMovie = data.films.find(movie => movie.id === movieId);
              updateMovieDetails(selectedMovie);
          },
          error: function(xhr, status, error) {
              console.error('Error fetching movie data:', error);
          }
      });
  });

  // Event listener for buying tickets
$('#buy-ticket').click(function() {
  var ticketsRemaining = parseInt($('#ticket-num').text());
  if (ticketsRemaining > 0) {
      // Simulated ticket purchase logic
      alert('Ticket purchased successfully!');
      $('#ticket-num').text(ticketsRemaining - 1);

      // Send PATCH request to update tickets_sold on the server
      var movieId = $('#film-info').attr('data-id');
      $.ajax({
          url: `/films/${movieId}`,
          type: 'PATCH',
          contentType: 'application/json',
          data: JSON.stringify({ tickets_sold: ticketsRemaining }), // Send updated tickets_sold count
          success: function(response) {
              console.log('Tickets sold updated on the server:', response);
          },
          error: function(xhr, status, error) {
              console.error('Error updating tickets sold on the server:', error);
          }
      });
  } else {
      // Update Buy Ticket button text to 'Sold Out' and disable it
      $('#buy-ticket').text('Sold Out').prop('disabled', true);
      // Add 'sold-out' class to the corresponding film container
      var movieId = $('#film-info').attr('data-id');
      $('#films').find('.film-container[data-id="' + movieId + '"]').addClass('sold-out');
      alert('Sorry, no more tickets available.');
  }
});

  // Event listener for clicking on the delete button
  $('#films').on('click', '.delete-btn', function(event) {
    event.stopPropagation();
    const movieId = $(this).closest('.film-container').attr('data-id');
    $.ajax({
      url: 'db.json',
      type: 'GET',
      dataType: 'json',
      success: function(data) {
        const movieIndex = data.films.findIndex(movie => movie.id === movieId);
        if (movieIndex !== -1) {
          data.films.splice(movieIndex, 1);
          $(`li[data-id="${movieId}"]`).remove();
          // If no movie is selected after deletion, select the first movie
          if ($('#title').text() === '') {
            fetchMovieInformation(1);
          }
        }
      },
      error: function(xhr, status, error) {
        console.error('Error loading JSON file:', error);
      }
    });
  });
});
