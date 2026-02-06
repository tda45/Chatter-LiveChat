const socket = io();

const chat = document.getElementById("chat");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

const usernameInput = document.getElementById("usernameInput");
const joinBtn = document.getElementById("joinBtn");
const inputBar = document.getElementById("inputBar");

let username = null;

/* ✅ KULLANICI GİRİŞ */
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

/* GÖNDER */
sendBtn.onclick = sendMessage;
messageInput.addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
});

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

    messageInput.value = "";
}

/* GELEN MESAJ */
socket.on("chatMessage", data => {
    const msg = document.createElement("div");
    msg.className = "message";

    if (data.type === "me") {
        msg.classList.add("me");
        msg.textContent = `* ${data.user} ${data.message}`;
    } else {
        msg.innerHTML = `<span class="user">${data.user}:</span> ${data.message}`;
    }

    chat.appendChild(msg);
    msg.scrollIntoView({ behavior: "smooth" });
});

function addSystemMessage(text) {
    const msg = document.createElement("div");
    msg.className = "message system";
    msg.textContent = text;
    chat.appendChild(msg);
}