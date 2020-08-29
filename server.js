const express = require("express");
const morgan = require("morgan");
const path = require("path");
const mongo = require("mongodb").MongoClient;
const app = express();
app.use(morgan("combined"));
const http = require("http").Server(app);
const client = require("socket.io")(http);

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/public/:filename", function (req, res) {
  res.sendFile(path.join(__dirname, "public", req.params.filename));
});

mongo.connect(
  `mongodb+srv://melving:${process.env.mongoPassword}@nodechat.qemw6.mongodb.net/chat?retryWrites=true&w=majority`,
  function (err, db) {
    if (err) throw err;

    client.on("connection", function (socket) {
      const coll = db.collection("messages");
      const sendStatus = function (s) {
        socket.emit("status", s);
      };
      //emit all messages
      coll
        .find()
        .limit(100)
        .sort({ _id: 1 })
        .toArray(function (err, res) {
          if (err) throw err;
          socket.emit("output", res);
        });
      socket.on("chat", function (data) {
        const name = data.name;
        const message = data.message;
        const nothing = /^\s*$/;

        if (nothing.test(name) || nothing.test(message)) {
          sendStatus(" Name And message is required !");
        } else {
          coll.insert({ name: name, message: message }, function () {
            client.emit("output", [data]);
            sendStatus({ message: " Message Sent !", clear: true });
          });
        }
      });

      console.log("Someone has connected !");
    });
  }
);
// Use 8080 for local development because you might already have apache running on 80
http.listen(process.env.PORT, function () {
  console.log("node server started !");
});
