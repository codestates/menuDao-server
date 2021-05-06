const diaryControllers = require("../controllers/diaryCR/index");

const express = require("express");
const router = express.Router();

router.post("/", diaryControllers.diary_post);
router.get("/", diaryControllers.diary_get);
router.patch("/", diaryControllers.diary_patch);

module.exports = router;
