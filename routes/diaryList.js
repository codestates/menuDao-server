const diaryListControllers = require("../controllers/diaryListCR/index");

const express = require("express");
const router = express.Router();

router.get("/", diaryListControllers.diary_list_get);
router.delete("/", diaryListControllers.diary_list_delete);

module.exports = router;
