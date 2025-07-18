const lightMode = document.getElementById('light')
const body = document.body
const darkMode = document.getElementById('dark')
const pronunciationSection = document.getElementById('pronunciation-section')
const wordTitle = document.getElementById('word-title')
const speakerIcon = document.getElementById('speaker-icon')
const wordExplanationSection = document.getElementById('word-explanation-section')
const unavail = document.getElementById('unavail')
const searchBar = document.getElementById('word')
const searchIcon = document.getElementById('search')
const dayWord = document.getElementById('dayWord')
const alertBox = document.getElementById('alert')

lightMode.addEventListener('click', ()=>{
    body.classList.add('dark-mode')
})

darkMode.addEventListener('click', ()=>{
    body.classList.remove('dark-mode')
})


document.addEventListener('DOMContentLoaded', async() => {

        async function getDailyWords() {
        // Fetch a random word from the API
        try {
            const response = await fetch('https://random-word-api.vercel.app/api?words=1&type=capitalized');
            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            const word = result[0];
            console.log("Fetched word:", word);

            // Fetch dictionary data for the new word
            const dictionaryResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            if(!dictionaryResponse.ok) {
                throw new Error(`HTTP error! status: ${dictionaryResponse.status}`);
            }
            const dictionaryData = await dictionaryResponse.json();

            // Store everything in localStorage
            const timeStamp = Date.now();
            localStorage.setItem('lastfetch', timeStamp);
            localStorage.setItem('word', word);
            localStorage.setItem('dictionaryData', JSON.stringify(dictionaryData));

            return { word, dictionaryData };
        } catch (error) {
            console.error("Failed to fetch data:", error);
        }
    }

    const lastFetchTime = localStorage.getItem('lastfetch');

    if(lastFetchTime === null){
        await getDailyWords()
    }else{
        const currentTime = Date.now()
        const savedTime = Number(lastFetchTime)
        const timeDifference = currentTime - savedTime
        const oneDayInMilliseconds = 86400000; // 24 hours in milliseconds

        if(timeDifference > oneDayInMilliseconds){
            await getDailyWords()
        }   
    }

    try {
        let dictionaryData;
        const fetchWord = localStorage.getItem('word');
        const cachedDictionaryData = localStorage.getItem('dictionaryData');

        if (cachedDictionaryData) {
            dictionaryData = JSON.parse(cachedDictionaryData);
        } else {
            // Fallback fetch if cache is missing
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${fetchWord}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            dictionaryData = await response.json();
        }

        const res = dictionaryData;
        console.log(res[0])

        wordTitle.textContent = fetchWord
        speakerIcon.onclick = () => {
            const audioUrl = res[0].phonetics.find(p => p.audio && p.audio.trim() !== '')?.audio;
            if(!audioUrl){
                unavail.style.display = 'block'
                setTimeout(function() {
                    unavail.style.display = 'none';
                }, 3000);
            }else{
                const audio = new Audio(audioUrl);
                audio.play().catch(error => console.error(error));
            }
        };

        const phonetics = res[0].phonetics.length
        localStorage.setItem('phonetics', phonetics)

        if(!phonetics){
            const p = document.createElement('p')
            p.className = 'word-pronunciation'
            p.innerHTML = `No pronunciation available for this word`
            pronunciationSection.appendChild(p)
        }else{
            for(i=0; i < phonetics; i++){
            if(i < phonetics){
                if(!res[0].phonetics[i].text){
                    continue;
                }  
                const li = document.createElement('li')
                li.className = 'word-pronunciation'
                li.innerHTML = `${res[0].phonetics[i].text}`
                pronunciationSection.appendChild(li)              
            }
        }
        }

        const definition = res[0].meanings.length
        localStorage.setItem('definition', definition)

        if(!definition){
            const p = document.createElement('p')
            p.className = 'word-explanation'
            p.innerHTML = `No definition available for this word`
            wordExplanationSection.appendChild(p)
        }else{
            for(i=0; i < definition; i++){
                const meaningDefinitions = res[0].meanings[i].definitions;
                for(let j=0; j < meaningDefinitions.length; j++){
                    const p = document.createElement('p')
                    p.className = 'word-explanation'
                    p.innerHTML = `${meaningDefinitions[j].definition}`
                    wordExplanationSection.appendChild(p)
                }
            }
        }

    } catch (error) {
        console.error(`Error Fetching Word ${error}`)
    }
});

// Extract search functionality into a separate function
async function performSearch() {
    let wordToSearch = searchBar.value;
    if(!wordToSearch){
        alertBox.textContent = 'Please enter a word to search'
        alertBox.style.display = 'block'
        setTimeout(function() {
            alertBox.style.display = 'none';
        }, 3000);
        return;
    }else if(typeof wordToSearch !== 'string' || wordToSearch.trim() === ''){
        alertBox.textContent = 'Please enter a valid word'
        alertBox.style.display = 'block'
        setTimeout(function() {
            alertBox.style.display = 'none';
        },3000)
        return;
    }
    
    try {
        dayWord.style.display = 'none'
        const wordSearchRequest = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${wordToSearch.trim()}`)
        if(!wordSearchRequest.ok) throw new Error(`HTTP error! status: ${wordSearchRequest.status}`)
        const wordSearchResponse = await wordSearchRequest.json()
        
        wordTitle.textContent = wordSearchResponse[0].word

        pronunciationSection.innerHTML = ''; // Clear previous pronunciations
        const phonetics = wordSearchResponse[0].phonetics.length
        if(!phonetics){
            const p = document.createElement('p')
            p.className = 'word-pronunciation'
            p.innerHTML = `No pronunciation available for this word`
            pronunciationSection.appendChild(p)
        }else{
            for(i=0; i < phonetics; i++){
                if(i < phonetics){
                    if(!wordSearchResponse[0].phonetics[i].text){
                        continue;
                    }
                    const li = document.createElement('li')
                    li.className = 'word-pronunciation'
                    li.innerHTML = `${wordSearchResponse[0].phonetics[i].text}`
                    pronunciationSection.appendChild(li)    
                }
            }
        }

        wordExplanationSection.innerHTML = ''; // Clear previous explanations
        const definition = wordSearchResponse[0].meanings.length

        if(!definition){
            const p = document.createElement('p')
            p.className = 'word-explanation'
            p.innerHTML = `No definition available for this word`
            wordExplanationSection.appendChild(p)
        }else{
            for(i=0; i < definition; i++){
                const meaningDefinitions = wordSearchResponse[0].meanings[i].definitions;
                for(let j=0; j < meaningDefinitions.length; j++){
                    const p = document.createElement('p')
                    p.className = 'word-explanation'
                    p.innerHTML = `${meaningDefinitions[j].definition}`
                    wordExplanationSection.appendChild(p)
                }
            }
        }

        speakerIcon.onclick = () => {
            const phonetics = wordSearchResponse[0].phonetics;
            const audioUrl = phonetics.find(p => p.audio && p.audio.trim() !== '')?.audio;
            if(!audioUrl){
                unavail.style.display = 'block'
                setTimeout(function() {
                    unavail.style.display = 'none';
                }, 3000);
            }else{
                const audio = new Audio(audioUrl);
                audio.play().catch(error => console.error(error));
            }
        };
    } catch (error) {
        alertBox.textContent = 'Word not found'
        alertBox.style.display = 'block'
        setTimeout(function() {
            alertBox.style.display = 'none';
        }, 3000);
    }
}

// Add click event listener
searchIcon.addEventListener('click', performSearch);

// Add keypress event listener for Enter key
searchBar.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        performSearch();
    }
});