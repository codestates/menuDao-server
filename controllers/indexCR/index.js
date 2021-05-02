// user가 로그인, 회원가입, 마이페이지 접속을 할때 필요한 데이터들이 담겨져있는 모델
const { Users } = require("../../models");
// 다른메뉴를 추천해주라는 요청이 있을때 response해줘야하는 데이틀이 담겨있는 모델
const { Food } = require("../../models/food");
const jwt = require("jsonwebtoken");

module.exports = {
  // login

  signin: async (req, res) => {
    await Users.findOne({
      where: {
        user_id: req.body.user_id,
        user_password: req.body.user_password,
      },
    })
      .then((result) => {
        const { ACCESS_SECRET } = process.env;
        const { REFRESH_SECRET } = process.env;
        const accessToken = jwt.sign(
          {
            userdata: result.dataValues,
          },
          ACCESS_SECRET,
          {
            expiresIn: "1 days",
          }
        );
        const refreshToken = jwt.sign(
          {
            userdata: result.dataValues,
          },
          REFRESH_SECRET,
          {
            expiresIn: "7 days",
          }
        );

        result.refreshToken = refreshToken;
        res
          .cookie("refreshToken", result.refreshToken, {
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7일간 유지
            httpOnly: true,
          })
          .status(200)
          .send({ accessToken: accessToken });
      })
      .catch((err) => {
        res.status(401).send({ message: "Invalid user or Wrong password" });
        console.error(err);
      });
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
        // user_refreshToken: null,
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
    const { ACCESS_SECRET } = process.env;
    const { REFRESH_SECRET } = process.env;
    const authorization = req.headers["authorization"];
    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, ACCESS_SECRET);

    if (!decoded) {
      return res.status(400).send({ message: "You do not have access rights" });
    } else {
      Users.findOne({ where: { user_id: decoded.userdata.user_id } })
        .then((result) =>
          res.status(201).send({
            message: "successfully get user infomation",
            user_name: result.user_name,
            user_birthday: result.user_birthday,
            user_sex: result.user_sex,
            user_id: result.user_id,
          })
        )
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
