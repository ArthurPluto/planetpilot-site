/*
  Planet Pilot site settings: THE ONE PLACE TO EDIT LINKS.
  Every page loads this file. Leave a value empty ("") while it is unknown:
  the pages then show a "coming soon" state instead of a broken link.
*/
window.PP_CONFIG = {
  // Steam store page, e.g. "https://store.steampowered.com/app/1234567/Planet_Pilot/".
  // Empty: the Wishlist buttons fall back to a Steam search for "Planet Pilot".
  STEAM_URL: "",

  // YouTube video id of the main trailer (the part after watch?v=), e.g. "dQw4w9WgXcQ".
  // Empty: the trailer slot shows the key art and "Trailer coming soon".
  YOUTUBE_ID: "",

  // Discord invite, e.g. "https://discord.gg/xxxxxxx". Empty: shown as "coming soon".
  DISCORD_URL: "",

  // Open data downloads (GitHub release assets). Base URL of the release, ending in "/".
  // Example: "https://github.com/ArthurPluto/planetpilot-open-data/releases/download/v1.0/"
  OPEN_DATA_BASE: "",
  // Where the bake scripts are published (a repo or a folder in it). Empty: "on request".
  OPEN_DATA_SCRIPTS_URL: "",
  // File names inside that release (keep in step with DEPLOY.md, section "Open data release").
  OPEN_DATA_FILES: {
    buildings: "planetpilot-odbl-buildings.zip",
    roads: "planetpilot-odbl-roads.zip",
    green: "planetpilot-odbl-green.zip",
    water: "planetpilot-odbl-city-water.zip",
    coast: "planetpilot-odbl-coast.zip",
    sources: "SOURCES.txt"
  }
};
