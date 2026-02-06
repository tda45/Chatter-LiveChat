const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
    console.log("🟢 Kullanıcı bağlandı");

    socket.on("chatMessage", (data) => {
        io.emit("chatMessage", data);
    });

    socket.on("disconnect", () => {
        console.log("🔴 Kullanıcı ayrıldı");
    });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log("✅ Chatter-LiveChat çalışıyor → http://localhost:" + PORT);
});