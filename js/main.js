//global
let state;
let blobCurve;

let windowWidth, windowHeight;
let canvas, ctx;

let BLUE      = '#357EDD';
let DARK_BLUE = '#00449E';
let RED       = '#FF4136';
let DARK_RED  = '#E7040F';

function init () {
  canvas = document.getElementById('the-canvas');
  canvas.width = windowWidth = window.innerWidth;
  canvas.height = windowHeight = window.innerHeight;
  ctx = canvas.getContext('2d');

  state = {
    t: 0.0,
    tStep: 0.01,
    playing: true,
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
  set_slider_params('tStep',       0.005,  0.05,  0.001, state.tStep);

  let a = createVector(state.v0_x,       state.v0_y);
  let b = createVector(state.v0_x + 200, state.v0_y);
  let c = createVector(state.v3_x - 200, state.v3_y);
  let d = createVector(state.v3_x,       state.v3_y);
  blobCurve = new BlobCurve(a, b, c, d, 50, state.blob_size);

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
  for (var i = 0; i < state.blob_amount; i++) {
    let blobs = blobCurve.getCurrentBlobs(state.t - i/state.blob_amount);
    drawBlobs(ctx, blobs);
  }

  // draw debug
  if (state.debug) {
    drawLine(
      ctx,
      blobCurve.beziercurve.v0.x, 
      blobCurve.beziercurve.v0.y,
      blobCurve.beziercurve.v1.x, 
      blobCurve.beziercurve.v1.y,
      '#FFF'
    );
    drawLine(
      ctx,
      blobCurve.beziercurve.v2.x, 
      blobCurve.beziercurve.v2.y,
      blobCurve.beziercurve.v3.x, 
      blobCurve.beziercurve.v3.y,
      '#FFF'
    );
    
    drawCircle(ctx, blobCurve.beziercurve.v0.x, blobCurve.beziercurve.v0.y, state.debugRadius, state.mouseOver === 'v0' ?  DARK_RED  : RED,  state.mouseOver === 'v0' ? 'white' : 'transparent');
    drawCircle(ctx, blobCurve.beziercurve.v1.x, blobCurve.beziercurve.v1.y, state.debugRadius, state.mouseOver === 'v1' ?  DARK_BLUE : BLUE, state.mouseOver === 'v1' ? 'white' : 'transparent');
    drawCircle(ctx, blobCurve.beziercurve.v2.x, blobCurve.beziercurve.v2.y, state.debugRadius, state.mouseOver === 'v2' ?  DARK_BLUE : BLUE, state.mouseOver === 'v2' ? 'white' : 'transparent');
    drawCircle(ctx, blobCurve.beziercurve.v3.x, blobCurve.beziercurve.v3.y, state.debugRadius, state.mouseOver === 'v3' ?  DARK_RED  : RED,  state.mouseOver === 'v3' ? 'white' : 'transparent');
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

function drawLine(ctx, x1, y1, x2, y2, strokeStyle) {
  ctx.strokeStyle = strokeStyle;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
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
      state.mouseOver = null;
      state.mouseLocked = null;
    }
  }
  else if (key === 'f') {
    state.blobFill = !state.blobFill;
  }
  return false;
}
function mouseMoved(event) {
  if (state.debug) {
    if (
      between(event.x, blobCurve.beziercurve['v0'].x - state.debugRadius, blobCurve.beziercurve['v0'].x + state.debugRadius) 
      && between(event.y, blobCurve.beziercurve['v0'].y - state.debugRadius, blobCurve.beziercurve['v0'].y + state.debugRadius)
    ) {
      state.mouseOver = 'v0';
    } else if (
      between(event.x, blobCurve.beziercurve['v1'].x - state.debugRadius, blobCurve.beziercurve['v1'].x + state.debugRadius) 
      && between(event.y, blobCurve.beziercurve['v1'].y - state.debugRadius, blobCurve.beziercurve['v1'].y + state.debugRadius)
    ) {
      state.mouseOver = 'v1';
    } else if (
      between(event.x, blobCurve.beziercurve['v2'].x - state.debugRadius, blobCurve.beziercurve['v2'].x + state.debugRadius) 
      && between(event.y, blobCurve.beziercurve['v2'].y - state.debugRadius, blobCurve.beziercurve['v2'].y + state.debugRadius)
    ) {
      state.mouseOver = 'v2';
    } else if (
      between(event.x, blobCurve.beziercurve['v3'].x - state.debugRadius, blobCurve.beziercurve['v3'].x + state.debugRadius) 
      && between(event.y, blobCurve.beziercurve['v3'].y - state.debugRadius, blobCurve.beziercurve['v3'].y + state.debugRadius)
    ) {
      state.mouseOver = 'v3';
    } else {
      state.mouseOver = null;
    }
  }
}
function mousePressed(event) {
  if (state.mouseOver !== null) {
    state.mouseLocked = state.mouseOver;
    state.mouseOffsetX = event.x - blobCurve.beziercurve[state.mouseOver].x;
    state.mouseOffsetY = event.y - blobCurve.beziercurve[state.mouseOver].y;
  } else {
    state.mouseLocked = null;
  }
}
function mouseReleased() {
  state.mouseLocked = null;
}
function mouseDragged(event) {
  if (state.mouseLocked !== null) {
    let newPosX = event.x - state.mouseOffsetX;
    let newPosY = event.y - state.mouseOffsetY;
    
    blobCurve.beziercurve[state.mouseLocked] = createVector(newPosX, newPosY);
    blobCurve.beziercurve.calculatePoints();
  }
}