const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const users = {};
const lastMessage = {};

io.on("connection", (socket) => {

    socket.on("join", (username) => {
        users[socket.id] = username;

        io.emit("system", {
            text: `🔴 ${username} sohbete katıldı`,
            time: time()
        });
    });

    socket.on("typing", () => {
        const user = users[socket.id];
        if (user) socket.broadcast.emit("typing", user);
    });

    socket.on("stopTyping", () => {
        socket.broadcast.emit("stopTyping");
    });

    socket.on("chat", (msg) => {
        const user = users[socket.id];
        if (!user) return;

        const now = Date.now();
        if (lastMessage[socket.id] && now - lastMessage[socket.id] < 2000) {
            socket.emit("system", {
                text: "⚠️ Çok hızlı yazıyorsun",
                time: time()
            });
            return;
        }

        lastMessage[socket.id] = now;

        io.emit("chat", {
            user,
            text: msg,
            time: time()
        });
    });

    socket.on("disconnect", () => {
        const user = users[socket.id];
        if (user) {
            io.emit("system", {
                text: `🔴 ${user} sohbetten ayrıldı`,
                time: time()
            });
            delete users[socket.id];
        }
    });
});

function time() {
    return new Date().toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit"
    });
}

server.listen(10000, () => {
    console.log("✅ Chatter-LiveChat çalışıyor → http://localhost:10000");
});