
let temperature = '';

// Put thumbnail onto slots
const wardrobeItems = document.querySelector('.wardrobe'); 
wardrobeItems.addEventListener('click', (wardrobeItem) => { // listen for all items including ones just uploaded
        if (wardrobeItem.target.classList.contains("wardrobe-item")) {
            const wardrobeItemSlot = wardrobeItem.target.dataset.slot   //get top/bottom/outfit/shoes
            
            const emptySlotElement = document.querySelector(`.${wardrobeItemSlot}-slot`) //get the empty slot
            console.log(emptySlotElement)
            const topSlotElement = document.querySelector('.top-slot')
            const bottomSlotElement = document.querySelector('.bottom-slot')
            const outfitSlotElement = document.querySelector('.outfit-slot')
            const sameSlotWardrobeItems = document.querySelectorAll(`.js-${wardrobeItemSlot}`);
            
            if (wardrobeItemSlot == 'shoes') {
                    emptySlotElement.src = wardrobeItem.target.src;
                    addSelected(sameSlotWardrobeItems, wardrobeItem)
                } else if (wardrobeItemSlot == 'outfit') {
                    emptySlotElement.src = wardrobeItem.target.src;
                    emptySrcAlt(topSlotElement);
                    emptySrcAlt(bottomSlotElement);
                    addSelected (sameSlotWardrobeItems, wardrobeItem);
                    removeSelected('js-top');
                    removeSelected('js-bottom');
                } else {
                    emptySrcAlt(outfitSlotElement);
                    emptySlotElement.src = wardrobeItem.target.src;
                    emptySlotElement.alt = wardrobeItem.target.alt;
                    removeSelected('js-outfit')              
                    
                    sameSlotWardrobeItems.forEach(item=> {
                    item.classList.remove('selected');
                    wardrobeItem.target.classList.add('selected');      
                    });
                }
            
           
        };
}); 

//Click clear button
const buttonElements = document.querySelectorAll('.js-clear-button, .js-reset-button')
buttonElements.forEach(buttonElement => {
    const clearbutton = buttonElement.dataset.clearbutton;//thick/thin-top/bottom/outfit/shoes
    
    const emptySlotElement = document.querySelector(`.${extractCategory(clearbutton)}-slot`);
    
    const topSlotElement = document.querySelector('.top-slot')
    const bottomSlotElement = document.querySelector('.bottom-slot')
    const outfitSlotElement = document.querySelector('.outfit-slot')
    const shoeSlotElement = document.querySelector('.shoes-slot')
    
    buttonElement.addEventListener('click', () => {
    if (clearbutton == 'reset') {
        removeAllSelected();
        emptySrcAlt(topSlotElement);
        emptySrcAlt(bottomSlotElement);
        emptySrcAlt(outfitSlotElement);
        emptySrcAlt(shoeSlotElement);
    } else {
        emptySrcAlt(emptySlotElement);
        const clearCategoryItems = document.querySelectorAll(`.js-${extractCategory(clearbutton)}`)
        clearCategoryItems.forEach(clearCategoryItem => {
        clearCategoryItem.classList.remove('selected')})        
    }
    })
})


//user upload the image
const fileInput = document.querySelector('input')
const preview = document.getElementById('preview')
const confirmBtn = document.getElementById("confirm-btn")
const cancelBtn = document.getElementById("cancel-btn")

let currentImage = null;
let currentCategory = null;

fileInput.addEventListener('change', () => {
    const fr = new FileReader ();
    fr.readAsDataURL(fileInput.files[0])

    fr.addEventListener('load', () => {
        currentImage = fr.result
        preview.innerHTML = '';
        const img = new Image();
        img.src = currentImage;
        preview.appendChild(img);
        
        //show confirm and cancel button
        confirmBtn.style.display = "inline-block";
        cancelBtn.style.display = "inline-block";
    
    })
})    

//confirm/cancel btn handler
confirmBtn.addEventListener('click', () => {
    const category = document.getElementById("category").value; //top
    const thickness = document.getElementById("tag").value; //thick
    if (!currentImage) {
        alert('Please uppload your clothes first!')
        return
    }
    if (!category) {
        alert('Please choose a category!')
        return
    }

    if (!thickness) {
        alert('Please choose thickness!')
        return
    }


    //save uploaded clothes to the right place
    addClothesToWardrobe(currentImage, category, thickness)
    //save to localSctorage
    saveToStorage(currentImage, category, thickness)

    //reset UI
    preview.innerHTML = '';
    hideTwoBtns();
    document.getElementById("category").value = '';
    document.getElementById("tag").value = '';
})

cancelBtn.addEventListener('click', () => {
    hideTwoBtns();
    preview.innerHTML = '';
    document.getElementById("category").value = '';
    document.getElementById("tag").value = '';
})

//click the remove btn on top right of the uploaded clothes

document.body.addEventListener('click', (event) =>{ 
    const category = event.target.dataset.category //top bottom
    const categorySlotElement = document.querySelector(`.${category}-slot`)
    emptySrcAlt(categorySlotElement)
    removeClothes(event);
    const imgUrl = event.target.dataset.btnid
    deleteFromStorage(imgUrl)
    
});

  /* the following div is added
    <div class = 'wardrobe-item-wrapper' data-divid = `${src}` >
    <img src="imgSrc"  class="wardrobe-item" data-slot="category"></img>
    <button class=`remove-btn' data-btnid = `${src}` data-category='category'>x</button>
    </div>   
    */


// get all the clothes
const defaultWardrobe = [
  { image: "clothes pictures/jumper_1.png", slot: "top", tag: "thick" },
  { image: "clothes pictures/jumper_2.png", slot: "top", tag: "thick" },
  { image: "clothes pictures/thin_top_1.png", slot: "top", tag: "thin" },
  { image: "clothes pictures/skirt_1.png", slot: "bottom", tag: "thick" },
  { image: "clothes pictures/trouser_1.png", slot: "bottom", tag: "thick"},
  { image: "clothes pictures/bottom_3.png", slot: "bottom", tag: "thin" },
  { image: "clothes pictures/skirt_2.png", slot: "outfit", tag: "thick" },
  { image: "clothes pictures/skirt_3.png", slot: "outfit", tag: "thick" },
  { image: "clothes pictures/white_dress.png", slot: "outfit", tag: "thin"},
  { image: "clothes pictures/shoes_1.png", slot: "shoes", tag: "thick" },
  { image: "clothes pictures/shoes_2.png", slot: "shoes", tag: "thin" }
];
// uploaded items
let uploadedWardrobe= JSON.parse(localStorage.getItem('uploadItems')) || [];

//all items
const allWardrobeItems = [...defaultWardrobe, ...uploadedWardrobe];


//fetch weather information

const startTime = Date.now();
let statusMessage = document.getElementById('status-message')
statusMessage.innerHTML = `
<span class = 'spinner'></span> Locating… we see everything, even that messy room of yours! 😏
`
navigator.geolocation.getCurrentPosition(successCallback, errorCallback);

async function getWeather(lat, lon) {
    const apiKey = '2d5bad4edcaa282b3f4f4dde28194321';
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    try {
        const response = await fetch(url)
        const data = await response.json()

    return {cityName: data.name, 
        weather: data.weather[0].main, 
        iconUrl:`http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`, 
        temperature: data.main.temp,
        minTemperature: data.main.temp_min, 
        maxTemperature:data.main.temp_max}  
    } catch (error){
        console.error('Error in getting the weather:', error)
        return null
    }
      
}



async function successCallback(position) {
    /* if you want more time
    const elipsedTime = Date.now()-startTime;
    const minTime = 1000;
    if (elipsedTime < minTime) {
        setTimeout(() => {statusMessage.innerHTML = `
            <span class = 'spinner'></span> Locating… we see everything, even that messy room of yours! 😏
        ` }, minTime-elipsedTime) 
        } else {
        statusMessage.innerHTML = "Found you! And yes… you're right where we expected 😏" 
    };
    */
        statusMessage.innerHTML = "Found you! And yes… you're right where we expected 😏" 
        try{
            let lat = position.coords.latitude
            let lon = position.coords.longitude
            const response = await getWeather(lat, lon)

            document.getElementById('weather-data').innerHTML = `
                <img src = ${response.iconUrl} alt="Weather icon"> 
                <p>📍Location: ${response.cityName} -----  ☀️Weather: ${response.weather} ----- 🌡️Temperature: ${response.temperature}°C</p>
                <p>📉Min temperature: ${response.minTemperature}°C ----- 📈Max temperature: ${response.maxTemperature}°C</p>
            `   
            temperature = response.temperature;  
            const rules = getAllowedTags(response.temperature);
            const filteredItems= filterWardrobe(allWardrobeItems, rules);
            const finalOutfit = pickSuggestions(filteredItems);
            const categories = ["top", "bottom", "outfit"];
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];

            outfitSrc = finalOutfit.find(o => o.slot == 'outfit').image;
            shoesSrc = finalOutfit.find(s => s.slot == 'shoes').image;
            topSrc = finalOutfit.find(t => t.slot == 'top').image;
            bottomSrc = finalOutfit.find(b => b.slot == 'bottom').image;

            if (randomCategory == 'outfit') {
                document.querySelector('.outfit-slot').src = outfitSrc;
                document.querySelector('.shoes-slot').src = shoesSrc;
            } else if (randomCategory == 'top' || randomCategory == 'bottom'){
                document.querySelector('.outfit-slot').src = '';
                document.querySelector('.top-slot').src = topSrc;
                document.querySelector('.bottom-slot').src = bottomSrc;
                document.querySelector('.shoes-slot').src = shoesSrc;
            }
            document.getElementById('change-outfit').style.display = 'inline-block';
            document.getElementById('text-suggestions').style.display = 'block';

        } catch (error) {
            console.error('Error in getting the location:', error)
            return null
        }; 
        

    };


console.log(temperature)

//get allowed tags
function getAllowedTags(tempC) {
    if (tempC <= 15){
        return {top: 'thick', bottom: 'thick', outfit:'thick', shoes:'thick'}
    } else if (tempC <=25) {
        return {top: 'thin', bottom: 'thick', outfit:'thin', shoes:'thick'}
    } else {
        return {top: 'thin', bottom: 'thin', outfit:'thin', shoes:'thin'}
    }
}

//filter wardrobe
function filterWardrobe(allWardrobeItems, rules) {
  return allWardrobeItems.filter(item => {
    const allowedForSlot = rules[item.slot];
    return allowedForSlot === 'any' || item.tag === allowedForSlot;
  });
};


function pickSuggestions(filteredItems) {
    // group items by slot (top, bottom, outfit, shoes)

   const suggestionsTops = []; 
   const suggestionsBottoms = [];
   const suggestionsOutfits = [];
   const suggestionsShoes = [];
   filteredItems.forEach(item => {
    if (item.slot == 'top') {
      suggestionsTops.push(item)
    } else if(item.slot == 'bottom') {
      suggestionsBottoms.push(item)
    } else if (item.slot == 'outfit') {
        suggestionsOutfits.push(item)
    } else {
        suggestionsShoes.push(item);
    }
  });

    topSuggestion = getRandomClothes(suggestionsTops);   
    bottomSuggestion = getRandomClothes(suggestionsBottoms);
    outfitSuggestion = getRandomClothes(suggestionsOutfits);
    shoesSuggestion = getRandomClothes(suggestionsShoes);

    finalSuggestion = [];
    finalSuggestion.push(topSuggestion, bottomSuggestion, outfitSuggestion, shoesSuggestion)
    return finalSuggestion; 
}


function getRandomClothes (myArray){
    const randomIndex = Math.floor(Math.random() * myArray.length);
    return myArray[randomIndex]
}

//error callback for getting location
function errorCallback(error) {
    console.error('Error in getting location:', error.message)
    document.getElementById('status-message').innerHTML = 'Could not get location. Please allow location access.';
}


//delete item from local storage
function deleteFromStorage (imgUrl) {
    let uploadedItems = JSON.parse(localStorage.getItem('uploadItems'));
    uploadedItems = uploadedItems.filter(obj => obj.img !== `${imgUrl}`)
    localStorage.setItem('uploadItems', JSON.stringify(uploadedItems));
}


//save to local storage
function saveToStorage(imgUrl, category, thickness){
    let newItem = {'img': imgUrl, 'category': category, 'thickness': thickness};
    let uploadedItems = JSON.parse(localStorage.getItem('uploadItems')) || [];
    uploadedItems.push(newItem);
    localStorage.setItem('uploadItems', JSON.stringify(uploadedItems));
    
}

//load local storage
function loadLocalStorage () {
    let uploadedItems = JSON.parse(localStorage.getItem('uploadItems')) || [];
    uploadedItems.forEach(item =>{
        addClothesToWardrobe(item.img, item.category, item.thickness);
    })
}

  

//render clothes to the right place
function addClothesToWardrobe (imgSrc, category, thickness) {
    let newWardrobeItemDiv = document.createElement('div');
    newWardrobeItemDiv.classList.add('wardrobe-item-wrapper')
    newWardrobeItemDiv.setAttribute("data-divid", `${imgSrc}`);
    
    let deleteButton = document.createElement('button')
    deleteButton.classList.add('remove-btn')
    deleteButton.innerHTML = 'x'
    deleteButton.setAttribute('data-btnid', `${imgSrc}`);
    deleteButton.setAttribute('data-category', `${category}`);

    let newClothes = document.createElement("img"); 
    newClothes.src = imgSrc;
    newClothes.classList.add('wardrobe-item', `js-${category}`); 
    newClothes.setAttribute('data-slot', `${category}`);
     
    
    newWardrobeItemDiv.append(newClothes, deleteButton)

    document.getElementById(`js-${thickness}-${category}`).appendChild(newWardrobeItemDiv);
    

    /* the following div is added
    <div class = 'wardrobe-item-wrapper' data-divid = `${src}` >
    <img src="imgSrc"  class="wardrobe-item js-category" data-slot="category"></img>
    <button class=`remove-btn js-${slot} data-btnid = `${src}` data-category='category'>x</button>
    </div>   
    */
}


//hide confirm and cancel button
function hideTwoBtns() {
    document.getElementById("confirm-btn").style.display = 'none';
    document.getElementById("cancel-btn").style.display = 'none';
}

// run when page loads
window.addEventListener('DOMContentLoaded', loadLocalStorage);


//remove clothes
function removeClothes (event) {
    if (event.target.classList.contains('remove-btn')) {
        const targetBtnId = event.target.dataset.btnid
        const targetDiv = document.querySelector(`[data-divid = ${CSS.escape(targetBtnId)} ]`)   //querySelector is picky about special characters. If your ID has spaces, dots, or other CSS special characters, it must be escaped:
        if (targetDiv) {
            targetDiv.remove();
        };
    };
}

//empty both src and alt 
function emptySrcAlt(element){
    element.src = '';
    element.alt = '';
}


//extract top/bottom/outfit/shoes
function extractCategory (dataAttributeName) {
    extractedArray = dataAttributeName.split('-');
    return (extractedArray[1])
};
function extractCategoryThickness (dataAttributeName) {
    extractedArray = dataAttributeName.split('-');
    return (extractedArray[0])
};
//add selected class into selected items
function addSelected (items, wardrobeItem) {
    items.forEach(item=> {
        item.classList.remove('selected');
        wardrobeItem.target.classList.add('selected');   
    });
};

//remove selected class into selected items
function removeSelected (className) {
     document.querySelectorAll(`.${className}`).forEach(element => {
        element.classList.remove('selected'); 
    });
};

function removeAllSelected () {
     document.querySelectorAll('.wardrobe-item').forEach(element => {
        element.classList.remove('selected'); 
    });
};



/*
function showTextSuggestion(weather) {
    const textSuggestion = document.getElementById('text-suggestions').innerHTML;
    console.log(textSuggestion)
     if (weather.includes('clear')) {
        textSuggestion = 'Breezy fabrics, light colors, shades on—sun-ready and chic!'
     } else if (weather.includes('rain')) {
        textSuggestion = 'Trench coat, waterproof shoes, umbrella in hand—rainproof glam!'

     } else if (weather.includes('snow') ) {
        textSuggestion = 'Cozy layers, scarves, boots—warmth meets style.'
     } else {
        textSuggestion = 'What a beatiful day!'
     }
};
*/