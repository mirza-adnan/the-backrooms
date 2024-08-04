const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const bcrypt = require("bcrypt");
const { v4 } = require("uuid");

// INITIALIZATION
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const channels = new Map();
channels.set("tp", {
  messages: [],
  password: "armsskl2003",
  members: [],
});
channels.set("IUT CSE 22", {
  messages: [],
  password: "iutcse22",
  members: [],
});

// MIDDLEWARE
app.use(express.static(__dirname + "/static"));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/static/index.html"));
});

app.post("/", async (req, res) => {
  const { username, channelName, channelPassword } = req.body;

  if (!channels.has(channelName)) {
    return res
      .status(404)
      .json({ message: "A channel with that name does not exist" });
  }

  if (channelPassword != channels.get(channelName).password) {
    return res.status(401).json({
      message: "Password does not match the specified channel's password",
    });
  }

  if (channels.get(channelName).members.some((member) => member === username)) {
    return res.status(400).json({
      message: "A person with that username is already in the channel",
    });
  }

  return res.status(200).json({
    messages: channels
      .get(channelName)
      .messages.slice(
        Math.max(channels.get(channelName).messages.length - 20, 0)
      ),
    id: v4(),
  });
});

io.on("connection", (socket) => {
  console.log(`${socket.id} has connected`);

  let username = "";
  let channelName = "";

  socket.on("login", (data) => {
    username = data.username;
    channelName = data.channelName;

    channels.get(channelName).members.push(username);
    console.log(channels.get(channelName).members);
    console.log(`${username} has joined ${channelName}`);

    socket.on("disconnect", () => {
      const channel = channels.get(channelName);
      channel.members = channel?.members?.filter(
        (member) => member != username
      );
      console.log(`${username} has disconnected from ${channelName}`);
    });
  });

  socket.on("text", (message) => {
    const channel = channels.get(message.channelName);

    channel.messages.push(message);
    if (channel.messages.length >= 30) {
      channel.messages = channel.messages.slice(
        Math.max(channel.messages.length - 20, 0)
      );
    }

    io.emit(message.channelName, message);
  });
});

server.listen(3131, () => {
  console.log("server running on http://localhost:3131");
});
