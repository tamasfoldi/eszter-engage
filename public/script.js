/* Tagja-e még Eszter az Engage-nek? */

// IGEN through the end of 2026-09-21 (Budapest time), NEM afterwards.
// Written as an absolute instant so the answer does not depend on the
// visitor's own clock settings, only on the actual moment in time.
var CUTOFF = new Date("2026-09-21T00:00:00+02:00");

function isStillEngaged(now) {
  return now < CUTOFF;
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// WebP has been universal for years, but the fallback is one line.
function supportsWebp() {
  try {
    var canvas = document.createElement("canvas");
    return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
  } catch (err) {
    return false;
  }
}

// How many device pixels to download per CSS pixel of layout. A photo
// sitting behind a dark scrim and huge text does not need retina-perfect
// detail, and on a tall phone screen `cover` crops away most of a
// landscape shot's width, so honouring a 3x ratio there would mean
// megabytes spent on pixels nobody ever sees.
var DENSITY_PHONE = 1;
var DENSITY_LARGER = 2;

function pixelDensity() {
  var connection = navigator.connection || {};
  var slow = /(^|-)(2g|3g)$/.test(connection.effectiveType || "");

  if (connection.saveData || slow) return 1;

  // The short side tells a phone (in either orientation) from a tablet.
  var shortSide = Math.min(
    window.innerWidth || 1280,
    window.innerHeight || 800,
  );
  var ceiling = shortSide < 500 ? DENSITY_PHONE : DENSITY_LARGER;

  return Math.min(window.devicePixelRatio || 1, ceiling);
}

// background-size: cover scales the image until it fills both axes, so a
// tall narrow viewport needs an image far wider than the viewport itself.
function neededWidth(aspect) {
  var viewportWidth = window.innerWidth || 1280;
  var viewportHeight = window.innerHeight || 800;
  var widthToCover = Math.max(viewportWidth, viewportHeight * aspect);

  return widthToCover * pixelDensity();
}

function chooseWidth(widths, needed) {
  for (var i = 0; i < widths.length; i++) {
    if (widths[i] >= needed) return widths[i];
  }

  return widths[widths.length - 1];
}

function showBackground(src) {
  var backdrop = document.getElementById("backdrop");
  var img = new Image();
  img.onload = function () {
    backdrop.style.backgroundImage = 'url("' + src + '")';
    backdrop.classList.add("is-visible");
  };
  img.src = src;
}

function loadRandomBackground() {
  // assets/manifest.json is regenerated on every build from whatever
  // originals live in images/, so dropping in new photos is enough.
  fetch("./assets/manifest.json", { cache: "no-store" })
    .then(function (res) {
      if (!res.ok) throw new Error("manifest unavailable");
      return res.json();
    })
    .then(function (data) {
      var images = (data && data.images) || [];
      if (!images.length) return;

      var image = pickRandom(images);
      var width = chooseWidth(image.widths, neededWidth(image.aspect));
      var ext = supportsWebp() ? "webp" : "jpg";

      showBackground("./assets/" + image.slug + "-" + width + "." + ext);
    })
    .catch(function () {
      /* No manifest, no images: the plain dark background stays. */
    });
}

// Fraction of the stage's content box the answer is allowed to occupy,
// leaving the photo some room to breathe around it.
var FILL_WIDTH = 0.94;
var FILL_HEIGHT = 0.55;
var PROBE_SIZE = 200;

// Emoji advance widths vary by platform and cannot be predicted in CSS, so
// measure the glyphs as actually rendered and scale to an exact fit. The
// inline span hugs its text, unlike the block-level heading around it.
function fitAnswer() {
  var answer = document.getElementById("answer");
  var text = document.getElementById("answer-text");
  var stage = answer.parentNode;
  var stageStyle = window.getComputedStyle(stage);

  // Fit to the stage's content box, not the raw viewport: text wider than
  // the padding allows overflows, and the browser then shunts it sideways
  // rather than letting it spill past the edge, which reads as off-centre.
  var availableWidth =
    stage.clientWidth -
    parseFloat(stageStyle.paddingLeft) -
    parseFloat(stageStyle.paddingRight);
  var availableHeight =
    stage.clientHeight -
    parseFloat(stageStyle.paddingTop) -
    parseFloat(stageStyle.paddingBottom);

  answer.style.fontSize = PROBE_SIZE + "px";

  // offsetWidth/Height rather than getBoundingClientRect: the heading
  // carries a scale() entrance transform, which a client rect would
  // include and a layout measurement correctly ignores.
  var probeWidth = text.offsetWidth;
  var probeHeight = text.offsetHeight;
  if (!probeWidth || !probeHeight) return;

  var scale = Math.min(
    (availableWidth * FILL_WIDTH) / probeWidth,
    (availableHeight * FILL_HEIGHT) / probeHeight,
  );

  answer.style.fontSize = Math.max(24, Math.floor(PROBE_SIZE * scale)) + "px";
}

function render() {
  var engaged = isStillEngaged(new Date());
  var answer = document.getElementById("answer");

  document.body.classList.toggle("sad", !engaged);
  document.getElementById("answer-text").textContent = engaged
    ? "🔥IGEN💅"
    : "💀NEM🪦";
  answer.setAttribute("lang", "hu");
  fitAnswer();

  // Let the browser paint once before animating in.
  requestAnimationFrame(function () {
    answer.classList.add("is-visible");
  });
}

// Rotating a phone or resizing a window changes what fits.
var refitQueued = false;
window.addEventListener("resize", function () {
  if (refitQueued) return;
  refitQueued = true;
  requestAnimationFrame(function () {
    refitQueued = false;
    fitAnswer();
  });
});

render();
loadRandomBackground();
