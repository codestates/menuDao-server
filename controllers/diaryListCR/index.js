const { Diary } = require("../../models");
const { Users } = require("../../models");
const jwt = require("jsonwebtoken");

module.exports = {
  diary_list_get: async (req, res) => {
    const { ACCESS_SECRET } = process.env;
    const { REFRESH_SECRET } = process.env;
    const authorization = req.headers["authorization"];
    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, ACCESS_SECRET);
    if (!decoded) {
      return res.status(400).send({ message: "You do not have access rights" });
    } else {
      await Users.findOne({ where: { user_id: decoded.userdata.user_id } })
        .then((result) =>
          Diary.findAll({
            where: { users_id: result.userdata.id },
          }).then((datas) => {
            console.log;
          })
        )
        .then(() => {
          res.status(201).send({
            message: "successfully update user infomation",
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

  diary_list_delete: (req, res) => {},
};
