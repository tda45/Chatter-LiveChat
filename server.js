const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const users = {};
const lastMessage = {};

function time() {
    return new Date().toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit"
    });
}

io.on("connection", (socket) => {
    console.log("Bağlandı:", socket.id);

    // 🔥 Kullanıcı adı kontrol sistemi (BÜYÜK/KÜÇÜK HARF DUYARSIZ)
    socket.on("check_username", (username) => {

        if (!username) return;

        const cleanName = username.trim().toLowerCase();

        const nameExists = Object.values(users)
            .some(u => u.toLowerCase() === cleanName);

        if (nameExists) {
            socket.emit("username_taken");
        } else {
            users[socket.id] = username.trim(); // Orijinal hali saklanır

            socket.emit("join_success", username.trim());

            socket.broadcast.emit("system", {
                text: `${username.trim()} sohbete katıldı`,
                time: time()
            });
        }
    });

    socket.on("chat", (msg) => {
        const user = users[socket.id];
        if (!user) {
            socket.emit("system", {
                text: "⚠️ Önce kullanıcı adıyla giriş yapmalısın",
                time: time()
            });
            return;
        }

        const now = Date.now();
        if (lastMessage[socket.id] && now - lastMessage[socket.id] < 1500) {
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
                text: `${user} ayrıldı`,
                time: time()
            });
            delete users[socket.id];
        }
    });
});

server.listen(3000, () => {
    console.log("Server Yazışmayla Başlıyor → http://localhost:3000");
});