const movieSearch = document.getElementById('movie-search-box');
const searchList = document.getElementById('search-list');
const resultGrid = document.getElementById('result-grid');
const favoriteList = document.getElementById('favorite-list');
let favorites = [];

// Load favorite movies from localStorage on page load
window.addEventListener('DOMContentLoaded', () => {
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
        favorites = JSON.parse(storedFavorites);
        renderFavorites();
    }
});

// Load searched movies from API
async function loadMovies(search) {
    const URL = `https://www.omdbapi.com/?s=${search}&page=1&apikey=6f63e2b3`;
    const res = await fetch(URL);
    const data = await res.json();
    console.log(data.Search);

    if (data.Response == "True") {
        displayMovieList(data.Search);
    }
}

// If the total search words is greater than 0, then search i.e., call loadmovie function
function findMovies() {
    let search = movieSearch.value.trim();
    if (search.length > 0) {
        searchList.classList.remove('hide-search-list');
        loadMovies(search);
    } else {
        searchList.classList.add('hide-search-list');
    }
}

// Display the list using a div and append each list at last
function displayMovieList(movies) {
    searchList.innerHTML = "";
    for (let i = 0; i < movies.length; i++) {
        let movieListItem = document.createElement('div');
        // Set movie id in data id
        movieListItem.dataset.id = movies[i].imdbID;
        movieListItem.classList.add('search-list-item');
        if (movies[i].Poster != "N/A") {
            moviePoster = movies[i].Poster;
        } else {
            moviePoster = "image_not_found";
        }

        movieListItem.innerHTML = `
            <div class="search-item-thumb">
                <img src="${moviePoster}">
            </div>
            <div class="search-item-info">
                <h3>${movies[i].Title}</h3>
                <p>${movies[i].Year}</p>
                <button onclick="addToFavorites('${movies[i].imdbID}')">Add to Favorites</button>
            </div>
        `;
        searchList.appendChild(movieListItem);
    }
    loadMovieDetails();
}

// Load the details using API then call the display movie function to display
async function loadMovieDetails() {
    const searchListMovies = searchList.querySelectorAll('.search-list-item');
    searchListMovies.forEach(movie => {
        movie.addEventListener('click', async () => {
            searchList.classList.add('hide-search-list');
            movieSearch.value = "";
            const result = await fetch(`https://www.omdbapi.com/?i=${movie.dataset.id}&apikey=6f63e2b3`);
            const movieDetails = await result.json();
            displayMovieDetails(movieDetails);
        });
    });
}

// Html to display the details of the selected movie
function displayMovieDetails(details) {
    resultGrid.innerHTML = `
        <div class="movie-poster">
            <img src="${details.Poster != "N/A" ? details.Poster : "image_not_found.png"}" alt="movie poster">
        </div>
        <div class="movie-info">
            <h3 class="movie-title">${details.Title}</h3>
                <b>
                <p class="year">Year: ${details.Year}</p>
                <p class="rated">Ratings: ${details.Rated}</p>
                <p class="released">Released: ${details.Released}</p>
            </b>
            <p class="genre"><b>Genre:</b> ${details.Genre}</p>
            <p class="writer"><b>Writer:</b> ${details.Writer}</p>
            <p class="actors"><b>Actors:</b> ${details.Actors}</p>
            <p class="plot"><b>Plot:</b> ${details.Plot}</p>
            <p class="language"><b>Language:</b> ${details.Language}</p>
            <p class="awards"><b><i class="fas fa-award"></i></b> ${details.Awards}</p>
        </div>
    `;
}

// Add favorite section then call store and render function
function addToFavorites(imdbID) {
    const movieIndex = favorites.indexOf(imdbID);
    if (movieIndex === -1) {
        favorites.push(imdbID);
        storeFavorites();
        renderFavorites();
    }
}

function removeFromFavorites(imdbID) {
    const movieIndex = favorites.indexOf(imdbID);
    if (movieIndex !== -1) {
        favorites.splice(movieIndex, 1);
        storeFavorites();
        renderFavorites();
    }
}

function renderFavorites() {
    favoriteList.innerHTML = "";
    for (let i = 0; i < favorites.length; i++) {
        const imdbID = favorites[i];
        const movieElement = document.createElement('div');
        movieElement.dataset.id = imdbID;
        movieElement.classList.add('favorite-movie-item');

        // Fetch the movie details by IMDb ID
        fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=6f63e2b3`)
            .then(response => response.json())
            .then(movieDetails => {
                const movieTitle = movieDetails.Title;
                movieElement.innerHTML = `
                    <div class="favorite-movie-title">${movieTitle}</div>
                    <button onclick="removeFromFavorites('${imdbID}')">X</button>
                `;
                favoriteList.appendChild(movieElement);
            })
            .catch(error => console.log(error));
    }
}

function storeFavorites() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}
