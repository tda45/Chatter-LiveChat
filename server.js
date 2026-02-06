const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("chat.db");

// DB tablosunu oluştur
db.run(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user TEXT,
    text TEXT,
    time TEXT
  )
`);

app.use(express.static("public"));

io.on("connection", (socket) => {

  socket.on("join", (username) => {
    socket.username = username;

    // Mesaj geçmişini gönder
    db.all("SELECT * FROM messages ORDER BY id ASC", [], (err, rows) => {
      if (!err) socket.emit("chatHistory", rows);
    });

    // Kullanıcı katıldı mesajı
    const joinMsg = {
      user: "Chatter-LiveChat",
      text: `${username} katıldı`,
      time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
    };
    io.emit("message", joinMsg);
  });

  socket.on("chatMessage", (msg) => {
    if (!socket.username) return;

    const time = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    const data = { user: socket.username, text: msg, time };

    // Mesajı DB'ye ekle
    db.run("INSERT INTO messages (user, text, time) VALUES (?, ?, ?)", [data.user, data.text, data.time], (err) => {
      if (err) console.error(err);
    });

    // Mesajı yay
    io.emit("message", data);
  });
});

// Render free plan uyumlu port
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`✅ Chatter-LiveChat çalışıyor → http://localhost:${PORT}`);
});
