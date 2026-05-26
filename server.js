const express = require("express");
const path = require("path");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Serve index.html for SPA routing
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const globalLeaderboard = [];

io.on("connection", (socket) => {
  console.log("🟢 Khách kết nối:", socket.id);
  socket.isStuck = false;
  socket.finalScore = 0;
  socket.wantsRematch = false;

  socket.on("create_room", () => {
    const roomId = Math.floor(1000 + Math.random() * 9000).toString();
    socket.join(roomId);
    socket.roomId = roomId;
    socket.emit("room_created", roomId);
  });

  socket.on("join_room", (roomId) => {
    const room = io.sockets.adapter.rooms.get(roomId);
    if (!room) {
      socket.emit("room_error", "Mã phòng không tồn tại!");
      return;
    }
    if (room.size >= 2) {
      socket.emit("room_error", "Phòng này đã đầy đối thủ!");
      return;
    }

    socket.join(roomId);
    socket.roomId = roomId;
    io.to(roomId).emit("match_start", roomId);
  });

  socket.on("update_state", (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit("opponent_state_updated", data);
    }
  });

  socket.on("player_stuck", (score) => {
    socket.isStuck = true;
    socket.finalScore = score;

    if (socket.roomId) {
      socket.to(socket.roomId).emit("opponent_stuck_notice");
      const room = io.sockets.adapter.rooms.get(socket.roomId);
      if (room) {
        let allStuck = true;
        let players = [];
        for (const clientId of room) {
          const clientSocket = io.sockets.sockets.get(clientId);
          if (clientSocket) {
            players.push(clientSocket);
            if (!clientSocket.isStuck) allStuck = false;
          }
        }
        if (allStuck && players.length === 2) {
          const p1 = players[0];
          const p2 = players[1];
          if (p1.finalScore > p2.finalScore) {
            p1.emit("match_result", { result: "win" });
            p2.emit("match_result", { result: "lose" });
          } else if (p1.finalScore < p2.finalScore) {
            p1.emit("match_result", { result: "lose" });
            p2.emit("match_result", { result: "win" });
          } else {
            io.to(socket.roomId).emit("match_result", { result: "draw" });
          }
        }
      }
    }
  });

  socket.on("play_again", () => {
    socket.wantsRematch = true;
    if (socket.roomId) {
      socket.to(socket.roomId).emit("opponent_wants_rematch");
      const room = io.sockets.adapter.rooms.get(socket.roomId);
      if (room) {
        let allReady = true;
        let players = [];
        for (const clientId of room) {
          const clientSocket = io.sockets.sockets.get(clientId);
          if (clientSocket) {
            players.push(clientSocket);
            if (!clientSocket.wantsRematch) allReady = false;
          }
        }
        if (allReady && players.length === 2) {
          players.forEach((p) => {
            p.isStuck = false;
            p.finalScore = 0;
            p.wantsRematch = false;
          });
          io.to(socket.roomId).emit("reset_game");
        }
      }
    }
  });

  socket.on("add_score", (data) => {
    const { playerName, score } = data;
    globalLeaderboard.push({ name: playerName, score: score });
    globalLeaderboard.sort((a, b) => b.score - a.score);
    if (globalLeaderboard.length > 10) {
      globalLeaderboard.pop();
    }
    io.emit("leaderboard_updated", globalLeaderboard);
  });

  socket.on("get_leaderboard", () => {
    socket.emit("leaderboard_data", globalLeaderboard);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Khách thoát:", socket.id);
    if (socket.roomId) {
      socket.to(socket.roomId).emit("opponent_left");
    }
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () =>
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`),
);
