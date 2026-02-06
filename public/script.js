const socket = io();

const usernameInput = document.getElementById("usernameInput");
const joinBtn = document.getElementById("joinBtn");
const chat = document.getElementById("chat");
const inputBar = document.getElementById("inputBar");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

let joined = false;

joinBtn.onclick = () => {
    const username = usernameInput.value.trim();
    if (!username) return;

    socket.emit("join", username);
    joined = true;

    chat.classList.remove("hidden");
    inputBar.classList.remove("hidden");

    usernameInput.disabled = true;
    joinBtn.disabled = true;
};

sendBtn.onclick = sendMessage;
messageInput.addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
});

function sendMessage() {
    if (!joined) return;
    const msg = messageInput.value.trim();
    if (!msg) return;

    socket.emit("chatMessage", msg);
    messageInput.value = "";
}

socket.on("chatHistory", messages => {
    chat.innerHTML = "";
    messages.forEach(addMessage);
});

socket.on("message", addMessage);

function addMessage(data) {
    const div = document.createElement("div");
    div.className = "message";

    if (data.user === "Chatter-LiveChat") {
        div.innerHTML = `<span class="system">[${data.time}] ${data.text}</span>`;
    } else {
        div.innerHTML = `<span class="user">${data.user}</span> [${data.time}]: ${data.text}`;
    }

    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}