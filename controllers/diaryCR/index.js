<<<<<<< HEAD
const { Diary } = require("../../models");
=======
const { Diaries } = require("../../models");
>>>>>>> 4cdc9b96d519251d0bdab28b01eb74da35820665
const { Users } = require("../../models");
const jwt = require("jsonwebtoken");

module.exports = {
  diary_get: async (req, res) => {
    const { ACCESS_SECRET } = process.env;
    const { REFRESH_SECRET } = process.env;
    const authorization = req.headers["authorization"];
    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, ACCESS_SECRET);

    if (!decoded) {
      return res.status(401).send({ message: "You do not have access rights" });
    } else {
      await Diaries.findOne({ where: { id: req.body.diary_id } })
        .then((result) =>
          res.status(201).send({
            message: "succesfully get user diary",
            diarydata: result.userdata,
          })
        )
        .catch((err) => {
          res.status(401).send({
            message: "You do not have access rights",
            decoded: decoded,
          });
          console.error(err);
        });
    }
  },

  diary_post: async (req, res) => {
    const { ACCESS_SECRET } = process.env;
    const { REFRESH_SECRET } = process.env;
    const authorization = req.headers["authorization"];
    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, ACCESS_SECRET);

    if (!decoded) {
      return res.status(401).send({ message: "You do not have access rights" });
    } else {
      await Users.findOne({ where: { user_id: decoded.userdata.user_id } })
        // .then(result =>{
        //   res.send("응안돼")
        // })
        .then((result) =>
          Diaries.create({
            // users_id: result.dataValues.id,
            comment: "내용을 입력해주세요.",
            date: req.body.date,
            weather: req.body.weather,
            feeling: req.body.feeling,
            choice_menu: req.body.big_choice_menu,
          }).then(
            res.status(201).send({
              message: "successfully diary posting",
            })
          )
        )
        .catch((err) => {
          res.status(401).send({
            message: "You do not have access rights",
            decoded: decoded,
          });
          console.error(err);
        });
    }
  },

  diary_patch: async (req, res) => {
    const { ACCESS_SECRET } = process.env;
    const { REFRESH_SECRET } = process.env;
    const authorization = req.headers["authorization"];
    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, ACCESS_SECRET);

    if (!decoded) {
      return res.status(401).send({ message: "You do not have access rights" });
    } else {
      await Diaries.findOne({ where: { id: req.body.diary_id } })
        .then((result) => result.update({ comment: req.body.comment }))
        .then(
          res.status(201).send({
            message: "succesfully update diary",
          })
        )
        .catch((err) => {
          res.status(401).send({
            message: "You do not have access rights",
            decoded: decoded,
          });
          console.error(err);
        });
    }
  },
};
