const dbObjectFavList = "favouritesList";
if (localStorage.getItem(dbObjectFavList) == null) {
    localStorage.setItem(dbObjectFavList, JSON.stringify([]));
}

function isFav(list, id) {
    let res = false;
    for (let i = 0; i < list.length; i++) {
        if (id == list[i]) {
            res = true;
        }
    }
    console.log("cool 2")
    return res;
}

const fetchMealsFromApi = async (url, value) => {
    const response = await fetch(`${url + value}`);
    const meals = await response.json();
    return meals;
};

function formatPara(input) {
    const lines = input.split('\r\n');
    let result = '';

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() !== '') {
            result += `<p>${i + 1}. ${lines[i]}</p>`;
        }
    }

    return result;
}

function convertToEmbedLink(youtubeLink) {
    const videoIdRegex = /(?:https?:\/\/)?(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-_]+)/i;
    const match = youtubeLink.match(videoIdRegex);

    if (match) {
        const videoId = match[1];
        const embedLink = `https://www.youtube.com/embed/${videoId}`;
        return embedLink;
    }
}

function addRemoveToFavList(id) {
    let db = JSON.parse(localStorage.getItem(dbObjectFavList));
    let ifExist = false;
    for (let i = 0; i < db.length; i++) {
        if (id == db[i]) {
            ifExist = true;
        }
    }
    if (ifExist) {
        db.splice(db.indexOf(id), 1);
    } else {
        db.push(id);
    }

    localStorage.setItem(dbObjectFavList, JSON.stringify(db));
    console.log("cool");

    showMealList();
    showFavMealList();
    
}

async function showMealList() {
    const list = JSON.parse(localStorage.getItem(dbObjectFavList));
    const inputValue = document.getElementById("search-input").value;
    console.log(inputValue);
    const url = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
    const mealsData = await fetchMealsFromApi(url, inputValue);
    let html = "";
    if (inputValue === "") {
        document.getElementById("results-grid").innerHTML = `
        <div class="search-results-placeholder">
            <img src="assets/search-placeholder.png" alt="Search Icon">
            <h3>Find Your Perfect Recipe Match - Explore, Cook, Savor!</h3>
            <p>Start your search and find the perfect recipe to delight your tastebuds</p>
        </div>
        `;
        return;
    }
    if (mealsData.meals) {
        html = mealsData.meals.map((element) => {
            return `
            <div class="meal-card"  >
                <div class="card-image"><img src="${element.strMealThumb}" alt="Meal Image" onclick="showMealDetails(${element.idMeal})">
                </div>
                <div class="card-content">
                    <h5>${element.strMeal}</h5>
                    <p>Category : <b>Vegetarian</b><br>Area: <b>Italian</b></p>
                </div>
                <div class="card-buttons">
                    <i class="fa-solid fa-heart fa-lg ${isFav(list, element.idMeal) ? "active" : ""
                } " onclick="addRemoveToFavList(${element.idMeal})"></i>
                <a href="${element.strYoutube}">
                <i class="fa-brands fa-youtube fa-lg" style="color: #ff0000;"></i>
            </a>                </div>
            </div>
            `;
        }).join("");
        document.getElementById("results-grid").innerHTML = html;
    }
    else {
        document.getElementById("results-grid").innerHTML = `
        <div class="search-results-placeholder">
            <img src="assets/nothing-found.png" alt="Not Found Icon">
            <h3>Oops! No Results Found</h3>
            <p>Try refining your search criteria for better results.</p>

        </div>
        `;
    }
};

async function showMealDetails(id) {
    const list = JSON.parse(localStorage.getItem(dbObjectFavList));
    const url = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";
    const mealDetails = await fetchMealsFromApi(url, id);
    let html = "";
    if (mealDetails.meals) {
        html = `
        <div class="meal-content">
            <h3 style="font-size: 50px;">${mealDetails.meals[0].strMeal}</h3>
            <h5 style="font-size: 30px; text-align: center;">Category: <b>${mealDetails.meals[0].strCategory}</b><br>Area: <b>${mealDetails.meals[0].strArea}</b>
            </h5>
            <div class="instructions">
                <h4 style="font-size: 30px; margin-bottom: 20px;">Instructions</h4>
                <p>${formatPara(mealDetails.meals[0].strInstructions)}</p>
            </div>
        </div>
        <div class="meal-image">
            <img src= "${mealDetails.meals[0].strMealThumb}" alt="">
        </div>
        <div class="yt-iframe">
            <iframe width="560" height="315" src="${convertToEmbedLink(mealDetails.meals[0].strYoutube)}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>        
        `;
        document.getElementById('meal-details').innerHTML = html;
    }
    document.getElementById('meal-details').style.zIndex = 2;
}

async function showFavMealList() {
    const list = JSON.parse(localStorage.getItem(dbObjectFavList));

    let favList = JSON.parse(localStorage.getItem(dbObjectFavList));
    let url = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";
    let html = "";

    if (favList.length == 0) {
        html = `<div class="fav-item nothing"> <h1> 
          Nothing To Show.....</h1> </div>`;
    } else {
        for (let i = 0; i < favList.length; i++) {
            const favMealList = await fetchMealsFromApi(url, favList[i]);
            if (favMealList.meals[0]) {
                let element = favMealList.meals[0];
                html += `
                <div class="meal-card"  >
                <div class="card-image"><img src="${element.strMealThumb}" alt="Meal Image" onclick="showMealDetails(${element.idMeal})">
                </div>
                <div class="card-content">
                    <h5>${element.strMeal}</h5>
                    <p>Category : <b>Vegetarian</b><br>Area: <b>Italian</b></p>
                </div>
                <div class="card-buttons">
                    <i class="fa-solid fa-heart fa-lg ${isFav(list, element.idMeal) ? "active" : ""
                } " onclick="addRemoveToFavList(${element.idMeal})"></i>
                <a href="${element.strYoutube}">
                <i class="fa-brands fa-youtube fa-lg" style="color: #ff0000;"></i>
            </a>                </div>
            </div>             
                  `;
            }
        }
    }
    document.getElementById("favorites-list").innerHTML = html;
}

showFavMealList();


