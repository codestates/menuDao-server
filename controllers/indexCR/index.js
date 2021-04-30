// user가 로그인, 회원가입, 마이페이지 접속을 할때 필요한 데이터들이 담겨져있는 모델
const { Users } = require("../../models");
// 다른메뉴를 추천해주라는 요청이 있을때 response해줘야하는 데이틀이 담겨있는 모델
const { Food } = require("../../models/food");
const jwt = require("jsonwebtoken");

module.exports = {
  // login

  signin: async (req, res) => {
    const userInfo = await Users.findOne({
      where: { user_id: req.body.user_id, user_password: req.body.password },
      attributes: ["user_id", "user_birthday", "user_sex", "user_id"],
    });
    if (!userInfo) {
      res.status(401).send({ message: "Invalid user or Wrong password" });
    } else {
      const { ACCESS_SECRET } = process.env;
      // const { REFRESH_SECRET } = process.env;
      const accessToken = jwt.sign(userInfo.dataValues, ACCESS_SECRET, {
        expiresIn: "1 days",
      });
      /*       const refreshToken = jwt.sign(userInfo.dataValues, REFRESH_SECRET, {
        expiresIn: "7 days",
      });
      res.cookie("refreshToken", refreshToken); */
      res.status(200).send({ accessToken: accessToken });
    }
  },

  signup: async (req, res) => {
    const userInfo = await Users.findOne({
      where: { user_id: req.body.user_id },
      attributes: ["user_id", "user_name", "user_birthday", "user_sex"],
    });

    if (userInfo) {
      res.status(409).send({ message: "This user_id is exists" });
    } else {
      Users.create({
        user_id: req.body.user_id,
        user_password: req.body.user_password,
        user_name: req.body.user_name,
        user_sex: req.body.user_sex,
        user_birthday: req.body.user_birthday,
      })
        .then((result) => {
          res.status(201).send({
            userInfo: result,
            message: "succesfully created your id",
          });
        })
        .catch((err) => {
          console.error(err);
        });
    }
  },

  signout: (req, res) => {},

  menu_choice_post: (req, res) => {},

  menu_choice_patch: (req, res) => {},

  mypage: (req, res) => {
    // 엑세스 토큰을 헤더에 담아서 넘겨줌.
    const accessToken = req.headers["accessToken"];
    if (!accessToken) {
      res.status(400).send({ message: "You do not have access rights" });
    } else {
      // barer 랑 토큰 분리
      const token = accessToken.split(" ")[1];
      // 분리된 개별 토큰을 복호화
      const data = jwt.verify(token, ACCESS_SECRET, (err, decoded) => {
        // 복호화에 실패했을 경우
        if (err) {
          return res
            .status(400)
            .send({ message: "You do not have access rights" });
        } else {
          res.status(201).send({
            message: "successfully get user infomation",
            user_name: data.user_name,
            user_birthday: data.user_birthday,
            user_sex: data.user_sex,
            user_id: data.user_id,
          });
        }
      });
    }
  },
};
