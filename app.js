// BPT Amulets Gallery - Frontend Script

const albumSelect = document.getElementById("albumSelect");
const searchBox = document.getElementById("searchBox");
const gallery = document.getElementById("gallery");

const modal = document.getElementById("imgModal");
const modalImg = document.getElementById("modalImg");
const modalCaption = document.getElementById("modalCaption");
const modalClose = document.getElementById("modalClose");

// URL API Google Apps Script
const API_URL = "YOUR_DEPLOYED_SCRIPT_URL";

// Load Albums
async function loadAlbums() {
  try {
    const res = await fetch(`${API_URL}?mode=albums`);
    const data = await res.json();

    albumSelect.innerHTML = "";
    data.albums.forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      albumSelect.appendChild(option);
    });

    if (data.albums.length > 0) loadImages(data.albums[0]);

  } catch (err) {
    console.error("โหลดอัลบั้มผิดพลาด", err);
  }
}

// Load Images by Album
async function loadImages(albumName) {
  gallery.innerHTML = "โหลดข้อมูล...";

  try {
    const res = await fetch(`${API_URL}?mode=images&album=${encodeURIComponent(albumName)}`);
    const data = await res.json();

    gallery.innerHTML = "";

    data.images.forEach(img => {
      const imgEl = document.createElement("img");
      imgEl.src = img.url;
      imgEl.alt = img.name;
      imgEl.dataset.caption = img.name;

      imgEl.addEventListener("click", () => openModal(imgEl));
      gallery.appendChild(imgEl);
    });
  } catch (err) {
    gallery.innerHTML = "โหลดรูปไม่สำเร็จ";
    console.error("โหลดรูปผิดพลาด", err);
  }
}

// Search Filter
searchBox.addEventListener("input", () => {
  const keyword = searchBox.value.toLowerCase();
  const images = gallery.querySelectorAll("img");

  images.forEach(img => {
    const name = img.alt.toLowerCase();
    img.style.display = name.includes(keyword) ? "block" : "none";
  });
});

// Album Change
albumSelect.addEventListener("change", () => {
  loadImages(albumSelect.value);
});

// Modal
function openModal(imgEl) {
  modal.classList.remove("hide");
  modalImg.src = imgEl.src;
  modalCaption.textContent = imgEl.dataset.caption;
}

modalClose.addEventListener("click", () => {
  modal.classList.add("hide");
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.add("hide");
});

// Init
loadAlbums();

