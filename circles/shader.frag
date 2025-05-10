// the number of divisions at the start
#define MIN_DIVISIONS 4.0

// the numer of possible quad divisions
#define MAX_ITERATIONS 6

// the number of samples picked fter each quad division
#define SAMPLES_PER_ITERATION 30
#define F_SAMPLES_PER_ITERATION 30.

// useless, kept it for reference for a personal usage 
#define MAX_SAMPLES 200

// threshold min, max given the mouse.x
#define THRESHOLD_MIN 0.0001
#define THRESHOLD_MAX 0.01

precision mediump float;

uniform sampler2D tex0;     // texture input (e.g. webcam)
uniform vec2 u_resolution;
varying vec2 vTexCoord;     // passed from vertex shader

vec2 hash22(vec2 p) { 
    float n = sin(dot(p, vec2(41, 289)));
    return fract(vec2(262144, 32768)*n);    
}

vec4 quadColorVariation (in vec2 center, in float size) {
    // this array will store the grayscale of the samples
    vec3 samplesBuffer[SAMPLES_PER_ITERATION];
    
    // the average of the color components
    vec3 avg = vec3(0);
    
    // we sample the current space by picking pseudo random samples in it 
    for (int i = 0; i < SAMPLES_PER_ITERATION; i++) {
        float fi = float(i);
        // pick a random 2d point using the center of the active quad as input
        // this ensures that for every point belonging to the active quad, we pick the same samples
        vec2 r = hash22(center.xy + vec2(fi, 0.0)) - 0.5;
        vec3 sp = texture2D(tex0, center + r * size).rgb;
        avg+= sp;
        samplesBuffer[i] = sp;
    }
    
    avg/= F_SAMPLES_PER_ITERATION;
    
    // estimate the color variation on the active quad by computing the variance
    vec3 var = vec3(0);
    for (int i = 0; i < SAMPLES_PER_ITERATION; i++) {
    	var+= pow(samplesBuffer[i], vec3(2.0));
    }
    var/= F_SAMPLES_PER_ITERATION;
    var-= pow(avg, vec3(2.0));
        
    return vec4(avg, (var.x+var.y+var.z)/3.0);
}

void main() {
  vec2 uv = vec2(vTexCoord.x, 1.0 - vTexCoord.y);

  float threshold = mix(THRESHOLD_MIN, THRESHOLD_MAX, 0.001);
    
  // number of space divisions
  float divs = MIN_DIVISIONS;

  // the center of the active quad - we initialze with 2 divisions
  vec2 quadCenter = (floor(uv * divs) + 0.5) / divs;
  float quadSize = 1. / divs; // the length of a side of the active quad
  
  // we store average and variance here
  vec4 quadInfos = vec4(0);
  
  for (int i = 0; i < MAX_ITERATIONS; i++) {
    quadInfos = quadColorVariation(quadCenter, quadSize);
      
    // if the variance is lower than the threshold, current quad is outputted
      if (quadInfos.w < threshold) break;
      
      // otherwise, we divide the space again
      divs*= 2.0;
      quadCenter = (floor(uv * divs) + 0.5) / divs;
      quadSize/= 2.0;
  }

  vec3 color = texture2D(tex0, uv).rgb;

  // Distance from current fragment to the center of the quad
  float distToCenter = length(uv - quadCenter);

  // Radius of the circle
  float radius = quadSize * 0.5;

  // Circle stroke width
  float edgeWidth = radius * 0.15; // adjust this for thicker/thinner lines

  // Create a ring using smoothstep
  float outer = smoothstep(radius, radius - edgeWidth, distToCenter);
  float inner = smoothstep(radius - edgeWidth, radius - edgeWidth * 2.0, distToCenter);
  float ring = outer - inner; // this isolates the stroke edge
  
  // we smooth the color between average and texture initial
  // color.rgb = mix(color.rgb, quadInfos.rgb, uv.x);
  
  // we smooth the lines over the x axis
  // s*= pow(1. - uv.x, 4.0);
  
  // for black lines, we just subtract
  color = mix(vec3(0), color, 1.0 - ring);

  gl_FragColor = vec4(color, 1.0);
}