const cors = require("cors");
const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();


const indexRouter = require("./routers/index");
const diaryListRouter = require("./routers/diaryList");
const mypageRouter = require("./routers/mypage")

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
    cors({
      origin: '*',
      credentials: true,
      methods: ["GET", "POST", "OPTIONS"],
    })
  );
  const HTTP_PORT = process.env.HTTPS_PORT || 4000;

app.use(cookieParser());
app.use('/', indexRouter);
app.use('/diary-list', diaryListRouter);
app.use('/:users', mypageRouter);

app.listen(HTTP_PORT, () => {
    console.log(`listening on port ${HTTP_PORT}`);
})



  let server;
  server = app.listen(HTTP_PORT)