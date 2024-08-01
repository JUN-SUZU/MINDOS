const http = require('http');
const fs = require('fs');
const cron = require('node-cron');

let users = {};
let points = {};
let target = ["https://mirai.jun-suzu.net"];

const server = http.createServer((req, res) => {
    let url = req.url;
    let ipadr = getIPAddress(req);
    if (req.method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
    }
    else if (req.method === 'GET') {
        console.log(`requested: GET ${url} data: ${req.headers['user-agent']} ip: ${ipadr}`);
        if (url.endsWith('/')) url += 'index.html';
        if (url.replace('../', '') !== url) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('Forbidden');
            return;
        }
        fs.readFile(`./docs${url}`, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
            } else {
                if (url.endsWith('.html')) res.writeHead(200, { 'Content-Type': 'text/html' });
                else if (url.endsWith('.css')) res.writeHead(200, { 'Content-Type': 'text/css' });
                else if (url.endsWith('.js')) res.writeHead(200, { 'Content-Type': 'text/javascript' });
                else if (url.endsWith('.ico')) res.writeHead(200, { 'Content-Type': 'image/x-icon' });
                else res.writeHead(200);
                res.end(data);
            }
        });
    }
    else if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            console.log(`requested: POST ${url} data: ${body} ip: ${ipadr}`);
            let data = {};
            try {
                data = JSON.parse(body);
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Bad Request');
                return;
            }
            if (url === '/api/signup') {
                if (users[data.id]) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: 'failed', message: 'User already exists' }));
                } else {
                    users[data.id] = data.password;
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: 'success' }));
                }
            } else if (url === '/api/request') {
                if (users[data.account] === data.token && points[data.account] > 200) {
                    target.push(data.target);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: 'success' }));
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: 'failed', message: 'Invalid token' }));
                }
            } else if (url === '/api/earn') {
                if (users[data.account] === data.token) {
                    if (data.count !== undefined) {
                        points[data.account] = (points[data.account] || 0) + data.count;
                        console.log(points);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ status: 'success'}));
                    }
                    else {
                        let primetargets = target;
                        console.log(primetargets);
                        if (primetargets.length > 5) {
                            primetargets = primetargets.slice(0, 5);
                        }
                        else if (primetargets.length === 0) {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ status: 'failed', message: 'No target' }));
                            return;
                        }
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ status: 'success', targets: primetargets }));
                    }
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: 'failed', message: 'Invalid token' }));
                }
            }
        });
    }
});

function getIPAddress(req) {
    if (req.headers['x-forwarded-for']) {
        return req.headers['x-forwarded-for'].split(/\s*,\s*/)[0];
    } else if (req.connection.remoteAddress) {
        return req.connection.remoteAddress;
    } else {
        return req.socket.remoteAddress;
    }
}

server.listen(25502, () => {
    console.log('Server started');
});
