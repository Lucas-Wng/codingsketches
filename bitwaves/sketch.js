let capture;
function setup() {
  createCanvas(1020, 720);
  pixelDensity(1); // keeps pixel indexing consistent
  capture = createCapture(VIDEO);
  capture.size(300, 480);
  capture.hide();
}

function draw() {
  background("#191338");

  // draw some lines (as before)
  for (let i = 0; i < 1000; i++) {
    stroke(random(255), random(255), random(255));
    line(random(width), random(height), random(width), random(height));
  }

  // overlay webcam normally
  push();
  translate(300, 450);
  imageMode(CENTER);
  let scale = 2.0;
  image(capture, 0, 0, capture.width * scale, capture.height * scale);
  pop();

  // now sort the full canvas (includes webcam + lines)
  loadPixels();

  let px = [];
  for (let i = 0; i < pixels.length; i += 4) {
    let r = pixels[i];
    let g = pixels[i+1];
    let b = pixels[i+2];
    let a = pixels[i+3];
    let bright = 0.299*r + 0.587*g + 0.114*b;
    px.push({ r, g, b, a, bright });
  }

  px.sort((a, b) => a.bright - b.bright);

  for (let i = 0; i < px.length; i++) {
    pixels[i*4]   = px[i].r;
    pixels[i*4+1] = px[i].g;
    pixels[i*4+2] = px[i].b;
    pixels[i*4+3] = px[i].a;
  }

  updatePixels();
}