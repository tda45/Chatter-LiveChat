const socket = io();

const chat = document.getElementById("chat");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

const usernameInput = document.getElementById("usernameInput");
const joinBtn = document.getElementById("joinBtn");
const inputBar = document.getElementById("inputBar");

const gifBox = document.getElementById("gifSuggestions");

let username = null;

/* ✅ JOIN FIX (Guest bug yok) */
joinBtn.onclick = () => {
    const name = usernameInput.value.trim();
    if (!name) return alert("Kullanıcı adı gir");

    username = name;

    chat.classList.remove("hidden");
    inputBar.classList.remove("hidden");

    usernameInput.disabled = true;
    joinBtn.disabled = true;

    addSystemMessage(`👋 ${username} sohbete katıldı`);
};

/* SEND */
sendBtn.onclick = sendMessage;
messageInput.addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
});

/* 🎞️ /gif AUTOCOMPLETE */
messageInput.addEventListener("input", () => {
    const text = messageInput.value;

    if (!text.startsWith("/gif ")) {
        gifBox.classList.add("hidden");
        return;
    }

    const query = text.slice(5).trim();
    if (query.length < 2) return;

    fetch(`https://api.giphy.com/v1/gifs/search?api_key=dc6zaTOxFJmzC&q=${encodeURIComponent(query)}&limit=6`)
        .then(r => r.json())
        .then(data => {
            gifBox.innerHTML = "";
            gifBox.classList.remove("hidden");

            data.data.forEach(gif => {
                const div = document.createElement("div");
                div.innerHTML = `
                    <img src="${gif.images.fixed_height_small.url}">
                    <span>${gif.title || "GIF"}</span>
                `;
                div.onclick = () => sendGif(gif.images.original.url);
                gifBox.appendChild(div);
            });
        });
});

function sendGif(url) {
    socket.emit("chatMessage", {
        type: "gif",
        user: username,
        message: url
    });

    gifBox.classList.add("hidden");
    messageInput.value = "";
}

/* TEXT + /me */
function sendMessage() {
    if (!username) return;

    const text = messageInput.value.trim();
    if (!text) return;

    if (text.startsWith("/me ")) {
        socket.emit("chatMessage", {
            type: "me",
            user: username,
            message: text.slice(4)
        });
    } else {
        socket.emit("chatMessage", {
            type: "text",
            user: username,
            message: text
        });
    }

    gifBox.classList.add("hidden");
    messageInput.value = "";
}

/* RECEIVE */
socket.on("chatMessage", data => {
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
        msg.innerHTML = `<span class="user">${data.user}:</span> ${data.message}`;
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