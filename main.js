const lightMode = document.getElementById('light')
const body = document.body
const darkMode = document.getElementById('dark')
const pronunciationSection = document.getElementById('pronunciation-section')
const wordTitle = document.getElementById('word-title')
const speakerIcon = document.getElementById('speaker-icon')
const wordExplanation = document.getElementById('word-explanation')
const unavail = document.getElementById('unavail')

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
            const response = await fetch('https://random-word-api.vercel.app/api?words=1');
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
        const oneDayInMilliseconds = 86400000; // 24 hours in milliseconds

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
            let audio = res[0].phonetics[0].audio
            localStorage.setItem('audio', audio.src);
            if(!audio){
                unavail.style.display = 'block'
                setTimeout(function() {
                    unavail.style.display = 'none';
                }, 3000);
            }else{
                audio = new Audio(`${audio}`)
                audio.play().catch(error => console.error(error.message));
            }
           
        });

        const phonetics = res[0].phonetics.length
        localStorage.setItem('phonetics', phonetics)

        if(phonetics === 0){
            const p = document.createElement('p')
            p.innerHTML = `<span class="word-pronunciation" style='font-style:italic;'>No pronunciation available</span>`
            pronunciationSection.appendChild(p)
        }

        for(i=0; i < phonetics; i++){
            if(i < phonetics){
                const li = document.createElement('li')
                li.innerHTML = `<span class="word-pronunciation">${res[0].phonetics[i].text}</span>`
                pronunciationSection.appendChild(li)              
            }
        }

    } catch (error) {
        console.error(`Error Fetching Word ${error}`)
    }
});
