const socket = io();

const form = document.querySelector("#text-form");
const input = document.querySelector("#text-input");
const messages = document.querySelector("#messages");

function createMessageComponent(msg, name) {
  const container = document.createElement("div");
  container.className = "message";

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
    socket.emit("text", input.value);
    input.value = "";
  }
});

socket.on("text", (msg) => {
  createMessageComponent(msg, "Mirza Adnan");
  messages.scrollTop = messages.scrollHeight;
});
