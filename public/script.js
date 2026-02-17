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

// Hata mesajı alanı oluştur
let nameError = document.createElement("div");
nameError.style.color = "red";
nameError.style.marginTop = "8px";
usernameInput.parentNode.appendChild(nameError);

joinBtn.onclick = () => {
    const name = usernameInput.value.trim();
    if (!name) {
        nameError.textContent = "Kullanıcı adı gir";
        return;
    }

    socket.emit("check_username", name);
};

socket.on("username_taken", () => {
    nameError.textContent = "Bu İsim Zaten Kullanımda Başka Bir Kullanıcı Adı Gir...";
});

socket.on("join_success", (name) => {
    username = name;
    currentUser.textContent = username;
    nameError.textContent = "";

    loginScreen.classList.add("hidden");
    chatScreen.classList.remove("hidden");

    messageInput.focus();
});

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