const express = require("express")
const router = express.Router();
const indexControllers = require("../controllors/indexCr/index");

router.post('/signin', indexControllers.post);
router.post('/signup', indexControllers.post);
router.post('/signout', indexControllers.post);
router.post('/user-choice', indexControllers.post);
router.patch('/user-choice', indexControllers.patch);
router.post('/signup', indexControllers.post);
