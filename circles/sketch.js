let video;
let myShader;

function preload() {
  myShader = loadShader('shader.vert', 'shader.frag');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  // Create a video capture (aka webcam input)
  video = createCapture(VIDEO);
  
  // Specify the resolution of the webcam input (too high and you may notice performance issues, especially if you're extracting info from it or adding filters)
  video.size(640, 480);

  // In some browsers, you may notice that a second video appears onscreen! That's because p5js actually creates a <video> html element, which then is piped into the canvas – the added command below ensures we don't see it :)
  video.hide();
}

function draw() { 
  // Display the video just like an image! 
  shader(myShader);
  myShader.setUniform('tex0', video);
  myShader.setUniform('u_resolution', [width, height]);
  plane(width, height);
} 