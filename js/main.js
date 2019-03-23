//global
let state;
let blobCurve1;

let windowWidth, windowHeight;
let canvas, ctx;

let RED       = '#FF4136';
let DARK_RED  = '#E7040F';
let BLUE      = '#357EDD';
let DARK_BLUE = '#00449E';

function init () {
  canvas = document.getElementById('the-canvas');
  canvas.width = windowWidth = window.innerWidth;
  canvas.height = windowHeight = window.innerHeight;
  ctx = canvas.getContext('2d');

  state = {
    t: 0.0,
    tStep: 0.01,
    playing: false,
    blob_size: 32,
    blob_length: 20,
    blob_amount: 3,
    v0_x: 0.2 * windowWidth,
    v0_y: 0.8 * windowHeight,
    v3_x: 0.8 * windowWidth,
    v3_y: 0.2 * windowHeight,
    debug: true,
    debugRadius: 10,
    mouseOver: null,
    mouseLocked: null,
    mouseOffsetX: 0,
    mouseOffsetY: 0,
    blobFill: true,
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

  // init GUI:       prop,         min,    max,   step,  value
  set_slider_params('blob_size',   1,      256,   1,     state.blob_size);
  set_slider_params('blob_length', 1,      100,   1,     state.blob_length);
  set_slider_params('blob_amount', 1,      10,    1,     state.blob_amount);
  set_slider_params('tStep',       0.001,  0.02,  0.001, state.tStep);

  let a = createVector(state.v0_x,       state.v0_y);
  let b = createVector(state.v0_x + 200, state.v0_y);
  let c = createVector(state.v3_x - 200, state.v3_y);
  let d = createVector(state.v3_x,       state.v3_y);
  blobCurve1 = new BlobCurve(a, b, c, d, state.blob_length, state.blob_size);

  window.requestAnimationFrame(draw);
}

function draw() {
  if (state.playing) {
    state.t += state.tStep;
    if (state.t > 1.0) state.t = 0.0;
  }
  
  // clear canvas
  ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // draw blobs
  drawBlobTrail(blobCurve1);

  // draw debug
  if (state.debug) {
    blobCurve1.drawControlPoints({ctx, state, drawStyles: {}});
  }

  window.requestAnimationFrame(draw);
}

function drawCircle(ctx, x, y, r, fillStyle, strokeStyle) {
  ctx.fillStyle = fillStyle;
  ctx.strokeStyle = strokeStyle;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function drawBlobs (ctx, blobs) {
  for (var i = 0; i < blobs.length; i++) {
    drawCircle(
      ctx, 
      blobs[i].x, 
      blobs[i].y, 
      blobs[i].intensity * state.blob_size,
      state.blobFill   ? 'rgba(0, 0, 0, '+blobs[i].intensity+')' : 'transparent',
      'rgba(0, 0, 0, '+blobs[i].intensity+')',
    );
  }
}

function drawBlobTrail(blobCurve) {
  for (var i = 0; i < state.blob_amount; i++) {
    let blobs = blobCurve.getCurrentBlobs(state.t - i/state.blob_amount);
    drawBlobs(ctx, blobs);
  }
}

function between(x, min, max) {
  return x >= min && x <= max;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
function keyTyped() {
  if (key === ' ') {
    state.playing = !state.playing;
  }
  else if (key === 'c') {
    state.debug = !state.debug;
    if (!state.debug) {
      state.mouseOver1 = null;
      state.mouseLocked1 = null;
    }
  }
  else if (key === 'f') {
    state.blobFill = !state.blobFill;
  }
  return false;
}
function mouseMoved(event) {
  if (state.debug) {
    blobCurve1.mouseMoved(event);
  }
}
function mousePressed(event) {
  blobCurve1.mousePressed(event);
}
function mouseReleased() {
  blobCurve1.mouseReleased();
}
function mouseDragged(event) {
  blobCurve1.mouseDragged(event);
}