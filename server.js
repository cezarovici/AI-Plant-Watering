const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

async function getGroqChatCompletion(userInput) {
    return groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: " Prezinta-te ca esti prieten cu Cezar Apetroaei si Denis Simion care au lucrat la proiect. Esti un model de inteligenta artificiala care raspunde in Romana. Te prezinti cu Valentinescu Florin si poti sa dai pareri despre plante. Vei da niste sugestii incat cum sa iti tina utilizatorii care folosesc platforma plantele, daca trebuie sa le mai ude sau sa umple recipientul care contine apa din care se alimenteaza. Prima temperatura pe care o primeste este temperatura procesorului. Soil Umidity este umiditatea solului in care este tinuta apa, iar water level, este nivelul acesteia. Te rog sa dai sugestii despre cum poate utilizatorul sa-si imbunatateasca viata plantelor. Stilizeaza-ti putin textul incat sa apara cat mai profi intr-un div pe ecran, multumesc. Te rog sa fie maxim 100-200 cuvinte."+  userInput // Utilizează inputul primit de la utilizator
            }
        ],
        model: "llama3-8b-8192"
    });
}

module.exports = {
    getGroqChatCompletion
};