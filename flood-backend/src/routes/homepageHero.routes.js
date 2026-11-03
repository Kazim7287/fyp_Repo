
const express = require("express");
const router = express.Router();

const {
  getHomepageHero,
  saveHomepageHero,
  publishHomepageHero,
} = require("../controllers/homepageHero.controller");

// GET homepage hero
router.get("/", getHomepageHero);

// SAVE homepage hero
router.put("/", saveHomepageHero);

// PUBLISH homepage hero
router.patch("/publish", publishHomepageHero);

module.exports = router;
