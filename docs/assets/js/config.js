/*
  Planet Pilot site settings: THE ONE PLACE TO EDIT LINKS.
  Every page loads this file. Leave a value empty ("") while it is unknown:
  the pages then show a "coming soon" state instead of a broken link.
*/
window.PP_CONFIG = {
  // Steam store page, e.g. "https://store.steampowered.com/app/1234567/Planet_Pilot/".
  // Empty: the Wishlist buttons fall back to a Steam search for "Planet Pilot".
  STEAM_URL: "",

  // YouTube video id of the main trailer (the part after watch?v=).
  // Empty: the trailer slot shows the key art and "Trailer coming soon".
  YOUTUBE_ID: "",

  // Discord invite, e.g. "https://discord.gg/xxxxxxx". Empty: shown as "coming soon".
  DISCORD_URL: "",

  // Open data (/open-data/): the ODbL ZIP of the current game release (a GitHub release asset),
  // e.g. "https://github.com/ArthurPluto/planetpilot-open-data/releases/download/v43/planetpilot-odbl-v43.zip"
  OPEN_DATA_ZIP_URL: "",
  // The public repo holding the bake scripts and the two CC BY-SA models,
  // e.g. "https://github.com/ArthurPluto/planetpilot-open-data"
  OPEN_DATA_REPO_URL: ""
};
