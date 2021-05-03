// user가 로그인, 회원가입, 마이페이지 접속을 할때 필요한 데이터들이 담겨져있는 모델
const { Users } = require("../../models");
// 다른메뉴를 추천해주라는 요청이 있을때 response해줘야하는 데이틀이 담겨있는 모델
const { Food } = require("../../models/food");
const jwt = require("jsonwebtoken");

module.exports = {
  // login

  signin: async (req, res) => {
    const userInfo = await user.findOne({
      where: { user_id: req.body.id, user_password: req.body.password },
      attributes: ["id", "user_birthday", "user_sex", "user_img", "user_id"],
    });
    if (!userInfo) {
      res.status(401).send({ message: "Invalid user or Wrong password" });
    } else {
      const { ACCESS_SECRET } = process.env;
      const { REFRESH_SECRET } = process.env;
      const accessToken = jwt.sign(userInfo.dataValues, ACCESS_SECRET, {
        expiresIn: "30s",
      });
      const refreshToken = jwt.sign(userInfo.dataValues, REFRESH_SECRET, {
        expiresIn: "7 days",
      });
      res.cookie("refreshToken", refreshToken);
      res.status(200).send({ accessToken: accessToken });
    }
  },

  signup: (req, res) => {},

  signout: (req, res) => {},

  menu_choice_post: (req, res) => {},

  menu_choice_patch: (req, res) => {},

  mypage: (req, res) => {},
};
