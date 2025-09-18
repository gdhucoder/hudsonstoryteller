const $ = (id) => document.getElementById(id);

const audio = $("audio");
const playlistEl = $("playlist");
const coverImg = $("coverImg");
const trackTitle = $("trackTitle");
const trackSubtitle = $("trackSubtitle");
const btnPlay = $("btnPlay");
const btnPrev = $("btnPrev");
const btnNext = $("btnNext");
const btnLoop = $("btnLoop");
const btnShuffle = $("btnShuffle");
const seekBar = $("seekBar");
const currentTimeEl = $("currentTime");
const durationEl = $("duration");
const volBar = $("volBar");
const modeBadge = $("modeBadge");
$("year").textContent = new Date().getFullYear();

const cfg = window.APP_CONFIG;
modeBadge.textContent = "JSON清单模式";

let tracks = [];    // {title, artist?, cover?, url}
let currentIndex = -1;
let isLoop = false;
let isShuffle = false;
let seeking = false;

function fmt(sec) {
  if (isNaN(sec) || sec === Infinity) return "00:00";
  const s = Math.floor(sec % 60).toString().padStart(2,"0");
  const m = Math.floor(sec / 60).toString().padStart(2,"0");
  return `${m}:${s}`;
}

function setActive(i) {
  [...playlistEl.querySelectorAll(".track")].forEach((el, idx) => {
    el.classList.toggle("active", idx === i);
  });
}

function loadTrack(i) {
  if (i < 0 || i >= tracks.length) return;
  currentIndex = i;
  const t = tracks[i];

  audio.src = t.url;
  trackTitle.textContent = t.title || `Track ${i+1}`;
  trackSubtitle.textContent = t.artist || (new URL(t.url, location.href).pathname.split("/").pop());
  coverImg.src = t.cover || "assets/cover-default.svg";

  setActive(i);
  audio.play().catch(()=>{});
  btnPlay.textContent = "⏸";
}

function nextTrack() {
  if (!tracks.length) return;
  if (isShuffle) {
    let j = Math.floor(Math.random() * tracks.length);
    if (j === currentIndex && tracks.length > 1) j = (j + 1) % tracks.length;
    loadTrack(j);
  } else {
    loadTrack((currentIndex + 1) % tracks.length);
  }
}

function prevTrack() {
  if (!tracks.length) return;
  loadTrack((currentIndex - 1 + tracks.length) % tracks.length);
}

btnPlay.addEventListener("click", () => {
  if (audio.paused) { audio.play(); btnPlay.textContent = "⏸"; }
  else { audio.pause(); btnPlay.textContent = "▶️"; }
});

btnNext.addEventListener("click", nextTrack);
btnPrev.addEventListener("click", prevTrack);
btnLoop.addEventListener("click", () => {
  isLoop = !isLoop;
  btnLoop.style.background = isLoop ? "#eef3ff" : "#fff";
});
btnShuffle.addEventListener("click", () => {
  isShuffle = !isShuffle;
  btnShuffle.style.background = isShuffle ? "#eef3ff" : "#fff";
});

audio.addEventListener("timeupdate", () => {
  if (seeking) return;
  const p = (audio.currentTime / (audio.duration || 1)) * 100;
  seekBar.value = p || 0;
  currentTimeEl.textContent = fmt(audio.currentTime);
  durationEl.textContent = fmt(audio.duration);
});

seekBar.addEventListener("input", () => { seeking = true; });
seekBar.addEventListener("change", () => {
  const pct = parseFloat(seekBar.value || "0")/100;
  audio.currentTime = (audio.duration || 0) * pct;
  seeking = false;
});

volBar.addEventListener("input", () => {
  audio.volume = parseFloat(volBar.value || "1");
});

audio.addEventListener("ended", () => {
  if (isLoop) loadTrack(currentIndex);
  else nextTrack();
});

function renderPlaylist() {
  playlistEl.innerHTML = "";
  tracks.forEach((t, i) => {
    const item = document.createElement("div");
    item.className = "track";
    item.innerHTML = `
      <img src="${t.cover || 'assets/cover-default.svg'}" style="width:40px;height:40px;border-radius:6px;object-fit:cover" alt="">
      <div>
        <div class="t-title">${t.title || '未命名'}</div>
        <div class="t-sub">${t.artist || t.url.split("/").pop()}</div>
      </div>
    `;
    item.addEventListener("click", () => loadTrack(i));
    playlistEl.appendChild(item);
  });
}

async function loadFromJson() {
  const res = await fetch(cfg.jsonManifestPath + "?v=" + Date.now());
  const data = await res.json(); // [{title, artist, cover, file}]
  tracks = (data || []).map(x => ({
    title: x.title,
    artist: x.artist,
    cover: x.cover,
    url: x.file.startsWith("http") ? x.file : ("/audio/" + x.file),
  }));
}

(async function init() {
  try {
    await loadFromJson();
    renderPlaylist();
    if (tracks.length) loadTrack(0);
  } catch (e) {
    console.error(e);
    trackTitle.textContent = "加载失败，请检查 stories.json 或网络。";
  }
})();
