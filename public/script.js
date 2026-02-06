const socket = io();

const chat = document.getElementById("chat");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

const usernameInput = document.getElementById("usernameInput");
const joinBtn = document.getElementById("joinBtn");
const inputBar = document.getElementById("inputBar");

let username = null;

/* 🔒 GİRİŞ */
joinBtn.onclick = () => {
    const name = usernameInput.value.trim();
    if (!name) {
        alert("Kullanıcı adı gir!");
        return;
    }

    username = name;

    chat.classList.remove("hidden");
    inputBar.classList.remove("hidden");
    usernameInput.disabled = true;
    joinBtn.disabled = true;
};

/* ❌ KULLANICI ADI YOKSA YAZAMAZ */
sendBtn.onclick = sendMessage;
messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

function sendMessage() {
    if (!username) return;

    const text = messageInput.value.trim();
    if (!text) return;

    socket.emit("chatMessage", {
        user: username,
        message: text
    });

    messageInput.value = "";
}

/* 📩 MESAJ AL */
socket.on("chatMessage", (data) => {
    if (!username) return;
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