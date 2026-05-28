const header = document.querySelector('.header');
const headerImages = header.querySelectorAll('img');

let loadedCount = 0;
const totalImages = headerImages.length;

function onAllImagesLoaded() {
  header.classList.add('is-loaded');
}

function checkImage() {
  loadedCount++;
  if (loadedCount === totalImages) {
    onAllImagesLoaded();
  }
}
headerImages.forEach(img => {
  if (img.complete) {
    checkImage();
  } else {
    img.addEventListener('load', checkImage);
    img.addEventListener('error', checkImage); // Bezpiecznik dla uszkodzonych linków
  }
});