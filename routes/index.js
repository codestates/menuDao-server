// index endpoint
const indexControllers = require("../controllers/indexCR/index");

const express = require("express");
const router = express.Router();

router.post("/signin", indexControllers.signin);
router.post("/signup", indexControllers.signup);
router.post("/signout", indexControllers.signout);
router.post("/menu-choice", indexControllers.menu_choice_post);
router.patch("/menu-choice", indexControllers.menu_choice_patch);
router.get("/mypage", indexControllers.mypage);

module.exports = router;
