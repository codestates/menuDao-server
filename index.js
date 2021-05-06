// server setting

require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mysql = require("mysql");
const express = require("express");
const app = express();

const indexRouter = require("./routes/index");
const diaryRouter = require("./routes/diary");
const diaryListRouter = require("./routes/diaryList");
const { NONE } = require("sequelize");

const options = {
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD, //RDS 비번 ,
  database: process.env.DATABASE_NAME,
  host: process.env.DATABASE_HOST,
  dialect: "mysql",
  port: 3306,
};

const conn = mysql.createConnection(options);
conn.connect();

app.use(express.json());
app.use(express.urlencoded({ extended: false })); // 이중객체 처리를 위해.
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  })
);
app.use(cookieParser());

app.use("/", indexRouter);
app.use("/diary", diaryRouter);
app.use("/diary-list", diaryListRouter);

const HTTP_PORT = process.env.HTTP_PORT || 80;

let server;

server = app.listen(HTTP_PORT, () => {
  console.log(`서버가 ${HTTP_PORT}번에서 작동중입니다.`);
});
module.exports = server;
