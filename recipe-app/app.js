
const apiKey = 'ec1d5598d5ff4949867acefc191f8fb3'; 
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

async function fetchRecipes(query = '') {
  const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey=${apiKey}`);
  const data = await response.json();
  return data.results;
}


async function fetchRecipeDetails(recipeId) {
  const response = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`);
  const data = await response.json();
  return data;
}


const searchInput = document.getElementById('search-input');
const suggestionsDiv = document.getElementById('suggestions');

searchInput.addEventListener('input', async () => {
  const query = searchInput.value.toLowerCase();
  suggestionsDiv.innerHTML = '';
  if (query) {
    const suggestions = await fetchRecipes(query);
    suggestions.forEach(recipe => {
      const sugItem = document.createElement('div');
      sugItem.textContent = recipe.title;
      sugItem.addEventListener('click', async () => {
        searchInput.value = recipe.title;
        suggestionsDiv.classList.add('hidden');
        const detailedRecipe = await fetchRecipeDetails(recipe.id);
        displayRecipes([detailedRecipe]);
      });
      suggestionsDiv.appendChild(sugItem);
    });
    suggestionsDiv.classList.remove('hidden');
  } else {
    suggestionsDiv.classList.add('hidden');
    const recipes = await fetchRecipes();
    displayRecipes(recipes);
  }
});


const recipesGrid = document.getElementById('recipes-grid');

async function displayRecipes(recipesToDisplay) {
  recipesGrid.innerHTML = '';
    recipesToDisplay.forEach(recipe => {
      const recipeCard = document.createElement('div');
    recipeCard.classList.add('recipe-card');
       recipeCard.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}">
      <h3>${recipe.title}</h3>

    `;
    recipeCard.addEventListener('click', async () => {
      const detailedRecipe = await fetchRecipeDetails(recipe.id);
      showRecipeDetails(detailedRecipe);
    });
    recipesGrid.appendChild(recipeCard);
  });
}

(async () => {
  const recipes = await fetchRecipes();
  displayRecipes(recipes);
})();


const rDetails = document.getElementById('recipe-details');

const rContent = document.getElementById('recipe-content');
const closeDetailsButton = document.getElementById('close-details');

async function showRecipeDetails(recipe) {
  const nt = parseNutrients(recipe.summary);
  console.log(nt);

  console.log(recipe);
  rContent.innerHTML = `
    <h2>${recipe.title}</h2>
    <img src="${recipe.image}" alt="${recipe.title}">

    <h3>Preparation Time:</h3>
    <p>${recipe.readyInMinutes || 'N/A'} mins</p>

    <h3>Ingredients:</h3>
    <ul>
      ${recipe.extendedIngredients.map(ingredient => `<li>${ingredient.original}</li>`).join('')}
    </ul>
    <h3>Instructions:</h3>
    <ol>
      ${recipe.analyzedInstructions[0]?.steps.map(step => `<li>${step.step}</li>`).join('') || '<li>No instructions available</li>'}
    </ol>
    <h3>Nutritional Information:</h3>
     <p>Calories: ${nt.calories}</p>
    <p>Protein: ${nt.protein}</p>
    <p>Fat: ${nt.fat}</p>

    <div> <button id="add-to-favorites">Add to Favorites  </button> <i class="fa fa-bookmark-o" ></i> </div>
  `;
  document.getElementById('add-to-favorites').addEventListener('click', () => {
    addToFavorites(recipe);
  });
  rDetails.classList.remove('hidden');
}

closeDetailsButton.addEventListener('click', () => {
  rDetails.classList.add('hidden');
});
function parseNutrients(summary) {
  const caloriesMatch = summary.match(/<b>(\d+)\s*calories<\/b>/);
   const proteinMatch = summary.match(/<b>(\d+g)\s*of protein<\/b>/);
  const fatMatch = summary.match(/<b>(\d+g)\s*of fat<\/b>/);

  const calories = caloriesMatch ? caloriesMatch[1] : 'N/A';
  const protein = proteinMatch ? proteinMatch[1] : 'N/A';
  const fat = fatMatch ? fatMatch[1] : 'N/A';

  return {
    calories,
    protein,
    fat
  };
}


const fButton = document.getElementById('favorites-button');
const fModal = document.getElementById('favorites-modal');
const favoritesList = document.getElementById('favorites-list');
// favoritesList.style.display = "flex";
favoritesList.style.marginLeft = "19px";
const closeFavoritesButton = document.getElementById('close-favorites'); // cl
const favtext = document.createElement('p');
favtext.innerHTML = "Saved Recipes";
favtext.style.color = "red";
favtext.style.textAlign = "center";
favtext.style.fontSize = "20px";
favtext.style.fontFamily = "Bangers , system-ui";

fButton.addEventListener('click', () => {
  showFavorites();
  favoritesList.prepend(favtext);
  fModal.classList.remove('hidden');
});

closeFavoritesButton.addEventListener('click', () => {
  fModal.classList.add('hidden');
});

function addToFavorites(recipe) {
  if (!favorites.find(fav => fav.id === recipe.id)) {
    favorites.push(recipe);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert(`${recipe.title} added to favorites!`);
  } else {
    alert(`${recipe.title} is already in favorites!`);
  }
}

function showFavorites() {
  favoritesList.innerHTML = '';

  if (favorites.length > 0) {
    favorites.forEach(recipe => {
      const favItem = document.createElement('div');



      favItem.classList.add('recipe-card');

      favItem.innerHTML = `
        
        <img src="${recipe.image}" alt="${recipe.title}">
        <h3>${recipe.title}</h3>

      `;
      favItem.addEventListener('click', async () => {
        const detailedRecipe = await fetchRecipeDetails(recipe.id);
        showRecipeDetails(detailedRecipe);
        fModal.classList.add('hidden');
      });
      favoritesList.appendChild(favItem);
    });
  } else {
    favoritesList.innerHTML = '<p>No favorites added yet ! </p>';
  }
}