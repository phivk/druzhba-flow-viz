//global
let blobCurve;
let t = 0.0;
let tStep = 1 / 100;
let state, urlParams, urlState;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255, 100);

  state = {
    playing: true,
    blob_size: 64,
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
}

function draw() {
  if (state.playing) {
    t += tStep;
    if (t > 1.0) t = 0.0;
  }
  background(200, 100);

  for (var i = 0; i < state.blob_amount; i++) {
    blobCurve.drawBlobs(t - i/state.blob_amount);
  }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function keyTyped() {
  if (key === ' ') {
    state.playing = !state.playing;
  }
}