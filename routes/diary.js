const diaryControllers = require("../controllers/indexCR/index");

const express = require("express");
const router = express.Router();

router.post("/diary", diaryControllers.diary_post);
router.get("/diary/:id", diaryControllers.diary_get);
router.patch("/diary/:id", diaryControllers.diary_patch);


module.exports = router;
