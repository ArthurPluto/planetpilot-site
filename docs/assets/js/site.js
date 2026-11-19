/* Planet Pilot site behaviour. No tracking, no cookies, no storage. */
(function () {
  "use strict";
  var C = window.PP_CONFIG || {};
  var STEAM_FALLBACK = "https://store.steampowered.com/app/5407250/Planet_Pilot/";

  function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }

  // Steam links
  each("[data-link='steam']", function (a) { a.href = C.STEAM_URL || STEAM_FALLBACK; });

  // Trailer: a click-to-load facade, so YouTube sets nothing until a visitor presses play.
  each("[data-trailer]", function (box) {
    var btn = box.querySelector(".trailer-play");
    if (!C.YOUTUBE_ID) { if (btn) btn.hidden = true; return; }
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
