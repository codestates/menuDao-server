const { Diary } = require("../../models");
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
      return res.status(400).send({ message: "You do not have access rights" });
    } else {
      // diary_id = PK
      await Diary.findOne({ where: { id: req.body.diary_id } })
        .then((result) =>
          res.status(201).send({
            message: "succesfully get user diary",
            diarydata: result.userdata,
          })
        )
        .then(() => {
          res.status(201).send({
            message: "successfully diary posting",
          });
        })
        .catch((err) => {
          res.status(400).send({
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
      await res.status(400).send({ message: "You do not have access rights" });
    } else {
      await Users.findOne({ where: { user_id: decoded.userdata.user_id } })
        .then((result) =>
          Diary.create({
            users_id: result.dataValues.id,
            comment: "내용을 입력해주세요",
            data: req.body.data,
            weather: req.body.weather,
            feeling_name: req.body.feeling,
            big_choice_menu: req.body.big_choice_menu,
          })
        )
        .then(() => {
          res.status(201).send({
            message: "successfully diary posting",
          });
        })
        .catch((err) => {
          res.status(400).send({
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
      return res.status(400).send({ message: "You do not have access rights" });
    } else {
      await Diary.findOne({ where: { id: req.body.diary_id } })
        .then((result) => result.update({ comment: req.body.comment }))
        .then(() => {
          res.status(201).send({
            message: "succesfully update diary",
          });
        })
        .catch((err) => {
          res.status(400).send({
            message: "You do not have access rights",
            decoded: decoded,
          });
          console.error(err);
        });
    }
  },
};
