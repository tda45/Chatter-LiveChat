const socket = io();

const loginScreen = document.getElementById("loginScreen");
const chatScreen = document.getElementById("chatScreen");

const usernameInput = document.getElementById("username");
const joinBtn = document.getElementById("joinBtn");

const chat = document.getElementById("chat");
const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");

const currentUser = document.getElementById("currentUser");

let username = null;

joinBtn.onclick = () => {
    const name = usernameInput.value.trim();
    if (!name) {
        alert("Kullanıcı adı gir");
        return;
    }

    username = name;
    currentUser.textContent = username;

    socket.emit("join", username);

    loginScreen.classList.add("hidden");
    chatScreen.classList.remove("hidden");

    messageInput.focus();
};

sendBtn.onclick = sendMessage;

messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
});

function sendMessage() {
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