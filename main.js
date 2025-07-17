const lightMode = document.getElementById('light')
const body = document.body
const darkMode = document.getElementById('dark')
const pronunciationSection = document.getElementById('pronunciation-section')
const wordTitle = document.getElementById('word-title')
const speakerIcon = document.getElementById('speaker-icon')
const wordExplanationSection = document.getElementById('word-explanation-section')
const unavail = document.getElementById('unavail')
const searchBar = document.getElementById('word')

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

            const time = Date.now()
            localStorage.setItem('lastfetch', time)
            localStorage.setItem('word', word)

            return word;
        } catch (error) {
            console.error("Failed to fetch word:", error);
        }
    }

    const lastFetchTime = localStorage.getItem('lastfetch');

    if(lastFetchTime === null){
        await getDailyWords()
    }else{
        const currentTime = Date.now()
        const savedTime = Number(lastFetchTime)
        const timeDifference = currentTime - savedTime
        const oneDayInMilliseconds = 1000 //86400000; // 24 hours in milliseconds

        if(timeDifference > oneDayInMilliseconds){
            await getDailyWords()
        }   
    }

    try {
        const fetchWord = localStorage.getItem('word')
        const req = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${fetchWord}`)

        if(!req.ok){
            throw new Error(`HTTP error! status: ${req.status}`)
        }

        const res = await req.json()
        console.log(res[0])

        wordTitle.textContent = fetchWord
        speakerIcon.addEventListener('click', () => {
            let audio = (res[0].phonetics && res[0].phonetics.length > 0) ? res[0].phonetics[0].audio : null;
            localStorage.setItem('audio', audio);
            if(!audio){
                unavail.style.display = 'block'
                setTimeout(function() {
                    unavail.style.display = 'none';
                }, 3000);
            }else{
                audio = new Audio(`${audio}`)
                audio.play().catch(error => console.error(error));
            }
           
        });

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

