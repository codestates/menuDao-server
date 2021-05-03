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
      return res.status(401).send({ message: "You do not have access rights" });
    } else {
      await Users.findOne({ where: { user_id: decoded.userdata.user_id } })
        .then(
          (result) =>
            Diary.findAll({
              where: { users_id: result.userdata.id },
            }).then((datas) => {
              console.log(datas);
            })
          //   res.status(201).send({
          //     message: "successfully get user infomation",
          //     user_name: result.user_name,
          //     user_birthday: result.user_birthday,
          //     user_sex: result.user_sex,
          //     user_id: result.user_id,
          //   })
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

  diary_list_delete: async (req, res) => {
    const { ACCESS_SECRET } = process.env;
    const { REFRESH_SECRET } = process.env;
  },
};
