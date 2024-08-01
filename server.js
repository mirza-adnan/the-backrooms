const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

// INITIALIZATION
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// MIDDLEWARE
app.use(express.static(__dirname + "/static"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/static/index.html"));
});

io.on("connection", (socket) => {
  console.log("a user has connected");

  socket.on("text", (msg) => {
    io.emit("text", msg);
  });

  socket.on("disconnect", (socket) => {
    console.log("a user has disconnected");
  });
});

server.listen(3131, () => {
  console.log("server running on http://localhost:3131");
});
