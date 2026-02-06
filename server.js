const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let messages = []; // RAM tabanlı mesajlar

io.on("connection", (socket) => {

  socket.on("join", (username) => {
    socket.username = username;

    // Mesaj geçmişini gönder
    socket.emit("chatHistory", messages);

    // Katılma mesajı
    io.emit("message", {
      user: "Chatter-LiveChat",
      text: `${username} katıldı`,
      time: new Date().toLocaleTimeString("tr-TR", { hour:"2-digit", minute:"2-digit" })
    });
  });

  socket.on("chatMessage", (msg) => {
    if (!socket.username) return;

    const data = {
      user: socket.username,
      text: msg,
      time: new Date().toLocaleTimeString("tr-TR", { hour:"2-digit", minute:"2-digit" })
    };

    messages.push(data); // RAM’de sakla
    io.emit("message", data);
  });
});

// Render free plan uyumlu port
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`✅ Chatter-LiveChat çalışıyor → http://localhost:${PORT}`);
});