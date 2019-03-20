function BlobCurve(a, b, c, d, blob_length, blob_size) {

  this.beziercurve = new BezierCurve(a, b, c, d, blob_length, blob_size);

  this.blob_length = blob_length;
  this.blob_size = blob_size;

  this.setV0 = function (v0) { 
    this.beziercurve.v0 = v0;
    this.beziercurve.v1 = createVector(v0.x + 200, v0.y);
    this.beziercurve.calculatePoints();
  }
  this.setV3 = function (v3) { 
    this.beziercurve.v3 = v3;
    this.beziercurve.v2 = createVector(v3.x - 200, v3.y);
    this.beziercurve.calculatePoints();
  }

  this.blobStyle = function (intensity) {
    noStroke();
    fill(0, 255 * intensity);
  }

  this.getCurrentBlobs = function (t) {
    let blobs = [];
    for (var j = 0; j < state.blob_length; j += 1) {
      let index = Math.round(t * 100) - j;
      if (index < 0) {
        index = this.beziercurve.SEGMENT_COUNT + index;
        if (index < 0) {
          index = this.beziercurve.SEGMENT_COUNT + index;
        }
      }
      let blobPos = this.beziercurve.vpoints[index];
      let blob_intensity = 1 - (j / state.blob_length);
      blobs.push({
          x: blobPos.x, 
          y: blobPos.y,
          intensity: blob_intensity,         
      });
    }
    return blobs;
  }

  this.drawBlobs = function (blobs) {
    for (var i = 0; i < blobs.length; i++) {
      this.blobStyle(blobs[i]['intensity']);
      ellipse(
        blobs[i].x, 
        blobs[i].y,
        blobs[i].intensity * state.blob_size,
        blobs[i].intensity * state.blob_size,
      );
    }
  }

  this.drawCurve = function () {
    this.beziercurve.draw();
  }
  
  this.draw = function (t) {
    let blobs = this.getCurrentBlobs(t);
    this.drawBlobs(blobs); 
  }
}