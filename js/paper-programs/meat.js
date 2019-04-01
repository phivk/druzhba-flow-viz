// Meat

importScripts('paper.js');

function drawCircle(ctx, x, y) {
  ctx.fillStyle = ctx.strokeStyle = 'rgb(0, 255, 255)';
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, 2*Math.PI);
  ctx.fill();
}

(async () => {
  // Get a canvas object for this paper.
  const canvas = await paper.get('canvas');

  // Draw "Ukraine" on the canvas.
  const ctx = canvas.getContext('2d');
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgb(255,0,0)';
  
  // Move to Center Right and rotate 90 degrees
  ctx.translate(2, canvas.height / 2);
  ctx.rotate(Math.PI / 2);
  ctx.fillText('Kosice, Slovakia', 0, 0);
  ctx.translate(- (2), - canvas.height / 2);

  ctx.commit();

  

  // Get a "supporter canvas", which is a canvas for the entire
  // projection surface.
  const supporterCanvas = await paper.get('supporterCanvas');
  const supporterCtx = supporterCanvas.getContext('2d');

  // Get the paper number of this piece of paper (which should not change).
  const myPaperNumber = await paper.get('number');

  // Repeat every 100 milliseconds.
  setInterval(async () => {
    // Get a list of all the papers.
    const papers = await paper.get('papers');

    // Clear out the supporter canvas. We get our own canvas, so we won't
    // interfere with other programs by doing this.
    supporterCtx.clearRect(0, 0, supporterCanvas.width, supporterCanvas.height);

    

    // Draw a circle in the center of our paper.
    const myCenter = papers[myPaperNumber].points.center;
    supporterCtx.fillStyle = supporterCtx.strokeStyle = 'rgb(0, 255, 255)';
    supporterCtx.beginPath();
    supporterCtx.arc(myCenter.x, myCenter.y, 10, 0, 2*Math.PI);
    supporterCtx.fill();

    // Draw a line from our paper to each other paper.
    Object.keys(papers).forEach(otherPaperNumber => {
      if (otherPaperNumber !== myPaperNumber) {
        const otherCenter = papers[otherPaperNumber].points.center;

        supporterCtx.beginPath();
        supporterCtx.moveTo(myCenter.x, myCenter.y);
        supporterCtx.lineTo(otherCenter.x, otherCenter.y);
        supporterCtx.stroke();
      }
    });

    // Finally, commit to the canvas, which actually renders.
    supporterCtx.commit();

  }, 100);
})();