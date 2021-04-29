const diaryListControllers = require("../controllers/diaryCR/index");
const express = require("express");
const router = express.Router();

router.get("/diary-list", diaryListControllers.diary_list_get);
router.delete("/diary-list", diaryListControllers.diary_list_delete);

module.exports = router;
