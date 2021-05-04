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
        // console.log(result);
        const accessToken = jwt.sign(
          {
            userdata: result.dataValues,
          },
          ACCESS_SECRET,
          {
            expiresIn: "15 m",
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

        res
          .status(200)
          .cookie("accessToken", accessToken, {
            maxAge: 1000 * 60 * 60, // 15분 간유지
            httpOnly: true,
          })
          .send({ message: "successfully sign in" });
      })
      .catch((err) => {
        res.status(401).send({ message: "Invalid user or Wrong password" });
        console.error(err);
      });
  },

  signup: async (req, res) => {
    const userInfo = await Users.findOne({
      where: { user_id: req.body.user_id },
      // attributes: ["user_id", "user_name", "user_birthday", "user_sex"],
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

  signout: (req, res) => {
    const { ACCESS_SECRET } = process.env;
    const authorization = req.headers.cookie;
    const token = authorization.split("=")[1];
    const accessToken = jwt.sign(
      {
        userdata: "data",
      },
      ACCESS_SECRET,
      {
        expiresIn: "1s",
      }
    );
    const decoded = jwt.verify(token, ACCESS_SECRET, (err, decoded) => {
      if (err) {
        return undefined;
      } else return decoded;
    });

    if (!decoded) {
      res.status(400).send({ message: "You do not have access rights" });
    } else {
      res
        .status(201)
        .cookie("accessToken", accessToken, {
          maxAge: 0, // 15분 간유지
          httpOnly: true,
        })
        .send({ message: "successfully signed out" });
    }
  },

  mypage_get: async (req, res) => {
    const { ACCESS_SECRET } = process.env;
    const { REFRESH_SECRET } = process.env;
    const authorization = req.headers.cookie;
    const token = authorization.split("=")[1];
    const decoded = jwt.verify(token, ACCESS_SECRET, (err, decoded) => {
      if (err) {
        return undefined;
      }
      return decoded;
    });

    if (!decoded) {
      return res.status(401).send({ message: "You do not have access rights" });
    } else {
      await Users.findOne({ where: { user_id: decoded.userdata.user_id } })
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
            message: "Bad request",
            decoded: decoded,
          });
          console.error(err);
        });
    }
  },
  // 비밀번호 변경 구현 완료
  mypage_patch: async (req, res) => {
    const { ACCESS_SECRET } = process.env;
    const { REFRESH_SECRET } = process.env;
    const authorization = req.headers.cookie;
    const token = authorization.split("=")[1];
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
          result.update({ user_password: req.body.user_password })
        )
        .then(() => {
          res.status(201).send({
            message: "successfully update user infomation",
          });
        })
        .catch((err) => {
          res.status(400).send({
            message: "Bad request",
            decoded: decoded,
          });
          console.error(err);
        });
    }
  },

  menu_choice_post: async (req, res) => {
    const { ACCESS_SECRET } = process.env;
  },
  // 대분류, 날씨, 기분에 따른 112개의 조건문 분기
};
