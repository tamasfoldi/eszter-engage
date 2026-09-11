/* Eszter még engage tag? */

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
  // image files live in public/assets, so dropping in new photos is enough.
  fetch("./assets/manifest.json", { cache: "no-store" })
    .then(function (res) {
      if (!res.ok) throw new Error("manifest unavailable");
      return res.json();
    })
    .then(function (data) {
      var images = (data && data.images) || [];
      if (!images.length) return;
      showBackground("./assets/" + pickRandom(images));
    })
    .catch(function () {
      /* No manifest, no images: the plain dark background stays. */
    });
}

function render() {
  var engaged = isStillEngaged(new Date());
  var answer = document.getElementById("answer");

  document.body.classList.toggle("sad", !engaged);
  answer.textContent = engaged ? "IGEN" : "NEM";
  answer.setAttribute("lang", "hu");

  // Let the browser paint once before animating in.
  requestAnimationFrame(function () {
    answer.classList.add("is-visible");
  });
}

render();
loadRandomBackground();
