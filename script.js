// DOM Elements
const btn = document.querySelector("#btn");
const content = document.querySelector("#content");
const voiceGif = document.querySelector("#voice");

// Speak function using Web Speech API
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
   window.speechSynthesis.speak(utterance);
}


    


// Set up speech recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = false;
recognition.lang = 'en-US', 'hi-IN';

// When speech recognition starts
recognition.onstart = () => {
    voiceGif.style.display = "block";
    speak("Listening...");
};

// When speech is recognized
recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase().trim();
    content.innerText = `You said: "${transcript}"`;
    processCommand(transcript);
    voiceGif.style.display = "none";
};

// Button click to start listening
btn.addEventListener("click", () => {
    recognition.start();
});

// Logic to handle spoken commands
function processCommand(command) {
    if (command.includes("restart my computer")) {
        speak("Restarting your computer...");
        fetch("http://localhost:3000/api/restart")
            .then(() => console.log("Restart command sent"))
            .catch((error) => {
                console.error("Error:", error);
                speak("Failed to send restart command.");
            });

    } else if (command.includes("shutdown")) {
        speak("Shutting down your computer...");
        fetch("http://localhost:3000/api/shutdown")
            .then(() => console.log("Shutdown command sent"))
            .catch((error) => {
                console.error("Error:", error);
                speak("Failed to send shutdown command.");
            });
        } else if (command === "play music") {
            speak("Playing music on YouTube...");
            window.open("https://www.youtube.com/results?search_query=music", "_blank");
    
        } else if (command.startsWith("open ")) {
            const siteName = command.replace("open ", "").replace(/\s+/g, "").toLowerCase();
            const urlMap = {
                youtube: "https://www.youtube.com",
                gmail: "https://mail.google.com",
                facebook: "https://www.facebook.com",
                instagram: "https://www.instagram.com",
                twitter: "https://twitter.com",
                x: "https://twitter.com",
                whatsapp: "https://web.whatsapp.com",
                "google drive": "https://drive.google.com"
            };
    
            const url = urlMap[siteName] || `https://www.${siteName}.com`;
    
            speak(`Opening ${siteName}...`);
            window.open(url, "_blank");
        } else if (command.startsWith("play ")) {
            let query = command.replace("play ", "").trim();
    
            if (query === "music") {
                speak("Playing music on YouTube...");
                window.open("https://www.youtube.com/results?search_query=music", "_blank");
            } else {
                speak(`Playing ${query} on YouTube...`);
                const searchQuery = encodeURIComponent(query);
                window.open(`https://www.youtube.com/results?search_query=${searchQuery}`, "_blank");
            }
       
    
        }else {
        askAI(command);
    }
}




// Send user question to Gemini AI via Express backend
function askAI(question) {
    speak("Let me think...");
    fetch("http://localhost:3000/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data?.text) {
                speak(data.text);
                content.innerText = `AI: ${data.text}`;
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            speak("Sorry, I couldn't process that.");
        });
}
const stopBtn = document.querySelector("#stopBtn");

stopBtn.addEventListener("click", () => {
    window.speechSynthesis.cancel();  // Stop speaking
    recognition.abort();              // Stop listening (if active)
    voiceGif.style.display = "none";  // Hide GIF if showing
    content.innerText = "Assistant stopped.";
});

  