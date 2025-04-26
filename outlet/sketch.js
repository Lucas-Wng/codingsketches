function setup() {
  createCanvas(400, 400);
  noLoop();
}

function mouseClicked() {
  generateOutlet();
}

function draw() {
  background(220);
  generateOutlet();
}

function generateOutlet() {
  background(220);
  noStroke();
  
  // Random faceplate style
  let faceplateX = width / 2;
  let faceplateY = height / 2;
  let faceplateW = random(100, 140);
  let faceplateH = random(160, 200);
  let isCircularPlate = random() < 0.3;
  
  fill(240 + random(-10, 10)); // off-white randomness
  rectMode(CENTER);
  if (isCircularPlate) {
    ellipse(faceplateX, faceplateY, faceplateW, faceplateW);
  } else {
    rect(faceplateX, faceplateY, faceplateW, faceplateH, 10);
  }

  // 50% chance to draw an inner frame
  let hasInnerFrame = random() < 0.5;
  if (hasInnerFrame) {
    stroke(200);
    strokeWeight(1.5);
    noFill();
    if (!isCircularPlate) {
      let inset = 35;
      rect(faceplateX, faceplateY, faceplateW - inset, faceplateH - inset, 6);
    }
    noStroke();
  }

  // Add grain and scratch textures to the faceplate
  addGrainTexture(faceplateX, faceplateY, faceplateW, isCircularPlate ? faceplateW : faceplateH);
  addScratchTexture(faceplateX, faceplateY, faceplateW, isCircularPlate ? faceplateW : faceplateH);
  
  // Draw screws
  fill(100);
  if (isCircularPlate) {
    let r = faceplateW / 2 * 0.85;
    for (let angle of [PI/4, 3*PI/4, 5*PI/4, 7*PI/4]) {
      let sx = faceplateX + cos(angle) * r;
      let sy = faceplateY + sin(angle) * r;
      ellipse(sx, sy, 7, 7);
    }
  } else {
    let offsets = [
      [-faceplateW/2 + 10, -faceplateH/2 + 10],
      [ faceplateW/2 - 10, -faceplateH/2 + 10],
      [-faceplateW/2 + 10,  faceplateH/2 - 10],
      [ faceplateW/2 - 10,  faceplateH/2 - 10],
    ];
    for (let offset of offsets) {
      let [dx, dy] = offset;
      ellipse(faceplateX + dx, faceplateY + dy, 10, 10);
    }
  }
  
  // Setup grid and hole positions
  let rows;
  let cols;
  let gridSpacingX;
  let gridSpacingY;
  
  let holePositions = [];
  let placedAtLeastOne = false;
  
  if (isCircularPlate) {
    rows = int(random(3, 5));
    cols = 3;
    gridSpacingX = faceplateW / (cols + 1);
    gridSpacingY = faceplateW / (rows + 1);

    for (let c = 0; c < cols / 2; c++) {
      for (let r = 0; r < rows; r++) {
        const posKey = [c, r];
        if ((c === 0 && r === 0) || (c === 0 && r === rows - 1)) continue;
        let shouldPlace = random() < 0.35;
        if (!placedAtLeastOne && c === 1 && r === int(rows / 2)) {
          shouldPlace = true;
        }
        if (shouldPlace) {
          let holeType = random(["circle", "slit", "triangle", "rectangle"]);
          holePositions.push({c, r, holeType, rotationAngle: 0});
          placedAtLeastOne = true;
        }
      }
    }
  } else {
    rows = int(random(4, 6)); // 4 to 6 rows
    cols = int(random(3, 5)); // 3 or 4 columns
    gridSpacingX = faceplateW / (cols + 1);
    gridSpacingY = faceplateH / (rows + 1);

    for (let c = 0; c < Math.ceil(cols/2); c++) {
      for (let r = 0; r < rows; r++) {
        if (hasInnerFrame && (r === 0 || r === rows - 1)) continue;
        let shouldPlace = random() < 0.25;
        if (!placedAtLeastOne && c === Math.floor(cols/4) && r === Math.floor(rows/2)) {
          shouldPlace = true;
        }
        if (shouldPlace) {
          let holeType = random(["circle", "slit", "triangle", "rectangle"]);
          let rotationAngle = 0;
          if (c !== 1 && random() < 0.4) {
            let angleBase = random() < 0.5 ? 45 : 30;
            let direction = random([-1, 1]); // cleaner than int(random(-1,1))
            rotationAngle = direction * angleBase;
          }
          holePositions.push({c, r, holeType, rotationAngle});
          placedAtLeastOne = true;
        }
      }
    }
  }
  
  // Draw holes with symmetry and controlled rotation
  fill(0);
  for (let pos of holePositions) {
    let {c, r, holeType, rotationAngle} = pos;
    
    if (isCircularPlate) {
      let gridX = faceplateX + (c - 1) * gridSpacingX;
      let gridY = faceplateY + (r - 1.5) * gridSpacingY;
      let mirrorGridX = faceplateX - (c - 1) * gridSpacingX;
      drawHole(gridX, gridY, holeType, rotationAngle);
      drawHole(mirrorGridX, gridY, holeType, -rotationAngle);
    } else {
      let gridX = faceplateX + (c - 1) * gridSpacingX;
      let gridY = faceplateY + (r - 2) * gridSpacingY;
      let mirrorGridX = faceplateX - (c - 1) * gridSpacingX;
      drawHole(gridX, gridY, holeType, rotationAngle);
      drawHole(mirrorGridX, gridY, holeType, -rotationAngle);
    }
  }
}

function drawHole(x, y, type, rotationAngle) {
  push();
  translate(x, y);
  rotate(radians(rotationAngle));
  switch (type) {
    case "circle":
      ellipse(0, 0, 10, 10);
      break;
    case "slit":
      rectMode(CENTER);
      rect(0, 0, 3, 12, 2);
      break;
    case "triangle":
      triangle(-5, 5, 5, 5, 0, -5);
      break;
    case "rectangle":
      rectMode(CENTER);
      rect(0, 0, 6, 10);
      break;
  }
  pop();
}

function drawAccessory(x, y, type) {
  push();
  translate(x, y);
  if (type === "light") {
    fill(255, 0, 0);
    ellipse(0, 0, 8, 8);
  } else if (type === "switch") {
    fill(0);
    rectMode(CENTER);
    rect(0, 0, 12, 6, 2);
    fill(255);
    rect(0, 0, 8, 3, 1);
  }
  pop();
}

// Overlay: subtle grain and scratch textures for realism
function addGrainTexture(x, y, w, h) {
  push();
  noStroke();
  for (let i = 0; i < 600; i++) {
    let gx = random(x - w/2, x + w/2);
    let gy = random(y - h/2, y + h/2);
    fill(0, 0, 0, random(10, 30)); // low opacity dark dots
    ellipse(gx, gy, 1, 1);
  }
  pop();
}

function addScratchTexture(x, y, w, h) {
  push();
  stroke(0, random(10, 20)); // semi-transparent thin scratches
  strokeWeight(0.5);
  for (let i = 0; i < 40; i++) {
    let x1 = random(x - w/2, x + w/2);
    let y1 = random(y - h/2, y + h/2);
    let x2 = x1 + random(-15, 15);
    let y2 = y1 + random(-15, 15);
    line(x1, y1, x2, y2);
  }
  pop();
}