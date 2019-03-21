//global
let t = 0.0;
let tStep = 1 / 100;
let state;
let blobCurve;

let windowWidth, windowHeight;
let canvas, ctx;

function init () {
  canvas = document.getElementById('the-canvas');
  canvas.width = windowWidth = window.innerWidth;
  canvas.height = windowHeight = window.innerHeight;
  ctx = canvas.getContext('2d');

  state = {
    playing: true,
    blob_size: 32,
    blob_length: 20,
    blob_amount: 3,
    v0_x: 0.2 * windowWidth,
    v0_y: 0.8 * windowHeight,
    v3_x: 0.8 * windowWidth,
    v3_y: 0.2 * windowHeight
  };

  // get URL Parameters and merge with state
  urlParams = new URLSearchParams(window.location.search);
  urlState = {
    blob_size:   parseFloat(urlParams.get('blob_size')),
    blob_length: parseFloat(urlParams.get('blob_length')),
  }
  // remove null values
  Object.keys(urlState).forEach((key) => (urlState[key] == null || isNaN(urlState[key])) && delete urlState[key]);
  // merge into state
  state = Object.assign(state, urlState);

  // init GUI:       prop,        min,   max,            step, value
  set_slider_params('blob_size',   1,     256,            1,    state.blob_size);
  set_slider_params('blob_length', 1,     100,            1,    state.blob_length);
  set_slider_params('blob_amount', 1,     10,             1,    state.blob_amount);
  set_slider_params('v0_x',        0,     windowWidth,    10,   state.v0_x);
  set_slider_params('v0_y',        0,     windowHeight,   10,   state.v0_y);
  set_slider_params('v3_x',        0,     windowWidth,    10,   state.v3_x);
  set_slider_params('v3_y',        0,     windowHeight,   10,   state.v3_y);

  let a = createVector(state.v0_x,       state.v0_y);
  let b = createVector(state.v0_x + 200, state.v0_y);
  let c = createVector(state.v3_x - 200, state.v3_y);
  let d = createVector(state.v3_x,       state.v3_y);
  blobCurve = new BlobCurve(a, b, c, d, 50, state.blob_size);

  window.requestAnimationFrame(draw);
}

function draw() {
  if (state.playing) {
    t += tStep;
    if (t > 1.0) t = 0.0;
    // Include drawing statements in this conditional for smoother trailing effect
  }
  
  // clear canvas
  ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // draw blobs
  for (var i = 0; i < state.blob_amount; i++) {
    let blobs = blobCurve.getCurrentBlobs(t - i/state.blob_amount);
    drawBlobs(ctx, blobs);
  }

  window.requestAnimationFrame(draw);
}

function drawBlobs (ctx, blobs) {
  for (var i = 0; i < blobs.length; i++) {
    drawBlob(ctx, blobs[i]);
  }
}

function drawBlob(ctx, blob) {
  ctx.fillStyle = 'rgba(0, 0, 0, '+blob.intensity+')';
  ctx.beginPath();
  ctx.arc(
    blob.x,
    blob.y,
    blob.intensity * state.blob_size,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
function keyTyped() {
  if (key === ' ') {
    state.playing = !state.playing;
  }
}