const express = require("express");
const app = express();
const http = require("http").createServer(app);

const io = require("socket.io")(http);
const Database = require("better-sqlite3");
const db = new Database("chat.db");

db.prepare(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user TEXT,
        text TEXT,
        time TEXT
    )
`).run();

app.use(express.static("public"));

io.on("connection", (socket) => {

    socket.on("join", (username) => {
        socket.username = username;

        socket.emit(
            "chatHistory",
            db.prepare("SELECT * FROM messages ORDER BY id ASC").all()
        );

        io.emit("message", {
            user: "Chatter-LiveChat",
            text: `${username} katıldı`,
            time: new Date().toLocaleTimeString("tr-TR", {
                hour: "2-digit",
                minute: "2-digit"
            })
        });
    });

    socket.on("chatMessage", (msg) => {
        if (!socket.username) return;

        const time = new Date().toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit"
        });

        db.prepare(
            "INSERT INTO messages (user, text, time) VALUES (?, ?, ?)"
        ).run(socket.username, msg, time);

        io.emit("message", {
            user: socket.username,
            text: msg,
            time
        });
    });
});

http.listen(3000, () => {
    console.log("✅ Chatter-LiveChat (stable) → http://localhost:3000");
});