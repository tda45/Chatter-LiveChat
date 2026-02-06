const socket = io();

const usernameInput = document.getElementById("username");
const joinBtn = document.getElementById("joinBtn");

const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");

const chat = document.getElementById("chat");
const typingDiv = document.getElementById("typing");

let username = null;

// BAŞTA KAPALI
messageInput.disabled = true;
sendBtn.disabled = true;

joinBtn.onclick = () => {
    const name = usernameInput.value.trim();
    if (!name) {
        alert("Kullanıcı adı gir");
        return;
    }

    username = name;
    socket.emit("join", username);

    document.querySelector(".top-bar").classList.add("hidden");
    document.querySelector(".input-bar").classList.remove("hidden");

    messageInput.disabled = false;
    sendBtn.disabled = false;
    messageInput.focus();
};

sendBtn.onclick = sendMessage;

messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
});

function sendMessage() {
    if (!username) return;

    const text = messageInput.value.trim();
    if (!text) return;

    socket.emit("chat", text);
    messageInput.value = "";
}

socket.on("chat", (data) => {
    const div = document.createElement("div");
    div.className = "message";
    div.innerHTML = `<span class="user">[${data.time}] ${data.user}:</span> ${data.text}`;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
});

socket.on("system", (data) => {
    const div = document.createElement("div");
    div.className = "system";
    div.textContent = `[${data.time}] ${data.text}`;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
});