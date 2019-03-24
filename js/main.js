//global
let state;
let blobCurves = [];

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
    curves: [
      {
        amount: 2,
        size: 32,
        length: 32,
      },
      {
        amount: 4,
        size: 16,
        length: 16,
      },
    ],
    t: 0.0,
    tStep: 0.01,
    playing: true,
    v0_x: 0.2 * windowWidth,
    v0_y: 0.8 * windowHeight,
    v3_x: 0.8 * windowWidth,
    v3_y: 0.3 * windowHeight,
    debug: true,
    debugRadius: 10,
    mouseOver: null,
    mouseLocked: null,
    mouseOffsetX: 0,
    mouseOffsetY: 0,
    blobFill: true,
  };

  // get URL Parameters and merge with state
  // urlParams = new URLSearchParams(window.location.search);
  // urlState = {
  //   blob_size:   parseFloat(urlParams.get('blob_size')),
  //   blob_length: parseFloat(urlParams.get('blob_length')),
  // }
  // // remove null values
  // Object.keys(urlState).forEach((key) => (urlState[key] == null || isNaN(urlState[key])) && delete urlState[key]);
  // // merge into state
  // state = Object.assign(state, urlState);

  // init GUI:       prop,         min,    max,   step,  value
  set_slider_params('0.amount',    1,      20,    1,     state.curves[0].amount);
  set_slider_params('0.size',      1,      256,   1,     state.curves[0].size);
  set_slider_params('0.length',    1,      100,   1,     state.curves[0].length);
  set_slider_params('1.amount',    1,      20,    1,     state.curves[1].amount);
  set_slider_params('1.size',      1,      256,   1,     state.curves[1].size);
  set_slider_params('1.length',    1,      100,   1,     state.curves[1].length);
  set_slider_params('tStep',       0.001,  0.02,  0.001, state.tStep);

  let a1 = createVector(state.v0_x,       state.v0_y);
  let b1 = createVector(state.v0_x + 200, state.v0_y);
  let c1 = createVector(state.v3_x - 200, state.v3_y);
  let d1 = createVector(state.v3_x,       state.v3_y);

  let a2 = createVector(state.v0_x,       state.v3_y);
  let b2 = createVector(state.v0_x + 200, state.v3_y);
  let c2 = createVector(state.v3_x - 200, state.v0_y);
  let d2 = createVector(state.v3_x,       state.v0_y);

  blobCurves = [
    new BlobCurve(a1, b1, c1, d1, state.curves[0].amount, state.curves[0].length, state.curves[0].size),
    new BlobCurve(a2, b2, c2, d2, state.curves[1].amount, state.curves[1].length, state.curves[1].size),
  ];

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
  drawBlobTrail(blobCurves[0]);
  drawBlobTrail(blobCurves[1]);

  // draw debug
  if (state.debug) {
    blobCurves[0].drawControlPoints({ctx, state, drawStyles: {}});
    blobCurves[1].drawControlPoints({ctx, state, drawStyles: {}});
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

function drawBlobs (ctx, blobs, blobCurve) {
  for (var i = 0; i < blobs.length; i++) {
    drawCircle(
      ctx, 
      blobs[i].x, 
      blobs[i].y, 
      blobs[i].intensity * blobCurve.size,
      state.blobFill   ? 'rgba(0, 0, 0, '+blobs[i].intensity+')' : 'transparent',
      'rgba(0, 0, 0, '+blobs[i].intensity+')',
    );
  }
}

function drawBlobTrail(blobCurve) {
  for (var i = 0; i < blobCurve.amount; i++) {
    let blobs = blobCurve.getCurrentBlobs(state.t - i/blobCurve.amount);
    drawBlobs(ctx, blobs, blobCurve);
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
    blobCurves[0].mouseMoved(event);
    blobCurves[1].mouseMoved(event);
  }
}

function mousePressed(event) {
  blobCurves[0].mousePressed(event);
  blobCurves[1].mousePressed(event);
}

function mouseReleased() {
  blobCurves[0].mouseReleased();
  blobCurves[1].mouseReleased();
}

function mouseDragged(event) {
  blobCurves[0].mouseDragged(event);
  blobCurves[1].mouseDragged(event);
}

function touchStarted(event) {
  blobCurves[0].touchStarted(event);
  blobCurves[1].touchStarted(event);
}