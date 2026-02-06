const socket = io();

const usernameInput = document.getElementById("username");
const joinBtn = document.getElementById("joinBtn");

const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");

const chat = document.getElementById("chat");
const typingDiv = document.getElementById("typing");

let username = null;
let typingTimeout = null;

// GİRİŞ
joinBtn.onclick = () => {
    const name = usernameInput.value.trim();
    if (!name) return alert("Kullanıcı adı gir!");

    username = name;
    socket.emit("join", username);

    document.querySelector(".top-bar").classList.add("hidden");
    document.querySelector(".input-bar").classList.remove("hidden");
};

// MESAJ GÖNDER
sendBtn.onclick = sendMessage;
messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
});

// YAZIYOR…
messageInput.addEventListener("input", () => {
    socket.emit("typing");

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        socket.emit("stopTyping");
    }, 1000);
});

function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || !username) return;

    socket.emit("chat", text);
    messageInput.value = "";
    socket.emit("stopTyping");
}

// CHAT MESAJI
socket.on("chat", (data) => {
    addMessage(
        `[${data.time}] `,
        `${data.user}: `,
        data.text
    );
});

// SİSTEM MESAJI
socket.on("system", (data) => {
    const div = document.createElement("div");
    div.className = "message system";
    div.textContent = `[${data.time}] ${data.text}`;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
});

// YAZIYOR…
socket.on("typing", (user) => {
    typingDiv.textContent = `🔴 ${user} yazıyor...`;
});

socket.on("stopTyping", () => {
    typingDiv.textContent = "";
});

function addMessage(time, user, text) {
    const div = document.createElement("div");
    div.className = "message";

    div.innerHTML = `
        <span class="time">${time}</span>
        <span class="user">${user}</span>
        ${text}
    `;

    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}