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

    addSystemMessage(`👋 ${username} sohbete katıldı`);
};

/* ✉️ MESAJ GÖNDER */
sendBtn.onclick = sendMessage;
messageInput.addEventListener("keypress", e => {
    if (e.key === "Enter") sendMessage();
});

function sendMessage() {
    if (!username) return;

    let text = messageInput.value.trim();
    if (!text) return;

    /* 🎭 /me KOMUTU */
    if (text.startsWith("/me ")) {
        const action = text.replace("/me ", "").trim();
        if (!action) return;

        socket.emit("chatMessage", {
            type: "me",
            user: username,
            message: action
        });

        messageInput.value = "";
        return;
    }

    /* 🎞️ /gif KOMUTU */
    if (text.startsWith("/gif ")) {
        const query = text.replace("/gif ", "").trim();
        if (!query) return;

        const gifUrl =
            `https://media.tenor.com/search?q=${encodeURIComponent(query)}&s=share`;

        socket.emit("chatMessage", {
            type: "gif",
            user: username,
            message: gifUrl
        });

        messageInput.value = "";
        return;
    }

    /* 💬 NORMAL MESAJ */
    socket.emit("chatMessage", {
        type: "text",
        user: username,
        message: text
    });

    messageInput.value = "";
}

/* 📩 MESAJ AL */
socket.on("chatMessage", data => {
    if (!username) return;
    renderMessage(data);
});

function renderMessage(data) {
    const msg = document.createElement("div");
    msg.className = "message";

    /* 🎭 /me GÖRÜNÜMÜ */
    if (data.type === "me") {
        msg.classList.add("me");
        msg.textContent = `* ${data.user} ${data.message}`;
        chat.appendChild(msg);
        msg.scrollIntoView({ behavior: "smooth" });
        return;
    }

    /* 🎞️ GIF */
    if (data.type === "gif") {
        msg.innerHTML = `
            <span class="user">${data.user}</span><br>
            <img src="${data.message}" class="gif">
        `;
        chat.appendChild(msg);
        msg.scrollIntoView({ behavior: "smooth" });
        return;
    }

    /* 💬 NORMAL */
    msg.innerHTML = `
        <span class="user">${data.user}:</span> ${data.message}
    `;
    chat.appendChild(msg);
    msg.scrollIntoView({ behavior: "smooth" });
}

/* ℹ️ SYSTEM */
function addSystemMessage(text) {
    const msg = document.createElement("div");
    msg.className = "message system";
    msg.textContent = text;
    chat.appendChild(msg);
}