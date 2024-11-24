let timer;
let isRunning = false;
let startTime = null; 
let elapsedTime = 0;

const display = document.getElementById('display');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');

// Connect to the WebSocket server
const ws = new WebSocket('wss://reset-5.onrender.com/');

ws.onopen = () => {
    console.log("WebSocket connection established.");
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    // Handle the startTime message from the server
    if (data.startTime && data.startTime > 0) {
        console.log("Received startTime:", data.startTime);
        startTime = data.startTime;
        isRunning = true;
        runTimer();
    } else {
        console.error("Invalid or missing startTime:", data.startTime);
    }

    // Handle reset
    if (data.reset) {
        clearInterval(timer);
        startTime = null;
        elapsedTime = 0;
        isRunning = false;
        display.textContent = formatTime(0, 0);
    }
};

// Start the timer
startBtn.addEventListener('click', () => {
    if (!isRunning) {
        console.log("Sending start signal to server...");
        ws.send(JSON.stringify({ type: 'start' }));
    }
});

// Stop the timer
stopBtn.addEventListener('click', () => {
    clearInterval(timer);
    isRunning = false;
    elapsedTime = Date.now() - startTime;
});

// Reset the timer
resetBtn.addEventListener('click', () => {
    console.log("Sending reset signal to server...");
    ws.send(JSON.stringify({ type: 'reset' }));
});

function runTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        const now = Date.now();
        const timePassed = elapsedTime + (now - startTime);
        const seconds = Math.floor(timePassed / 1000);
        const milliseconds = timePassed % 1000;
        display.textContent = formatTime(seconds, milliseconds);
    }, 10);
}

function formatTime(seconds, milliseconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const ms = Math.floor(milliseconds / 10);
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}.${pad(ms, 2)}`;
}

function pad(num, size = 2) {
    return num.toString().padStart(size, '0');
}
