
const homepageHeroService = require("../services/homepageHero.service");

// =========================================================
// GET HOMEPAGE HERO
// =========================================================

const getHomepageHero = async (req, res, next) => {
  try {
    const hero = await homepageHeroService.getHomepageHero();

    res.status(200).json({
      success: true,
      hero,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// SAVE HOMEPAGE HERO
// =========================================================

const saveHomepageHero = async (req, res, next) => {
  try {
    const {
      hero_heading,
      hero_description,
    } = req.body;

    if (
      typeof hero_heading !== "string" ||
      !hero_heading.trim() ||
      typeof hero_description !== "string" ||
      !hero_description.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Hero heading and description are required",
      });
    }

    const hero = await homepageHeroService.saveHomepageHero({
      ...req.body,
      hero_heading: hero_heading.trim(),
      hero_description: hero_description.trim(),
    });

    res.status(200).json({
      success: true,
      message: "Homepage hero saved successfully",
      hero,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// PUBLISH HOMEPAGE HERO
// =========================================================

const publishHomepageHero = async (req, res, next) => {
  try {
    const hero = await homepageHeroService.publishHomepageHero();

    if (!hero) {
      return res.status(404).json({
        success: false,
        message: "No homepage hero found. Save the hero first.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Homepage hero published successfully",
      hero,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// EXPORT CONTROLLER FUNCTIONS
// =========================================================

module.exports = {
  getHomepageHero,
  saveHomepageHero,
  publishHomepageHero,
};
