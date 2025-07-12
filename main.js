const lightMode = document.getElementById('light')
const body = document.body
const darkMode = document.getElementById('dark')

lightMode.addEventListener('click', ()=>{
    body.classList.add('dark-mode')
})

darkMode.addEventListener('click', ()=>{
    body.classList.remove('dark-mode')
})


async function getDailyWords() {
    const url = 'https://random-words5.p.rapidapi.com/getMultipleRandom?count=1';
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': 'e651b4bfd9msh8d7a8c1cb5339b4p100971jsncecca64ea2bd',
            'x-rapidapi-host': 'random-words5.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.text();
        console.log(result);
    } catch (error) {
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', getDailyWords)