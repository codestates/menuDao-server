// server setting

require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");

const express = require("express");
const app = express();

const indexRouter = require("./routes/index");
const diaryRouter = require("./routes/diary");
const diaryListRouter = require("./routes/diaryList");

app.use(express.json());
app.use(express.urlencoded({ extended: false })); // 이중객체 처리를 위해.
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  })
);
app.use(cookieParser());

app.use("/", indexRouter);
app.use("/diary", diaryRouter);
app.use("/diary-list", diaryListRouter);

const HTTP_PORT = process.env.HTTP_PORT || 4000;

let server;

server = app.listen(HTTP_PORT);
module.exports = server;
