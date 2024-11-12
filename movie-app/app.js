const apiKey = 'f9c2f3fb8fe1a49754ef50cb1e2e4188'; // Replace with your TMDb API key
const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
let savedMovies = JSON.parse(localStorage.getItem('savedMovies')) || [];

async function getMovies(query = '', sortBy = 'popularity.desc') {
  const endpoint = query ? 'search/movie' : 'discover/movie';
  const params = new URLSearchParams({
    api_key: apiKey,
    sort_by: sortBy,
  });
  if (query) params.append('query', query);

  const response = await fetch(`https://api.themoviedb.org/3/${endpoint}?${params}`);
  const data = await response.json();
  return data.results;
}

async function getMovieDetails(movieId) {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&append_to_response=credits,videos`
  );
  return response.json();
}

const searchInput = document.getElementById('search-input');
const suggestionsDiv = document.getElementById('suggestions');
const moviesGrid = document.getElementById('movies-grid');

searchInput.addEventListener('input', async () => {
  const query = searchInput.value.trim();
  suggestionsDiv.innerHTML = '';

  if (query) {
    const suggestions = await getMovies(query);
    suggestions.slice(0, 5).forEach((movie) => {
      const suggestionItem = document.createElement('div');
      suggestionItem.textContent = movie.title;
      suggestionItem.addEventListener('click', () => {
        searchInput.value = movie.title;
        suggestionsDiv.classList.add('hidden');
        displayMovies([movie]);
      });
      suggestionsDiv.appendChild(suggestionItem);
    });
    suggestionsDiv.classList.remove('hidden');
    displayMovies(suggestions);
  } else {
    suggestionsDiv.classList.add('hidden');
    const movies = await getMovies();
    displayMovies(movies);
  }
});

function displayMovies(movies) {
  moviesGrid.innerHTML = '';
  movies.forEach((movie) => {
    const movieCard = document.createElement('div');
    movieCard.classList.add('movie-card');
    movieCard.innerHTML = `
      <img src="${movie.poster_path ? imageBaseUrl + movie.poster_path : ''}" alt="${movie.title}">
      <h3>${movie.title}</h3>
      <p>Release Date: ${movie.release_date || 'N/A'}</p>
    `;
    movieCard.addEventListener('click', async () => {
      const detailedMovie = await getMovieDetails(movie.id);
      showMovieDetails(detailedMovie);
    });
    moviesGrid.appendChild(movieCard);
  });
}

(async () => {
  const movies = await getMovies();
  displayMovies(movies);
})();

const movieDetails = document.getElementById('movie-details');
const movieContent = document.getElementById('movie-content');
const closeDetailsButton = document.getElementById('close-details');

async function showMovieDetails(movie) {
  suggestionsDiv.classList.add('hidden');
  moviesGrid.innerHTML = '';

  const genres = movie.genres.map((g) => g.name).join(', ');
  const cast = movie.credits.cast.slice(0, 5).map((c) => c.name).join(', ');
  const trailer = movie.videos.results.find((v) => v.type === 'Trailer');

  movieContent.innerHTML = `
    <h2>${movie.title}</h2>
    <img src="${movie.poster_path ? imageBaseUrl + movie.poster_path : ''}" alt="${movie.title}">
    <p><strong>Synopsis:</strong> ${movie.overview || 'N/A'}</p>
    <p><strong>Rating:</strong> ${movie.vote_average || 'N/A'}</p>
    <p><strong>Runtime:</strong> ${movie.runtime || 'N/A'} minutes</p>
    <p><strong>Genres:</strong> ${genres || 'N/A'}</p>
    <p><strong>Cast:</strong> ${cast || 'N/A'}</p>
    ${
      trailer
        ? `<iframe width="420" height="315" src="https://www.youtube.com/embed/${trailer.key}"></iframe>`
        : ''
    }
    <button id="add-to-watchlist">Add to Watchlist</button>
  `;
  document.getElementById('add-to-watchlist').addEventListener('click', () => {
    addToSavedMovies(movie);
  });
  movieDetails.classList.remove('hidden');
}

closeDetailsButton.addEventListener('click', () => {
  movieDetails.classList.add('hidden');
});

const watchlistButton = document.getElementById('watchlist-button');
const watchlistModal = document.getElementById('watchlist-modal');
const watchlistContent = document.getElementById('watchlist-content');
const closeWatchlistButton = document.getElementById('close-watchlist');

watchlistButton.addEventListener('click', () => {
  showSavedMovies();
  movieDetails.classList.add('hidden');
  suggestionsDiv.classList.add('hidden');
  watchlistModal.classList.remove('hidden');
});

closeWatchlistButton.addEventListener('click', () => {
  watchlistModal.classList.add('hidden');
});

function addToSavedMovies(movie) {
  if (!savedMovies.find((item) => item.id === movie.id)) {
    savedMovies.push(movie);
    localStorage.setItem('savedMovies', JSON.stringify(savedMovies));
    alert(`${movie.title} added to your watchlist!`);
  } else {
    alert(`${movie.title} is already in your watchlist!`);
  }
}

function showSavedMovies() {
  watchlistContent.innerHTML = '';

  if (savedMovies.length > 0) {
    savedMovies.forEach((movie) => {
      const savedItem = document.createElement('div');
      savedItem.classList.add('movie-card');
      savedItem.innerHTML = `
        <img src="${movie.poster_path ? imageBaseUrl + movie.poster_path : ''}" alt="${movie.title}">
        <h3>${movie.title}</h3>
        <p>Release Date: ${movie.release_date || 'N/A'}</p>
      `;
      savedItem.addEventListener('click', async () => {
        const detailedMovie = await getMovieDetails(movie.id);
        showMovieDetails(detailedMovie);
        watchlistModal.classList.add('hidden');
      });
      watchlistContent.appendChild(savedItem);
    });
  } else {
    watchlistContent.innerHTML = '<p>No movies in your watchlist .! </p>';
  }
}