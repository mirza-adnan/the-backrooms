const socket = io();

const user = {
  username: "",
  channel: "",
  id: "",
};

const chatScreen = document.querySelector("#chat-layout");
const authScreen = document.querySelector("#auth-layout");
const channelTitle = document.querySelector("#channel-name");

const form = document.querySelector("#text-form");
const input = document.querySelector("#text-input");
const messages = document.querySelector("#messages");

function showChat() {
  chatScreen.classList.remove("hidden");
  chatScreen.classList.add("flex");

  authScreen.classList.add("hidden");
}

(function Auth() {
  console.log("ran auth");
  const inputs = {
    username: document.querySelector("#username-input"),
    channelName: document.querySelector("#channel-name-input"),
    channelPassword: document.querySelector("#channel-password-input"),
  };
  const authForm = document.querySelector("#auth-form");

  const login = (e) => {
    e.preventDefault();

    const username = inputs.username.value.trim();
    const channelName = inputs.channelName.value.trim();
    const channelPassword = inputs.channelPassword.value.trim();
    console.log(channelPassword);

    if (username && channelName && channelPassword) {
      const reqBody = {
        username,
        channelName,
        channelPassword,
      };

      fetch("http://localhost:3131", {
        method: "POST",
        body: JSON.stringify(reqBody),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (res.status === 401) {
            throw new Error(
              "Password does not match the specified channel's password"
            );
          } else if (res.status === 404) {
            throw new Error("Channel with that name does not exist");
          } else if (res.status === 400) {
            throw new Error(
              "A member with that name is already in the channel"
            );
          }
          return res.json();
        })
        .then((data) => {
          user.username = username;
          user.channelName = channelName;
          if (localStorage.getItem(username)) {
            user.id = localStorage.getItem(username);
          } else {
            localStorage.setItem(username, data.id);
            user.id = data.id;
          }

          socket.emit("login", {
            username: user.username,
            channelName: user.channelName,
          });

          channelTitle.textContent = channelName;

          showChat();

          data.messages.forEach((message) => {
            createMessageComponent(
              message.content,
              message.author.name,
              message.author.id === user.id
            );
          });

          socket.on(user.channelName, (message) => {
            createMessageComponent(
              message.content,
              message.author.name,
              message.author.id === user.id
            );
            messages.scrollTop = messages.scrollHeight;
          });

          messages.scrollTop = messages.scrollHeight;
        })
        .catch((err) => {
          alert(err);
        });
    } else {
      alert("One of the fields is blank");
    }
  };

  authForm.addEventListener("submit", login);
})();

function createMessageComponent(msg, name, isReply) {
  const container = document.createElement("div");
  container.className = "message";
  if (isReply) {
    container.classList.add("flex", "flex-col", "items-end");
  }

  const user = document.createElement("p");
  user.className = "text-sm text-white/50 px-2 mb-1";
  user.textContent = name;

  const message = document.createElement("p");
  message.className =
    "py-3 px-4 bg-white/10 w-fit rounded-xl md:max-w-[70%] max-w-[90%]";
  message.textContent = msg;

  container.appendChild(user);
  container.appendChild(message);

  messages.appendChild(container);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (input.value.trim()) {
    socket.emit("text", {
      content: input.value,
      author: { name: user.username, id: user.id },
      channelName: user.channelName,
    });
    input.value = "";
  }
});
