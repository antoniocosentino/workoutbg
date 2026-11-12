'use strict';
const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const input = document.querySelector('#upload');
const download = document.querySelector('#download');
const share = document.querySelector('#share');
const status = document.querySelector('#status');
let resultURL;
let resultFile;
let revision = 0;
function message(text, error = false) {
  status.textContent = text;
  status.classList.toggle('error', error);
}
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('This image could not be opened. Please choose a PNG or JPG.'));
    image.src = src;
  });
}
function disableExport() {
  download.removeAttribute('href');
  download.classList.add('disabled');
  download.setAttribute('aria-disabled', 'true');
  share.hidden = true;
  document.querySelector('#share-hint').hidden = true;
  resultFile = null;
  if (resultURL) URL.revokeObjectURL(resultURL);
  resultURL = null;
}
const background = loadImage('./base-bg.png');
background.then(image => {
  if (revision === 0) {
    ctx.drawImage(image, 0, 0, 2400, 2400);
    message('Choose a photo to get started.');
  }
}).catch(() => message('The background could not load. Refresh the page to try again.', true));
async function compose(file) {
  if (!file) return;
  const current = ++revision;
  disableExport();
  if (!['image/png', 'image/jpeg'].includes(file.type) && !(file.type === '' && /\.(png|jpe?g)$/i.test(file.name))) {
    message('Please choose a PNG or JPG image.', true);
    return;
  }
  message('Preparing your image…');
  const sourceURL = URL.createObjectURL(file);
  try {
    const [base, photo] = await Promise.all([background, loadImage(sourceURL)]);
    if (current !== revision) return;
    ctx.clearRect(0, 0, 2400, 2400);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(base, 0, 0, 2400, 2400);
    const scale = Math.min(1800 / photo.naturalWidth, 1800 / photo.naturalHeight);
    const width = photo.naturalWidth * scale;
    const height = photo.naturalHeight * scale;
    ctx.drawImage(photo, (2400 - width) / 2, (2400 - height) / 2, width, height);
    document.querySelector('#placeholder').hidden = true;
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    if (current !== revision) return;
    if (!blob) throw new Error('Could not create the PNG. Please try a smaller source image.');
    const name = `${file.name.replace(/\.[^.]+$/, '') || 'photo'}-workout.png`;
    resultFile = new File([blob], name, { type: 'image/png' });
    resultURL = URL.createObjectURL(blob);
    download.href = resultURL;
    download.download = name;
    download.classList.remove('disabled');
    download.setAttribute('aria-disabled', 'false');
    const canShare = typeof navigator.share === 'function' && typeof navigator.canShare === 'function' && navigator.canShare({ files: [resultFile] });
    share.hidden = !canShare;
    document.querySelector('#share-hint').hidden = !canShare;
    document.querySelector('#upload-label').textContent = file.name;
    canvas.setAttribute('aria-label', 'Your photo centered on the workout background');
    message('Ready. Your 2400 × 2400 PNG is good to go.');
  } catch (error) {
    if (current === revision) message(error.message || 'Something went wrong. Please try another image.', true);
  } finally {
    URL.revokeObjectURL(sourceURL);
  }
}
input.addEventListener('change', () => {
  compose(input.files[0]);
  input.value = '';
});
const dropZone = document.querySelector('#drop-zone');
['dragenter', 'dragover'].forEach(type => dropZone.addEventListener(type, event => {
  event.preventDefault();
  dropZone.classList.add('dragging');
}));
['dragleave', 'drop'].forEach(type => dropZone.addEventListener(type, event => {
  event.preventDefault();
  dropZone.classList.remove('dragging');
}));
dropZone.addEventListener('drop', event => compose(event.dataTransfer.files[0]));
share.addEventListener('click', async () => {
  if (!resultFile) return;
  try {
    await navigator.share({ files: [resultFile] });
  } catch (error) {
    if (error.name !== 'AbortError') message('Sharing is unavailable. Use Download PNG instead.', true);
  }
});
