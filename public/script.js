const socket = io();

const chat = document.getElementById("chat");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

const usernameInput = document.getElementById("usernameInput");
const joinBtn = document.getElementById("joinBtn");
const inputBar = document.getElementById("inputBar");

let username = null;

/* 🔒 JOIN */
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

    addSystemMessage(`👋 ${username} sohbete katıldı`);
};

/* ✉️ SEND */
sendBtn.onclick = sendMessage;
messageInput.addEventListener("keypress", e => {
    if (e.key === "Enter") sendMessage();
});

function sendMessage() {
    if (!username) return;

    let text = messageInput.value.trim();
    if (!text) return;

    /* 🎞️ /gif KOMUTU */
    if (text.startsWith("/gif ")) {
        const query = text.replace("/gif ", "").trim();
        if (!query) return;

        const gifUrl =
            `https://media.tenor.com/search?q=${encodeURIComponent(query)}&s=share`;

        socket.emit("chatMessage", {
            user: username,
            message: gifUrl
        });
    } else {
        socket.emit("chatMessage", {
            user: username,
            message: text
        });
    }

    messageInput.value = "";
}

/* 📩 RECEIVE */
socket.on("chatMessage", data => {
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
            <span class="user">${user}</span><br>
            <img src="${text}" class="gif">
        `;
    } else {
        msg.innerHTML = `
            <span class="user">${user}:</span> ${text}
        `;
    }

    chat.appendChild(msg);
    msg.scrollIntoView({ behavior: "smooth" });
}

function addSystemMessage(text) {
    const msg = document.createElement("div");
    msg.className = "message system";
    msg.textContent = text;
    chat.appendChild(msg);
}