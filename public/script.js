const socket = io(window.location.origin);

const usernameInput = document.getElementById("username");
const joinBtn = document.getElementById("joinBtn");

const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");

const chat = document.getElementById("chat");
const typingDiv = document.getElementById("typing");

let username = null;
let typingTimer = null;

joinBtn.onclick = () => {
    const name = usernameInput.value.trim();
    if (!name) return alert("Kullanıcı adı gir!");

    username = name;
    socket.emit("join", username);

    document.querySelector(".top-bar").classList.add("hidden");
    document.querySelector(".input-bar").classList.remove("hidden");
};

sendBtn.onclick = sendMessage;

messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
});

messageInput.addEventListener("input", () => {
    socket.emit("typing");

    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
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

socket.on("typing", (user) => {
    typingDiv.textContent = `🔴 ${user} yazıyor...`;
});

socket.on("stopTyping", () => {
    typingDiv.textContent = "";
});