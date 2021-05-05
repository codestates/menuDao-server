const { Diaries } = require("../../models");
const { Users } = require("../../models");
const jwt = require("jsonwebtoken");

module.exports = {
  diary_get: async (req, res) => {
    const { ACCESS_SECRET } = process.env;
    const { REFRESH_SECRET } = process.env;
    const authorization = req.headers.cookie;
    const splits = authorization.split(" ");
    const access = [];

    splits.map((el) => {
      if (el.includes("accessToken")) {
        access.push(el);
      }
    });
    const token = access[0].split("=")[1].slice(0, -1);
    const decoded = jwt.verify(token, ACCESS_SECRET, (err, decoded) => {
      if (err) {
        return undefined;
      } else return decoded;
    });

    if (!decoded) {
      return res.status(401).send({ message: "You do not have access rights" });
    } else {
      await Diaries.findOne({ where: { id: req.body.diary_id } })
        .then((result) =>
          Diaries.findOne({ where: { users_id: result.dataValues.id } }).then(
            (el) => {
              console.log(el.dataValues);
              res.status(201).send({
                message: "successfully diary posting",
                diarydata: el.dataValues,
              });
            }
          )
        )
        .catch((err) => {
          res.status(400).send({
            message: "Bad request",
            decoded: decoded,
          });
          console.error(err);
        });
    }
  },
  diary_post: async (req, res) => {
    const { ACCESS_SECRET } = process.env;
    const { REFRESH_SECRET } = process.env;
    const authorization = req.headers.cookie;
    const splits = authorization.split(" ");
    const access = [];

    splits.map((el) => {
      if (el.includes("accessToken")) {
        access.push(el);
      }
    });
    const token = access[0].split("=")[1].slice(0, -1);
    const decoded = jwt.verify(token, ACCESS_SECRET, (err, decoded) => {
      if (err) {
        return undefined;
      } else return decoded;
    });

    if (!decoded) {
      return res.status(401).send({ message: "You do not have access rights" });
    } else {
      await Users.findOne({ where: { user_id: decoded.userdata.user_id } })
        // .then(result =>{
        //   res.send("응안돼")
        // })
        .then((result) =>
          Diaries.create({
            users_id: result.dataValues.id,
            comment: "입력해주세요",
            date: new Date(),
            weather: req.body.weather,
            feeling: req.body.feeling,
            choice_menu: req.body.choice_menu,
            big_choice_menu: req.body.big_choice_menu,
          }).then(
            res.status(201).send({
              message: "successfully diary posting",
            })
          )
        )
        .catch((err) => {
          res.status(400).send({
            message: "Bad request",
            decoded: decoded,
          });
          // console.error(err);
        });
    }
  },
  diary_patch: async (req, res) => {
    const { ACCESS_SECRET } = process.env;
    const { REFRESH_SECRET } = process.env;
    const authorization = req.headers.cookie;
    const splits = authorization.split(" ");
    const access = [];

    splits.map((el) => {
      if (el.includes("accessToken")) {
        access.push(el);
      }
    });
    const token = access[0].split("=")[1].slice(0, -1);
    const decoded = jwt.verify(token, ACCESS_SECRET, (err, decoded) => {
      if (err) {
        return undefined;
      } else return decoded;
    });

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
          res.status(400).send({
            message: "Bad request",
            decoded: decoded,
          });
          console.error(err);
        });
    }
  },
};
