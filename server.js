const express = require('express');
const path = require("path");
const app = express();
const http = require('http');
const server = http.createServer(app);
const messages = [];
let connectedUsers = 0;

const io = require("socket.io")(server);

// Přidání loggovacího systému
const winston = require('winston');
const { combine, timestamp, label, printf } = winston.format;
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = winston.createLogger({
  format: combine(
    label({ label: 'server' }),
    timestamp(),
    myFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

app.use(express.static(path.join(__dirname + "/public")));

io.on("connection", function(socket){
  // Připojení nového uživatele
  socket.on("newUser", function(username){
    connectedUsers++;
    // Odeslat kompletní historii chatu
    messages.forEach((message) => {
      socket.emit("chat", message);
    });
    socket.broadcast.emit("update", username + " se připojil do konverzace");
  });
  // Přidat novou zprávu
  socket.on("chat", function(message){
    messages.push(message);
    socket.broadcast.emit("chat", message);
  });
  // Odebrat uživatele
  socket.on("exitUser", function(username){
    connectedUsers--;
    socket.broadcast.emit("update", username + " opustil konverzaci");
    if (connectedUsers === 0) {
      messages.length = 0;
    }
  });
});

// Middleware pro zachycení chyb
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).send('Something went wrong!');
});

server.listen(5000, () => {
  console.log('listening :5000');
});


