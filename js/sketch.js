/*
This code is based on the example at processing.org in Java by Jakub Valtar www.jakubvaltar.com

"Examples/Topics/Curves/ArcLengthParametrization"

https://github.com/processing/processing-docs/tree/master/content/examples/Topics/Curves/ArcLengthParametrization

Functions getPointAtFraction() and getPointAtLength()
return points at fixed distances. 

I want to move an object along the curve at a fixed speed
and draw things equally spaced on curves.

BezierCurve consumes four points as
P5.Vector objects a, b, c, d
*/

function BezierCurve(a, b, c, d, blob_length, blob_size) {
  // Constants
  this.SEGMENT_COUNT = 100;

  //properties
  // these props should be of type P5.Vector
  this.v0 = a;
  this.v1 = b;
  this.v2 = c;
  this.v3 = d;

  this.arcLengths = [];
  this.curveLength = 0;
  this.prev = this.v0.copy();
  this.arcLength = 0;

  this.blob_length = blob_length;
  this.blob_tightness = 3.0 // how many times the blob sequence fits the arc
  this.blob_size = blob_size;

  // Returns a point along the curve at a specified parameter value.
  this.pointAtParameter = function(t) {
    let result = createVector(0, 0);
    result.x = bezierPoint(this.v0.x, this.v1.x, this.v2.x, this.v3.x, t);
    result.y = bezierPoint(this.v0.y, this.v1.y, this.v2.y, this.v3.y, t);
    return result;
  };

  this.calculatePoints = function () {
    this.vpoints = [];

    // i goes from 0 to SEGMENT_COUNT
    for (let i = 0; i <= this.SEGMENT_COUNT; i++) {
      // map index from range (0, SEGMENT_COUNT) to parameter in range (0.0, 1.0)
      let t = i / this.SEGMENT_COUNT;

      // get point on the curve at this parameter value
      let point = this.pointAtParameter(t);

      // get distance from previous point
      let distanceFromPrev = p5.Vector.dist(this.prev, point);

      // add arc length of last segment to total length
      this.arcLength += distanceFromPrev;

      // save current arc length to the look up table
      this.arcLengths[i] = this.arcLength;

      // keep this point to compute length of next segment
      this.prev.set(point);

      this.vpoints.push(point);

      // Here we have sum of all segment lengths, which should be
      // very close to the actual length of the curve. The more
      // segments we use, the more accurate it becomes.
      this.curveLength = this.arcLength;
    }
  }

  this.calculatePoints();

  this.setV0 = function (v0) { 
    this.v0 = v0;
    this.v1 = createVector(v0.x + 200, v0.y);
    this.calculatePoints();
  }
  this.setV3 = function (v3) { 
    this.v3 = v3;
    this.v2 = createVector(v3.x - 200, v3.y);
    this.calculatePoints();
  }

  // Returns the length of this curve
  this.length = function() {
    return this.curveLength;
  };

  // Returns a point at a fraction of curve's length.
  // Example: pointAtFraction(0.25) returns point at one quarter of curve's length.
  this.pointAtFraction = function(r) {
    let wantedLength = this.curveLength * r;
    return this.pointAtLength(wantedLength);
  };

  // Returns a point at a specified arc length along the curve.
  this.pointAtLength = function(wantedLength) {
    wantedLength = constrain(wantedLength, 0.0, this.curveLength);

    // look up the length in our look up table
    // binarySearch requires a sorted array
    // JS defaults to sorting by string so provide a function for sorting numbers
    // let sortedArray = array.sort(function(a, b){return a-b});
    let index = binarySearch(this.arcLengths, wantedLength);

    let mappedIndex;

    if (index < 0) {
      // if the index is negative, exact length is not in the table,
      // but it tells us where it should be in the table
      // see http://docs.oracle.com/javase/7/docs/api/java/util/Arrays.html#binarySearch(float[], float)

      // interpolate two surrounding indexes
      let nextIndex = -(index + 1);
      let prevIndex = nextIndex - 1;
      let prevLength = this.arcLengths[prevIndex];
      let nextLength = this.arcLengths[nextIndex];
      mappedIndex = map(
        wantedLength,
        prevLength,
        nextLength,
        prevIndex,
        nextIndex
      );
    } else {
      // wanted length is in the table, we know the index right away
      mappedIndex = index;
    }

    // map index from range (0, SEGMENT_COUNT) to parameter in range (0.0, 1.0)
    let parameter = mappedIndex / this.SEGMENT_COUNT;

    return this.pointAtParameter(parameter);
  };

  // Returns an array of equidistant p5.Vector points on the curve
  this.equidistantPoints = function(howMany) {
    let resultPoints = [];

    // we already know the beginning and the end of the curve
    resultPoints[0] = this.v0.copy();
    resultPoints[howMany - 1] = this.v3.copy();

    let arcLengthIndex = 1;
    for (let i = 1; i < howMany - 1; i++) {
      // compute wanted arc length
      let fraction = i / (howMany - 1);
      let wantedLength = fraction * this.curveLength;

      // move through the look up table until we find greater length
      while (
        wantedLength > this.arcLengths[arcLengthIndex] &&
        arcLengthIndex < this.arcLengths.length
      ) {
        arcLengthIndex++;
      }

      // interpolate two surrounding indexes
      let nextIndex = arcLengthIndex;
      let prevIndex = arcLengthIndex - 1;
      let prevLength = this.arcLengths[prevIndex];
      let nextLength = this.arcLengths[nextIndex];
      let mappedIndex = map(
        wantedLength,
        prevLength,
        nextLength,
        prevIndex,
        nextIndex
      );

      // map index from range (0, SEGMENT_COUNT) to parameter in range (0.0, 1.0)
      let parameter = mappedIndex / this.SEGMENT_COUNT;

      resultPoints[i] = this.pointAtParameter(parameter);
    }

    return resultPoints;
  };

  // Returns an array of points on the curve.
  this.points = function(howMany) {
    let resultPoints = [];

    // we already know the first and the last point of the curve
    resultPoints[0] = this.v0.copy();
    resultPoints[howMany - 1] = this.v3.copy();

    for (let i = 1; i < howMany - 1; i++) {
      // map index to parameter in range (0.0, 1.0)
      let parameter = i / (howMany - 1);

      resultPoints[i] = this.pointAtParameter(parameter);
    }

    return resultPoints;
  };

  this.blobStyle = function (intensity) {
    noStroke();
    fill(0, 255 * intensity);
  }
  this.curveStyle = function (intensity) {
    stroke(255);
    noFill();
  }

  this.drawBlobs = function (t) {
    for (var j = 0; j < state.blob_length; j += 1) {
      let index = Math.round(t * 100) - j;
      if (index < 0) {
        index = this.SEGMENT_COUNT + index;
        if (index < 0) {
          index = this.SEGMENT_COUNT + index;
        }
      }
      let blobPos = this.vpoints[index];
      
      let blob_intensity = 1 - (j / state.blob_length);
      this.blobStyle(blob_intensity);
      
      ellipse(
        blobPos.x, 
        blobPos.y,
        blob_intensity * state.blob_size, 
        blob_intensity * state.blob_size
      );
    }
  }

  this.drawCurve = function () {
    this.curveStyle();
    bezier(
      this.v0.x, this.v0.y,
      this.v1.x, this.v1.y,
      this.v2.x, this.v2.y,
      this.v3.x, this.v3.y
    );
  }
  
  this.draw = function (t) {
    this.drawCurve();
    this.drawBlobs(t); 
  }
}

// Binary Search based on code at https://dev.to/stepho/linear-and-binary-search-in-javascript-4b7h
function binarySearch(sortedArray, elt) {
  let lowIndex = 0;
  let highIndex = sortedArray.length - 1;

  while (lowIndex <= highIndex) {
    let midIndex = Math.floor((lowIndex + highIndex) / 2);
    if (sortedArray[midIndex] == elt) {
      return midIndex;
    } else if (sortedArray[midIndex] < elt) {
      lowIndex = midIndex + 1;
    } else {
      highIndex = midIndex - 1;
    }
  }
  return -(lowIndex + 1);
}

//global
let curve;
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
  set_slider_params('v0_x',        0,     windowWidth,    1,    state.v0_x);
  set_slider_params('v0_y',        0,     windowHeight,   1,    state.v0_y);
  set_slider_params('v3_x',        0,     windowWidth,    1,    state.v3_x);
  set_slider_params('v3_y',        0,     windowHeight,   1,    state.v3_y);

  
  let a = createVector(state.v0_x,       state.v0_y);
  let b = createVector(state.v0_x + 200, state.v0_y);
  let c = createVector(state.v3_x - 200, state.v3_y);
  let d = createVector(state.v3_x,       state.v3_y);
  curve = new BezierCurve(a, b, c, d, 50, state.blob_size);
}

function draw() {
  if (state.playing) {
    
    t += tStep;
    if (t > 1.0) t = 0.0;
    
  }
  background(200, 100);
  
  curve.drawBlobs(t);
  curve.drawBlobs(t-(1/3));
  curve.drawBlobs(t-(2/3));
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function keyTyped() {
  if (key === ' ') {
    state.playing = !state.playing;
  }
}