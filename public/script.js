const socket = io();

const chat = document.getElementById("chat");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

let username = "Guest" + Math.floor(Math.random() * 9999);

sendBtn.onclick = sendMessage;
input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    socket.emit("chatMessage", {
        user: username,
        message: text
    });

    input.value = "";
}

socket.on("chatMessage", (data) => {
    renderMessage(data.user, data.message);
});

function renderMessage(user, text) {
    const msg = document.createElement("div");
    msg.className = "message";

    const isGif =
        text.endsWith(".gif") ||
        text.includes("tenor.com") ||
        text.includes("giphy.com");

    if (isGif) {
        msg.innerHTML = `
            <span class="user">${user}:</span><br>
            <img src="${text}" class="gif">
        `;
    } else {
        msg.innerHTML = `
            <span class="user">${user}:</span> ${text}
        `;
    }

    chat.appendChild(msg);
    msg.scrollIntoView();
}