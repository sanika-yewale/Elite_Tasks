const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const Document = require("./models/Document");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

mongoose
  .connect(
    "mongodb://yewalesanika66:harshusanu@ac-xtdbcjt-shard-00-00.u0fotsn.mongodb.net:27017,ac-xtdbcjt-shard-00-01.u0fotsn.mongodb.net:27017,ac-xtdbcjt-shard-00-02.u0fotsn.mongodb.net:27017/?ssl=true&replicaSet=atlas-xiv05c-shard-0&authSource=admin&appName=Cluster0"
  )
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const defaultValue = "";

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("get-document", async (documentId) => {
    const document = await findOrCreateDocument(documentId);

    socket.join(documentId);

    socket.documentId = documentId;

    socket.emit("load-document", document.data);
  });

  socket.on("send-changes", (delta) => {
    if (!socket.documentId) return;

    socket.broadcast
      .to(socket.documentId)
      .emit("receive-changes", delta);
  });

  socket.on("save-document", async (data) => {
    if (!socket.documentId) return;

    await Document.findByIdAndUpdate(
      socket.documentId,
      { data }
    );
  });
});

async function findOrCreateDocument(id) {
  if (id == null) return;

  const document = await Document.findById(id);

  if (document) return document;

  return await Document.create({
    _id: id,
    data: defaultValue,
  });
}

server.listen(3001, () => {
  console.log("Server running on port 3001");
});