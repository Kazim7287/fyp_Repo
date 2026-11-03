
import api from "./axios";

// =========================================================
// GET HOMEPAGE HERO
// =========================================================

export const getHomepageHero = async () => {
  const response = await api.get("/homepage-hero");
  return response.data;
};

// =========================================================
// SAVE HOMEPAGE HERO
// =========================================================

export const saveHomepageHero = async (heroData) => {
  const response = await api.put("/homepage-hero", heroData);
  return response.data;
};

// =========================================================
// PUBLISH HOMEPAGE HERO
// =========================================================

export const publishHomepageHero = async () => {
  const response = await api.patch("/homepage-hero/publish");
  return response.data;
};

// =========================================================
// DEFAULT EXPORT
// =========================================================

const homepageHeroApi = {
  getHomepageHero,
  saveHomepageHero,
  publishHomepageHero,
};

export default homepageHeroApi;
