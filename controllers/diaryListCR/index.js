const { Diaries } = require("../../models");
const { Users } = require("../../models");
const jwt = require("jsonwebtoken");

module.exports = {
  diary_list_get: async (req, res) => {
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
        .then((result) =>
          Diaries.findAll({
            where: { users_id: result.dataValues.id },
          }).then((datas) => {
            const diaries = [];
            datas.map((el) => {
              // console.log(el.dataValues);
              diaries.push(el.dataValues);
            });
            res.status(201).send({
              diaries: diaries,
              message: "successfully get Diaries-list",
            });
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

  diary_list_delete: async (req, res) => {
    const { ACCESS_SECRET } = process.env;
    const authorization = req.headers.cookie;
    // console.log(authorization);
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
      Diaries.destroy({ where: { id: req.body.diary_id } })
        .then((el) => {
          res.status(201).send({
            message: "successfully delete diary list",
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  },
};
