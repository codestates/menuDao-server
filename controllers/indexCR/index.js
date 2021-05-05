// user가 로그인, 회원가입, 마이페이지 접속을 할때 필요한 데이터들이 담겨져있는 모델
const { Users } = require("../../models");
// 다른메뉴를 추천해주라는 요청이 있을때 response해줘야하는 데이틀이 담겨있는 모델
// const { Food_lists } = require("../../models");
// const { Food_menu } = require("../../models");
const { Food } = require("../../models");
// const { Diaries } = require("../../models");

const jwt = require("jsonwebtoken");
const Sequelize = require("sequelize");

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

        // var token = jwt.sign({ sub: ‘sjk5766’, exp: Math.floor(Date.now() / 1000) + 60 }, ‘secret_key’);
        // const refreshToken = jwt.sign(
        //   {
        //     userdata: result.dataValues,
        //   },
        //   REFRESH_SECRET,
        //   {
        //     expiresIn: "7 days",
        //   }
        // );

        res
          .status(200)
          .cookie("accessToken", accessToken, {
            maxAge: 1000 * 60 * 15, // 15분 간유지
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

  signout: async (req, res) => {
    await Users.findOne({
      where: {
        id: 1,
      },
    })
      .then((result) => {
        const { ACCESS_SECRET } = process.env;
        const { REFRESH_SECRET } = process.env;
        // console.log(result);
        const refeshToken = jwt.sign(
          {
            userdata: 1,
            exp: Math.floor(Date.now() / 1000) + 60,
          },

          ACCESS_SECRET
        );

        res
          .status(200)
          .cookie("accessToken", refeshToken, {
            maxAge: 10,
            httpOnly: true,
          })
          .send({ message: "successfully sign out" });
      })
      .catch((err) => {
        res.status(401).send({ message: "fail sign out" });
        console.error(err);
      });
  },

  mypage_get: async (req, res) => {
    const { ACCESS_SECRET } = process.env;
    const { REFRESH_SECRET } = process.env;
    const authorization = req.headers.cookie;
    const splits = authorization.split(" ");
    const access = [];

    console.log("token: ", req.headers);

    splits.map((el) => {
      if (el.includes("accessToken")) {
        access.push(el);
      }
    });
    const token = access[0].split("=")[1].slice(0, -1);
    const decoded = jwt.verify(token, ACCESS_SECRET, (err, decoded) => {
      if (err) {
        return undefined;
      }
      return decoded;
    });

    if (!decoded) {
      console.log(splits);
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

  menu_choice_patch: async (req, res) => {},

  menu_choice_post: async (req, res) => {
    const big_choice_menu = req.body.big_choice_menu; // 한식,중식,일식,양식,분식&패스트푸드,디저트,야식&안주
    const feeling = req.body.feeling; // 나쁨,조금나쁨,평범,좋음
    const weather = req.body.weather; // 맑음, 흐림, 눈, 비
    const { ACCESS_SECRET } = process.env;
    const { REFRESH_SECRET } = process.env;
    const authorization = req.headers.cookie;
    const splits = authorization.split(" ");
    // console.log(splits);
    const access = [];

    splits.map((el) => {
      if (el.includes("accessToken")) {
        access.push(el);
      }
    });
    // console.log(access);
    const token = access[0].split("=")[1].slice(0, -1); // 클라이언트에서 작성 할 때는 .slice(0,-1);을 추가
    const decoded = jwt.verify(token, ACCESS_SECRET, (err, decoded) => {
      if (err) {
        return undefined;
      } else return decoded;
    });
    // console.log(token);

    if (!decoded) {
      return res.status(401).send({ message: "You do not have access rights" });
    } else {
      switch (big_choice_menu) {
        case "한식":
          switch (feeling) {
            case "좋음":
              switch (weather) {
                case "맑음":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 8,
                        },
                        {
                          food_menu_id: 2,
                        },
                        {
                          food_menu_id: 34,
                        },
                        {
                          food_menu_id: 3,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu, // 한식
                      menu: menus[Math.floor(Math.random() * menus.length)], // choicemenu 33_김치찌개
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                    console.log(big_choice_menu);
                  });

                  break;
                case "흐림":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 3,
                        },
                        {
                          food_menu_id: 1,
                        },
                        {
                          food_menu_id: 34,
                        },
                        {
                          food_menu_id: 5,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;

                case "눈":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 3,
                        },
                        {
                          food_menu_id: 2,
                        },
                        {
                          food_menu_id: 34,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;

                case "비":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 3,
                        },
                        {
                          food_menu_id: 7,
                        },
                        {
                          food_menu_id: 34,
                        },
                        {
                          food_menu_id: 6,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
              }
              break;

            case "평범":
              switch (weather) {
                case "맑음":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 4,
                        },
                        {
                          food_menu_id: 34,
                        },
                        {
                          food_menu_id: 8,
                        },
                        {
                          food_menu_id: 2,
                        },
                        {
                          food_menu_id: 3,
                        },
                        {
                          food_menu_id: 6,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "흐림":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 1,
                        },
                        {
                          food_menu_id: 3,
                        },
                        {
                          food_menu_id: 5,
                        },
                        {
                          food_menu_id: 34,
                        },
                        {
                          food_menu_id: 6,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "눈":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 1,
                        },
                        {
                          food_menu_id: 2,
                        },
                        {
                          food_menu_id: 5,
                        },
                        {
                          food_menu_id: 34,
                        },
                        {
                          food_menu_id: 3,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "비":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 6,
                        },
                        {
                          food_menu_id: 5,
                        },
                        {
                          food_menu_id: 3,
                        },
                        {
                          food_menu_id: 1,
                        },
                        {
                          food_menu_id: 34,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
              }
              break;

            case "조금나쁨":
              switch (weather) {
                case "맑음":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 8,
                        },
                        {
                          food_menu_id: 2,
                        },
                        {
                          food_menu_id: 34,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "흐림":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 1,
                        },
                        {
                          food_menu_id: 8,
                        },
                        {
                          food_menu_id: 5,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "눈":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 3,
                        },
                        {
                          food_menu_id: 34,
                        },
                        {
                          food_menu_id: 1,
                        },
                        {
                          food_menu_id: 5,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "비":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 6,
                        },
                        {
                          food_menu_id: 34,
                        },
                        {
                          food_menu_id: 1,
                        },
                        {
                          food_menu_id: 5,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
              }
              break;

            case "나쁨":
              switch (weather) {
                case "맑음":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 7,
                        },
                        {
                          food_menu_id: 34,
                        },
                        {
                          food_menu_id: 8,
                        },
                        {
                          food_menu_id: 4,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "흐림":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 6,
                        },
                        {
                          food_menu_id: 1,
                        },
                        {
                          food_menu_id: 3,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "눈":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 3,
                        },
                        {
                          food_menu_id: 5,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "비":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 34,
                        },
                        {
                          food_menu_id: 3,
                        },
                        {
                          food_menu_id: 5,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
              }
              break;
          }
          break;

        case "일식":
          switch (feeling) {
            case "좋음":
              switch (weather) {
                case "맑음":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 14,
                        },
                        {
                          food_menu_id: 16,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "흐림":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 14,
                        },
                        {
                          food_menu_id: 15,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "눈":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 13,
                        },
                        {
                          food_menu_id: 15,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "비":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 13,
                        },
                        {
                          food_menu_id: 16,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
              }
              break;
            case "평범":
              switch (weather) {
                case "맑음":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 13,
                        },
                        {
                          food_menu_id: 14,
                        },
                        {
                          food_menu_id: 15,
                        },
                        {
                          food_menu_id: 16,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "흐림":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 13,
                        },
                        {
                          food_menu_id: 14,
                        },
                        {
                          food_menu_id: 15,
                        },
                        {
                          food_menu_id: 16,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "눈":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 13,
                        },
                        {
                          food_menu_id: 14,
                        },
                        {
                          food_menu_id: 15,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "비":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 13,
                        },
                        {
                          food_menu_id: 14,
                        },
                        {
                          food_menu_id: 16,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
              }
              break;
            case "조금나쁨":
              switch (weather) {
                case "맑음":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 13,
                        },
                        {
                          food_menu_id: 14,
                        },
                        {
                          food_menu_id: 15,
                        },
                        {
                          food_menu_id: 16,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "흐림":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 13,
                        },
                        {
                          food_menu_id: 15,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "눈":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 13,
                        },
                        {
                          food_menu_id: 14,
                        },
                        {
                          food_menu_id: 15,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "비":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 13,
                        },
                        {
                          food_menu_id: 15,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
              }
              break;
            case "나쁨":
              switch (weather) {
                case "맑음":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 15,
                        },
                        {
                          food_menu_id: 16,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "흐림":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 13,
                        },
                        {
                          food_menu_id: 16,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "눈":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 13,
                        },
                        {
                          food_menu_id: 14,
                        },
                        {
                          food_menu_id: 15,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "비":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 13,
                        },
                        {
                          food_menu_id: 14,
                        },
                        {
                          food_menu_id: 16,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
              }
              break;
          }
          break;

        case "양식":
          switch (feeling) {
            case "좋음":
              switch (weather) {
                case "맑음":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 20,
                        },
                        {
                          food_menu_id: 21,
                        },
                        {
                          food_menu_id: 22,
                        },
                        {
                          food_menu_id: 23,
                        },
                        {
                          food_menu_id: 24,
                        },
                        {
                          food_menu_id: 25,
                        },
                        {
                          food_menu_id: 26,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "흐림":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 20,
                        },
                        {
                          food_menu_id: 21,
                        },
                        {
                          food_menu_id: 23,
                        },
                        {
                          food_menu_id: 25,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "눈":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 21,
                        },
                        {
                          food_menu_id: 22,
                        },
                        {
                          food_menu_id: 23,
                        },
                        {
                          food_menu_id: 24,
                        },
                        {
                          food_menu_id: 25,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "비":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 22,
                        },
                        {
                          food_menu_id: 23,
                        },
                        {
                          food_menu_id: 25,
                        },
                        {
                          food_menu_id: 26,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
              }
              break;
            case "평범":
              switch (weather) {
                case "맑음":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 20,
                        },
                        {
                          food_menu_id: 21,
                        },
                        {
                          food_menu_id: 22,
                        },
                        {
                          food_menu_id: 23,
                        },
                        {
                          food_menu_id: 24,
                        },
                        {
                          food_menu_id: 25,
                        },
                        {
                          food_menu_id: 26,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "흐림":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 20,
                        },
                        {
                          food_menu_id: 21,
                        },
                        {
                          food_menu_id: 22,
                        },
                        {
                          food_menu_id: 23,
                        },
                        {
                          food_menu_id: 26,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "눈":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 23,
                        },
                        {
                          food_menu_id: 24,
                        },
                        {
                          food_menu_id: 25,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "비":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 20,
                        },
                        {
                          food_menu_id: 21,
                        },
                        {
                          food_menu_id: 23,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
              }
              break;
            case "조금나쁨":
              switch (weather) {
                case "맑음":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 20,
                        },
                        {
                          food_menu_id: 21,
                        },
                        {
                          food_menu_id: 23,
                        },
                        {
                          food_menu_id: 24,
                        },
                        {
                          food_menu_id: 25,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "흐림":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 20,
                        },
                        {
                          food_menu_id: 21,
                        },
                        {
                          food_menu_id: 22,
                        },
                        {
                          food_menu_id: 23,
                        },
                        {
                          food_menu_id: 26,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "눈":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 20,
                        },
                        {
                          food_menu_id: 23,
                        },
                        {
                          food_menu_id: 24,
                        },
                        {
                          food_menu_id: 25,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "비":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 20,
                        },
                        {
                          food_menu_id: 21,
                        },
                        {
                          food_menu_id: 23,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
              }
              break;
            case "나쁨":
              switch (weather) {
                case "맑음":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 20,
                        },
                        {
                          food_menu_id: 21,
                        },
                        {
                          food_menu_id: 24,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "흐림":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 20,
                        },
                        {
                          food_menu_id: 21,
                        },
                        {
                          food_menu_id: 23,
                        },
                        {
                          food_menu_id: 25,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "눈":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 20,
                        },
                        {
                          food_menu_id: 23,
                        },
                        {
                          food_menu_id: 25,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "비":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 21,
                        },
                        {
                          food_menu_id: 22,
                        },
                        {
                          food_menu_id: 23,
                        },
                        {
                          food_menu_id: 25,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
              }
              break;
          }
          break;

        case "중식":
          switch (feeling) {
            case "좋음":
              switch (weather) {
                case "맑음":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 10,
                        },
                        {
                          food_menu_id: 11,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "흐림":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 13,
                        },
                        {
                          food_menu_id: 11,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "눈":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 10,
                        },
                        {
                          food_menu_id: 9,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "비":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 10,
                        },
                        {
                          food_menu_id: 11,
                        },
                        {
                          food_menu_id: 12,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
              }
              break;
            case "평범":
              switch (weather) {
                case "맑음":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 10,
                        },
                        {
                          food_menu_id: 11,
                        },
                        {
                          food_menu_id: 9,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "흐림":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 9,
                        },
                        {
                          food_menu_id: 10,
                        },
                        {
                          food_menu_id: 11,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "눈":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 9,
                        },
                        {
                          food_menu_id: 12,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "비":
                  break;
              }
              break;
            case "조금나쁨":
              switch (weather) {
                case "맑음":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 10,
                        },
                        {
                          food_menu_id: 11,
                        },
                        {
                          food_menu_id: 12,
                        },
                        {
                          food_menu_id: 9,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "흐림":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 9,
                        },
                        {
                          food_menu_id: 10,
                        },
                        {
                          food_menu_id: 12,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "눈":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 11,
                        },
                        {
                          food_menu_id: 12,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "비":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 10,
                        },
                        {
                          food_menu_id: 9,
                        },
                        {
                          food_menu_id: 12,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
              }
              break;
            case "나쁨":
              switch (weather) {
                case "맑음":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 9,
                        },
                        {
                          food_menu_id: 10,
                        },
                        {
                          food_menu_id: 11,
                        },
                        {
                          food_menu_id: 12,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "흐림":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 9,
                        },
                        {
                          food_menu_id: 10,
                        },
                        {
                          food_menu_id: 11,
                        },
                        {
                          food_menu_id: 12,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "눈":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 11,
                        },
                        {
                          food_menu_id: 12,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "비":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 9,
                        },
                        {
                          food_menu_id: 10,
                        },
                        {
                          food_menu_id: 11,
                        },
                        {
                          food_menu_id: 12,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
              }
              break;
          }
          break;

        case "분식&패스트푸드":
          switch (feeling) {
            case "좋음":
              switch (weather) {
                case "맑음":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 17,
                        },
                        {
                          food_menu_id: 19,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "흐림":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 17,
                        },
                        {
                          food_menu_id: 19,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "눈":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 19,
                        },
                        {
                          food_menu_id: 17,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "비":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 17,
                        },
                        {
                          food_menu_id: 19,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
              }
              break;
            case "평범":
              switch (weather) {
                case "맑음":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 18,
                        },
                        {
                          food_menu_id: 19,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "흐림":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 17,
                        },
                        {
                          food_menu_id: 18,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "눈":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 17,
                        },
                        {
                          food_menu_id: 18,
                        },
                        {
                          food_menu_id: 19,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "비":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 17,
                        },
                        {
                          food_menu_id: 18,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
              }
              break;
            case "조금나쁨":
              switch (weather) {
                case "맑음":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 17,
                        },
                        {
                          food_menu_id: 18,
                        },
                        {
                          food_menu_id: 19,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "흐림":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 17,
                        },
                        {
                          food_menu_id: 18,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "눈":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 17,
                        },
                        {
                          food_menu_id: 18,
                        },
                        {
                          food_menu_id: 19,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "비":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 17,
                        },
                        {
                          food_menu_id: 18,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
              }
              break;
            case "나쁨":
              switch (weather) {
                case "맑음":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 17,
                        },
                        {
                          food_menu_id: 18,
                        },
                        {
                          food_menu_id: 19,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "흐림":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 18,
                        },
                        {
                          food_menu_id: 19,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "눈":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 17,
                        },
                        {
                          food_menu_id: 19,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "비":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 17,
                        },
                        {
                          food_menu_id: 18,
                        },
                        {
                          food_menu_id: 19,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
              }
              break;
          }
          break;

        case "디저트":
          switch (feeling) {
            case "좋음":
              switch (weather) {
                case "맑음":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 32,
                        },
                        {
                          food_menu_id: 33,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "흐림":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 31,
                        },
                        {
                          food_menu_id: 32,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "눈":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 33,
                        },
                        {
                          food_menu_id: 32,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "비":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 31,
                        },
                        {
                          food_menu_id: 32,
                        },
                        {
                          food_menu_id: 33,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
              }
              break;
            case "평범":
              switch (weather) {
                case "맑음":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 31,
                        },
                        {
                          food_menu_id: 32,
                        },
                        {
                          food_menu_id: 33,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "흐림":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 31,
                        },
                        {
                          food_menu_id: 32,
                        },
                        {
                          food_menu_id: 33,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "눈":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 31,
                        },
                        {
                          food_menu_id: 32,
                        },
                        {
                          food_menu_id: 33,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "비":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 31,
                        },
                        {
                          food_menu_id: 32,
                        },
                        {
                          food_menu_id: 33,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
              }
              break;
            case "조금나쁨":
              switch (weather) {
                case "맑음":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 31,
                        },
                        {
                          food_menu_id: 32,
                        },
                        {
                          food_menu_id: 33,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "흐림":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 31,
                        },
                        {
                          food_menu_id: 32,
                        },
                        {
                          food_menu_id: 33,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "눈":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 31,
                        },
                        {
                          food_menu_id: 32,
                        },
                        {
                          food_menu_id: 33,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "비":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 31,
                        },
                        {
                          food_menu_id: 32,
                        },
                        {
                          food_menu_id: 33,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
              }
              break;
            case "나쁨":
              switch (weather) {
                case "맑음":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 31,
                        },
                        {
                          food_menu_id: 32,
                        },
                        {
                          food_menu_id: 33,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "흐림":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 31,
                        },
                        {
                          food_menu_id: 32,
                        },
                        {
                          food_menu_id: 33,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "눈":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 31,
                        },
                        {
                          food_menu_id: 32,
                        },
                        {
                          food_menu_id: 33,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "비":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 31,
                        },
                        {
                          food_menu_id: 32,
                        },
                        {
                          food_menu_id: 33,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
              }
              break;
          }
          break;

        case "야식&안주":
          switch (feeling) {
            case "좋음":
              switch (weather) {
                case "맑음":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 27,
                        },
                        {
                          food_menu_id: 28,
                        },
                        {
                          food_menu_id: 29,
                        },
                        {
                          food_menu_id: 30,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "흐림":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 28,
                        },
                        {
                          food_menu_id: 29,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "눈":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 27,
                        },
                        {
                          food_menu_id: 28,
                        },

                        {
                          food_menu_id: 29,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "비":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 27,
                        },
                        {
                          food_menu_id: 28,
                        },
                        {
                          food_menu_id: 29,
                        },
                        {
                          food_menu_id: 30,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
              }
              break;
            case "평범":
              switch (weather) {
                case "맑음":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 27,
                        },
                        {
                          food_menu_id: 28,
                        },
                        {
                          food_menu_id: 30,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "흐림":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 27,
                        },
                        {
                          food_menu_id: 28,
                        },
                        {
                          food_menu_id: 29,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "눈":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 27,
                        },
                        {
                          food_menu_id: 28,
                        },
                        {
                          food_menu_id: 29,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "비":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 27,
                        },
                        {
                          food_menu_id: 28,
                        },
                        {
                          food_menu_id: 29,
                        },
                        {
                          food_menu_id: 30,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
              }
              break;
            case "조금나쁨":
              switch (weather) {
                case "맑음":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 27,
                        },
                        {
                          food_menu_id: 28,
                        },
                        {
                          food_menu_id: 29,
                        },
                        {
                          food_menu_id: 30,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "흐림":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 27,
                        },
                        {
                          food_menu_id: 28,
                        },
                        {
                          food_menu_id: 29,
                        },
                        {
                          food_menu_id: 30,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "눈":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 27,
                        },
                        {
                          food_menu_id: 28,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "비":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 27,
                        },
                        {
                          food_menu_id: 28,
                        },
                        {
                          food_menu_id: 29,
                        },
                        {
                          food_menu_id: 30,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
              }
              break;
            case "나쁨":
              switch (weather) {
                case "맑음":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 27,
                        },
                        {
                          food_menu_id: 28,
                        },
                        {
                          food_menu_id: 29,
                        },
                        {
                          food_menu_id: 30,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "흐림":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 27,
                        },
                        {
                          food_menu_id: 28,
                        },
                        {
                          food_menu_id: 29,
                        },
                        {
                          food_menu_id: 30,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "눈":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 27,
                        },
                        {
                          food_menu_id: 28,
                        },
                        {
                          food_menu_id: 29,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
                case "비":
                  Food.findAll({
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          food_menu_id: 27,
                        },
                        {
                          food_menu_id: 28,
                        },
                        {
                          food_menu_id: 29,
                        },
                        {
                          food_menu_id: 30,
                        },
                      ],
                    },
                  }).then((el) => {
                    const menus = [];
                    el.map((data) => {
                      menus.push(data.dataValues.food_name);
                    });
                    res.status(200).send({
                      big_choice_menu: big_choice_menu,
                      menu: menus[Math.floor(Math.random() * menus.length)],
                    });
                    console.log(
                      menus[Math.floor(Math.random() * menus.length)]
                    );
                  });
                  break;
              }
              break;
          }
          break;
      }
    }
  },
  // 대분류, 날씨, 기분에 따른 112개의 조건문 분기
};

// big_choice_menu, feeling, weather

// if(big_choice_menu==='한식')
//    if(feeling==='좋음')
//      if(weather==='맑음')  {
//             [2,3,4,5].map(el=> data = el.random());
//            menu= data.random();

//   }
//  res.status(200).send(menu)
