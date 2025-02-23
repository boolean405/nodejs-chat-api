require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

const { Token } = require("./utils/core");
const { Redis } = require("./utils/redis");

const { Migrator } = require("./migrations/migrator");
const { userRoute } = require("./routes/user-route");

// variables
const port = process.env.PORT || 3000;
// Middleware
app.use(express.json());

// Main Function
const runServer = async () => {
  // DB Connection
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("=> Success, MONGODB connected");
    })
    .then(() => {
      // Run Server
      server.listen(port, console.log(`=> Server is running at port ${port}`));
    })
    // .then(async () => {
    //   // Migrate Data
    //   await Migrator.migrate();
    // })
    // .then(async () => {
    //   // Backup Data
    //   await Migrator.backup();
    // })
    .catch((err) => console.error(`=> MONGODB connect error! ${err.message}`));
};

// Run Server
runServer();

// Routes
app.use("/api/users", userRoute);



// Error Handling
app.use((err, req, res, next) => {
  // console.error(err.stack)
  err.status = err.status || 500;
  res.status(err.status).json({ con: false, msg: err.message });
});

// // Socket.io Chatting
// io.of("api/chat")
//   .use(async (socket, next) => {
//     let token = socket.handshake.query.token;
//     console.log(token);

//     if (!token) {
//       next(new Error("Need Authorization"));
//       return;
//     }

//     let decoded = Token.verifyToken(token);
//     console.log(decoded);

//     if (
//       decoded === "invalid token" ||
//       decoded === "invalid signature" ||
//       decoded === "jwt malformed"
//     ) {
//       next(new Error("Invalid authorization token"));
//       return;
//     }

//     if (decoded === "jwt expired") {
//       next(new Error("Authorization token expired"));
//       return;
//     }

// let user = await Redis.get(decoded.id);

//     if (!user) {
//       next(new Error("Need to relogin"));
//       return;
//     }

//     socket.userData = user;
//     next();
//   })
//   .on("connection", (socket) => {
//     require("./chat/chat").initialize(io, socket);
//   });
