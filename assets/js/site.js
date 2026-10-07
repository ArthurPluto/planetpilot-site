/* Planet Pilot site behaviour. No tracking, no cookies, no storage. */
(function () {
  "use strict";
  var C = window.PP_CONFIG || {};
  var STEAM_FALLBACK = "https://store.steampowered.com/search/?term=Planet%20Pilot";

  function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }

  // Steam links
  each("[data-link='steam']", function (a) { a.href = C.STEAM_URL || STEAM_FALLBACK; });

  // Discord links
  each("[data-link='discord']", function (a) {
    if (C.DISCORD_URL) {
      a.href = C.DISCORD_URL;
    } else {
      var s = document.createElement("span");
      s.className = a.className;
      s.textContent = a.getAttribute("data-soon") || "Discord: coming soon";
      a.replaceWith(s);
    }
  });

  // Open data downloads
  each("[data-dl]", function (a) {
    var key = a.getAttribute("data-dl");
    var file = (C.OPEN_DATA_FILES || {})[key];
    if (C.OPEN_DATA_BASE && file) {
      a.href = C.OPEN_DATA_BASE + file;
      a.removeAttribute("aria-disabled");
    } else {
      a.removeAttribute("href");
      a.setAttribute("aria-disabled", "true");
      a.textContent = a.getAttribute("data-soon") || "Available at launch";
    }
  });
  each("[data-link='scripts']", function (a) {
    if (C.OPEN_DATA_SCRIPTS_URL) { a.href = C.OPEN_DATA_SCRIPTS_URL; }
    else { a.href = "mailto:opendata@planetpilot.world?subject=Planet%20Pilot%20bake%20scripts"; }
  });

  // Trailer: a click-to-load facade, so YouTube sets nothing until a visitor presses play.
  each("[data-trailer]", function (box) {
    var btn = box.querySelector(".trailer-play");
    var soon = box.querySelector(".trailer-soon");
    if (!C.YOUTUBE_ID) { if (btn) btn.hidden = true; return; }
    if (soon) soon.hidden = true;
    btn.hidden = false;
    btn.addEventListener("click", function () {
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(C.YOUTUBE_ID) + "?autoplay=1&rel=0";
      f.title = "Planet Pilot trailer";
      f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      f.allowFullscreen = true;
      box.appendChild(f);
      btn.remove();
    });
  });
  each("[data-link='youtube']", function (a) {
    if (C.YOUTUBE_ID) a.href = "https://www.youtube.com/watch?v=" + encodeURIComponent(C.YOUTUBE_ID);
    else { a.removeAttribute("href"); a.setAttribute("aria-disabled", "true"); a.textContent = a.getAttribute("data-soon") || "Trailer link coming soon"; }
  });

  // Mobile nav
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Hero loop: respect reduced motion and data saver, and offer a pause button.
  var video = document.querySelector(".hero-media video");
  var mt = document.querySelector(".motion-toggle");
  if (video) {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var save = navigator.connection && navigator.connection.saveData;
    if (reduce || save) {
      video.removeAttribute("autoplay");
      video.pause();
      video.preload = "none";
    }
    if (mt) {
      var setLabel = function () {
        var playing = !video.paused;
        mt.setAttribute("aria-pressed", playing ? "false" : "true");
        mt.querySelector("span").textContent = playing ? (mt.getAttribute("data-pause") || "Pause") : (mt.getAttribute("data-play") || "Play");
      };
      mt.addEventListener("click", function () { if (video.paused) video.play(); else video.pause(); });
      video.addEventListener("play", setLabel);
      video.addEventListener("pause", setLabel);
      setLabel();
    }
  }

  // Year in the footer
  each("[data-year]", function (el) { el.textContent = String(new Date().getFullYear()); });
})();
