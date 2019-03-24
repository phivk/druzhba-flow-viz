function BlobCurve(a, b, c, d, blob_amount, blob_length, blob_size) {
  this.cpOffsets = {};
  this.beziercurve = new BezierCurve(a, b, c, d);
  this.amount = blob_amount;
  this.length = blob_length;
  this.size = blob_size;
  this.mouseOver = null;

  this.setCPOffsets = function () {
    this.cpOffsets =  {
      v1: p5.Vector.sub(this.beziercurve.v1, this.beziercurve.v0),
      v2: p5.Vector.sub(this.beziercurve.v2, this.beziercurve.v3),
    };
  }
  this.setCPOffsets();

  this.blobStyle = function (intensity) {
    noStroke();
    fill(0, 255 * intensity);
  }

  this.getCurrentBlobs = function (t) {
    let blobs = [];
    for (var j = 0; j < this.length; j += 1) {
      let index = Math.round(t * 100) - j;
      if (index < 0) {
        index = this.beziercurve.SEGMENT_COUNT + index;
        if (index < 0) {
          index = this.beziercurve.SEGMENT_COUNT + index;
        }
      }
      let blobPos = this.beziercurve.vpoints[index];
      let blob_intensity = 1 - (j / this.length);
      blobs.push({
          x: blobPos.x,
          y: blobPos.y,
          intensity: blob_intensity,         
      });
    }
    return blobs;
  }

  // this.drawBlobs = function (blobs) {
  //   for (var i = 0; i < blobs.length; i++) {
  //     this.blobStyle(blobs[i].intensity);
  //     ellipse(
  //       blobs[i].x, 
  //       blobs[i].y,
  //       blobs[i].intensity * this.size,
  //       blobs[i].intensity * this.size,
  //     );
  //   }
  // }

  this.drawCurve = function () {
    this.beziercurve.draw();
  }
  
  // this.draw = function (t) {
  //   let blobs = this.getCurrentBlobs(t);
  //   this.drawBlobs(blobs); 
  // }  

  this.drawControlPoints = function (
    {
      ctx = {},
      state = {},
      drawStyles: {
        lineStrokeStyle        = '#FFF',
        CPstrokeStyle          = 'transparent',
        CPstrokeStyleHover     = '#FFF',
        CPOuterfillStyle       = '#FF4136', // RED
        CPOuterfillStyleHover  = '#E7040F', // DARK_RED
        CPCenterfillStyle      = '#357EDD', // BLUE
        CPCenterfillStyleHover = '#00449E', // DARK_BLUE
        debugRadius            = 10,
      },
    }
  ){
    drawLine(
      ctx,
      this.beziercurve.v0.x, 
      this.beziercurve.v0.y,
      this.beziercurve.v1.x, 
      this.beziercurve.v1.y,
      lineStrokeStyle,
    );
    drawLine(
      ctx,
      this.beziercurve.v2.x, 
      this.beziercurve.v2.y,
      this.beziercurve.v3.x, 
      this.beziercurve.v3.y,
      lineStrokeStyle,
    );
    
    drawCircle(
      ctx, this.beziercurve.v0.x, this.beziercurve.v0.y, debugRadius, 
      this.mouseOver === 'v0' ? CPOuterfillStyleHover : CPOuterfillStyle,  
      this.mouseOver === 'v0' ? CPstrokeStyleHover : CPstrokeStyle,
    );
    drawCircle(
      ctx, this.beziercurve.v1.x, this.beziercurve.v1.y, debugRadius, 
      this.mouseOver === 'v1' ? CPCenterfillStyleHover: CPCenterfillStyle, 
      this.mouseOver === 'v1' ? CPstrokeStyleHover : CPstrokeStyle,
    );
    drawCircle(
      ctx, this.beziercurve.v2.x, this.beziercurve.v2.y, debugRadius, 
      this.mouseOver === 'v2' ? CPCenterfillStyleHover: CPCenterfillStyle, 
      this.mouseOver === 'v2' ? CPstrokeStyleHover : CPstrokeStyle,
    );
    drawCircle(
      ctx, this.beziercurve.v3.x, this.beziercurve.v3.y, debugRadius, 
      this.mouseOver === 'v3' ? CPOuterfillStyleHover : CPOuterfillStyle,  
      this.mouseOver === 'v3' ? CPstrokeStyleHover : CPstrokeStyle,
    );
  }

  this.mouseMoved = function (event) {
    if (
      between(event.x, this.beziercurve['v0'].x - state.debugRadius, this.beziercurve['v0'].x + state.debugRadius) 
      && between(event.y, this.beziercurve['v0'].y - state.debugRadius, this.beziercurve['v0'].y + state.debugRadius)
    ) {
      this.mouseOver = 'v0';
    } else if (
      between(event.x, this.beziercurve['v1'].x - state.debugRadius, this.beziercurve['v1'].x + state.debugRadius) 
      && between(event.y, this.beziercurve['v1'].y - state.debugRadius, this.beziercurve['v1'].y + state.debugRadius)
    ) {
      this.mouseOver = 'v1';
    } else if (
      between(event.x, this.beziercurve['v2'].x - state.debugRadius, this.beziercurve['v2'].x + state.debugRadius) 
      && between(event.y, this.beziercurve['v2'].y - state.debugRadius, this.beziercurve['v2'].y + state.debugRadius)
    ) {
      this.mouseOver = 'v2';
    } else if (
      between(event.x, this.beziercurve['v3'].x - state.debugRadius, this.beziercurve['v3'].x + state.debugRadius) 
      && between(event.y, this.beziercurve['v3'].y - state.debugRadius, this.beziercurve['v3'].y + state.debugRadius)
    ) {
      this.mouseOver = 'v3';
    } else {
      this.mouseOver = null;
    }
  }

  this.mousePressed = function (event) {
    if (this.mouseOver !== null) {
      this.mouseLocked = this.mouseOver;
      this.mouseOffsetX = event.x - this.beziercurve[this.mouseOver].x;
      this.mouseOffsetY = event.y - this.beziercurve[this.mouseOver].y;
    } else {
      this.mouseLocked = null;
    }
  }

  this.mouseReleased = function () {
    this.mouseLocked = null;
  }

  this.mouseDragged = function (event) {
    if (this.mouseLocked !== null) {
      let newPosX = event.x - this.mouseOffsetX;
      let newPosY = event.y - this.mouseOffsetY;
      this.setControlPoint(this.mouseLocked, newPosX, newPosY);
    }
  }

  this.setControlPoint = function (controlPointName, newPosX, newPosY) {
    this.beziercurve[controlPointName] = createVector(newPosX, newPosY);
    if (controlPointName == 'v0') {
      this.beziercurve['v1'] = createVector(newPosX + this.cpOffsets['v1'].x, newPosY + this.cpOffsets['v1'].y);
    } else if (controlPointName == 'v3') {
      this.beziercurve['v2'] = createVector(newPosX + this.cpOffsets['v2'].x, newPosY + this.cpOffsets['v2'].y);
    } else {
      this.setCPOffsets();
    }
    this.beziercurve.calculatePoints();
  }
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