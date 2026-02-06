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

    /* 🎭 /me */
    if (text.startsWith("/me ")) {
        const action = text.slice(4).trim();
        if (!action) return;

        socket.emit("chatMessage", {
            type: "me",
            user: username,
            message: action
        });

        messageInput.value = "";
        return;
    }

    /* 🎞️ /gif — DÜZELTİLDİ */
    if (text.startsWith("/gif ")) {
        const query = text.slice(5).trim();
        if (!query) return;

        fetch(`https://api.giphy.com/v1/gifs/translate?api_key=dc6zaTOxFJmzC&s=${encodeURIComponent(query)}`)
            .then(res => res.json())
            .then(data => {
                const gifUrl = data?.data?.images?.original?.url;
                if (!gifUrl) return;

                socket.emit("chatMessage", {
                    type: "gif",
                    user: username,
                    message: gifUrl
                });
            });

        messageInput.value = "";
        return;
    }

    /* 💬 NORMAL */
    socket.emit("chatMessage", {
        type: "text",
        user: username,
        message: text
    });

    messageInput.value = "";
}

/* 📩 RECEIVE */
socket.on("chatMessage", data => {
    if (!username) return;
    renderMessage(data);
});

function renderMessage(data) {
    const msg = document.createElement("div");
    msg.className = "message";

    if (data.type === "me") {
        msg.classList.add("me");
        msg.textContent = `* ${data.user} ${data.message}`;
    }
    else if (data.type === "gif") {
        msg.innerHTML = `
            <span class="user">${data.user}</span><br>
            <img src="${data.message}" class="gif">
        `;
    }
    else {
        msg.innerHTML = `
            <span class="user">${data.user}:</span> ${data.message}
        `;
    }

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