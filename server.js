require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

const { Token } = require("./utils/core");
const { Redis } = require("./utils/redis");
const { Migrator } = require("./migrations/migrator");
const { errorHandler, notFound } = require("./middleware/error-middleware");

const { userRoute } = require("./routes/user-route");
const { chatRoute } = require("./routes/chat-route");

// variables
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Main Function
const runServer = async () => {
  // DB Connection
  await mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("=> Success, MONGODB connected");
    })
    .then(() => {
      // Run Server
      server.listen(port, console.log(`=> Server is running at port ${port}`));
    })
    .catch((err) => console.error(`=> MONGODB connect error! ${err.message}`));
};
// Migrate Data
//   await Migrator.migrate();
// })
//   // Backup Data
//   await Migrator.backup();

// Run Server
runServer();

// Routes
app.use("/api/user", userRoute);
app.use("/api/chat", chatRoute);

app.use(notFound);
app.use(errorHandler);

// Socket.io Chatting
io.of("api/chat")
  .use(async (socket, next) => {
    try {
    let token = socket.handshake.query.token;
    if (!token) {
      next(new Error("Need authorization"));
      return;
    }
      let decoded = Token.verifyToken(token);
      let user = await Redis.get(decoded.id);
      if (!user) {
        next(new Error("Need to relogin"));
        return;
      }
      socket.userData = user;
      next();
    } catch (err) {
      const error = new Error(err.message);
      error.status = 401;
      return next(error);
    }
  })
  .on("connection", (socket) => {
    require("./chat/chat").initialize(io, socket);
  });
