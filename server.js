const http = require('http');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading index.html');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } else if (req.url === '/script.js') {
        fs.readFile(path.join(__dirname, 'public', 'script.js'), (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(200, { 'Content-Type': 'application/javascript' });
                res.end(data);
            }
        });
    } else if (req.url === '/styles.css') {
        fs.readFile(path.join(__dirname, 'public', 'styles.css'), (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/css' });
                res.end(data);
            }
        });
    } else {
        res.writeHead(404);
        res.end('404: File not found');
    }
});

const wss = new WebSocket.Server({ server });
let globalStartTime = null;

wss.on('connection', (ws) => {
    console.log('A new client connected');
    
    if (globalStartTime) {
        ws.send(JSON.stringify({ startTime: globalStartTime }));
    }

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            if (data.type === 'start') {

                globalStartTime = Date.now();
                console.log(`Timer started at ${globalStartTime}`);

                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ startTime: globalStartTime }));
                    }
                });
            } else if (data.type === 'reset') {

                globalStartTime = null;
                console.log('Timer reset');

                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ reset: true }));
                    }
                });
            }
        } catch (error) {
            console.error(`Error parsing message: ${error.message}`);
        }
    });

    ws.on('close', () => console.log('A client disconnected'));
    ws.on('error', (error) => console.error(`Client error: ${error.message}`));
});

server.listen(process.env.PORT || 8080, () => {
    console.log(`Server is listening on port ${process.env.PORT || 8080}`);
});
