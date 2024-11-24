let timer;
let isRunning = false;
let startTime = null;
let elapsedTime = 0;
let serverTimestamp = null;
let clientLatency = 0; // Variable to store calculated latency

const display = document.getElementById('display');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');

// WebSocket connection
const ws = new WebSocket('wss://zeroserver-a38o.onrender.com/');

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.startTime) {
        startTime = data.startTime;
        serverTimestamp = data.timestamp; // Store server's timestamp

        // Calculate the latency (round-trip time) from sending the message to receiving it
        clientLatency = Date.now() - startTime; // Time difference between sending the request and receiving the startTime

        // Adjust startTime using the server timestamp and client latency
        startTime = serverTimestamp - clientLatency;

        isRunning = true;
        runTimer();
    }

    if (data.reset) {
        clearInterval(timer);
        startTime = null;
        elapsedTime = 0;
        isRunning = false;
        display.textContent = formatTime(0, 0);
    }
};

startBtn.addEventListener('click', () => {
    if (!isRunning) {
        ws.send(JSON.stringify({ type: 'start' }));
    }
});

stopBtn.addEventListener('click', () => {
    clearInterval(timer);
    isRunning = false;
    elapsedTime = Date.now() - startTime;
});

resetBtn.addEventListener('click', () => {
    ws.send(JSON.stringify({ type: 'reset' }));
});

function runTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        const now = Date.now();
        const timePassed = now - startTime; // Adjust the time using the adjusted startTime
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
