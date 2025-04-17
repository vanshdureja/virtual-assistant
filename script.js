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
recognition.lang = 'en-US';

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
        fetch("https://virtual-assistant-sfhw.onrender.com/api/restart")
            .then(() => console.log("Restart command sent"))
            .catch((error) => {
                console.error("Error:", error);
                speak("Failed to send restart command.");
            });
    } else if (command.includes("shutdown")) {
        speak("Shutting down your computer...");
        fetch("https://virtual-assistant-sfhw.onrender.com/api/shutdown")
            .then(() => console.log("Shutdown command sent"))
            .catch((error) => {
                console.error("Error:", error);
                speak("Failed to send shutdown command.");
            });
    } else {
        askAI(command);
    }
}

// Send user question to Gemini AI via Express backend
function askAI(question) {
    speak("Let me think...");
    fetch("https://virtual-assistant-sfhw.onrender.com/api/ask", {
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

  