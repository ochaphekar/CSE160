// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_vertexColor;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;

  varying vec4 u_FragColor;

  // attribute vec4 a_Normal;
  // uniform mat4 u_NormalMatrix;

  // uniform mat4 u_MvpMatrix;

  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    u_FragColor = a_vertexColor;
    // vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));
  }
`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec4 u_FragColor;

  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_whichTexture;

  void main() {
    if (u_whichTexture == -2) {
      gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0); // Green for vertex color path
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Red for UV coordinates
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else if (u_whichTexture == -3) {
      gl_FragColor = vec4(1, 0.65, 0.2, 1);
    } else {
      gl_FragColor = vec4(1.0, 0.2, 0.2, 1.0); // Default color path
    }
  }
`;


const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2

// Global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_whichTexture;
// let u_NormalMatrix;


let MousePos = [0,0];


// UI gloabl variables
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_segments = 10;
let g_globalRotateAngle = -45;
let g_globalRotateAngleY = 0;

let globalRotateX = 0;
let globalRotateY = 0;

let g_animation = true;
let g_specialAnimation = false;
let g_specialAnimationStartTime = null;

let g_camera = null;

let g_key_a = false;
let g_key_w = false;
let g_key_s = false;
let g_key_d = false;
let g_key_q = false;
let g_key_e = false;

let g_gravity = false;


// Global joint angles
let g_jumpHeight = 0;
let g_map = [];

function addActionsForHtmlUI(){
  document.getElementById("gravityOn").onclick = function(){g_gravity = true;};
  document.getElementById("gravityOff").onclick = function(){g_gravity = false;};
}

function setupWebGL() {
	// Retrieve <canvas> element
	canvas = document.getElementById("webgl");

	// Get the rendering context for WebGL
  gl = getWebGLContext(canvas, false)
	if (!gl) {
		console.log("Failed to get the rendering context for WebGL");
		return;
	}

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log("Failed to initialize shaders.");
		return;
	}

	// // Get the storage location of a_Position
	a_Position = gl.getAttribLocation(gl.program, "a_Position");
	if (a_Position < 0) {
		console.log("Failed to get the storage location of a_Position");
		return;
	}

	// Get the storage location of u_FragColor
  u_FragColor = gl.getAttribLocation(gl.program, "a_vertexColor");
  if (u_FragColor < 0) {
    console.log("Failed to get the storage location of a_vertexColor");
    return;
  }


  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  // Get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return false;
  }
  if (u_whichTexture == 1) {
    gl_FragColor = texture2D(u_Sampler1, v_UV);
}

  let identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function initTextures() {
  var image = new Image();  // Create the image object
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }
  var texture1 = gl.createTexture();   // Create a texture object
  if (!texture1) {
    console.log('Failed to create the texture1 object');
    return false;
  }

  image.onload = function(){ sendImageToTexture(image, 0, texture1); };
  image.src = 'imgs/sky.jpeg?v=' + new Date().getTime();

  // Add more textures here
  var image2 = new Image();  // Create the image object
  if (!image2) {
    console.log('Failed to create the image object');
    return false;
  }
  var texture2 = gl.createTexture();   // Create a texture object
  if (!texture2) {
    console.log('Failed to create the texture2 object');
    return false;
  }
  image2.onload = function(){ sendImageToTexture(image2, 1, texture2); };
  image2.src = 'imgs/ground.jpeg?v=' + new Date().getTime();

  return true;
}


function sendImageToTexture(img, n, texture){
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  switch(n){
    case 0:
      gl.activeTexture(gl.TEXTURE0);
      break;
    case 1:
      gl.activeTexture(gl.TEXTURE1);
      break;
    default:
      console.log("Error: Texture number not recognized");
  }
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);

  // Set the texture unit 0 to the sampler
  switch(n){
    case 0:
      gl.uniform1i(u_Sampler0, 0);
      break;
    case 1:
      gl.uniform1i(u_Sampler1, 1);
      break;
    default:
      console.log("Error: Texture cannot be found");
      break;
  }
}

let randX;
let randZ;

let g_model;

function main() {
  // Set up canvas and gl variables
	setupWebGL();
  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  // getValues();
  addActionsForHtmlUI();

  g_camera = new Camera();

  makeMaze();

  randX = Math.floor(Math.random() * 40)-20;
  randZ = Math.floor(Math.random() * 40)-20;

  canvas.onmousedown = function(ev){
    if(ev.buttons == 1){
      g_camera.mouseDown(ev);
    }
   };

  canvas.onmousemove = function(ev){
    if(ev.buttons == 1){
      g_camera.mouseMove(ev);
    }
  }

  document.onkeydown = function(ev) { keydown(ev.key); };
  document.onkeyup = function(ev) { keyUp(ev.key); };
  
  initTextures();
  
	// Specify the color for clearing <canvas>
	gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Drawing OBJ File
  // g_model = initVertexBuffers(gl);
  // if (!g_model) {
  //   console.log('Failed to set the vertex information');
  //   return;
  // }

  // readOBJFile('sphere.obj', gl, g_model, 60, true);
  requestAnimationFrame(tick);
}

var currentAngle = 0.0;

var g_startTime = performance.now()/1000;
var g_seconds = performance.now()/1000 - g_startTime;

// var g_pressTime = performance.now()/1000;

function tick(){
  g_camera.move();

  g_seconds = performance.now()/1000 - g_startTime;
  // console.log(g_seconds);

  updateAnimationAngles();
  renderAllShapes();

  requestAnimationFrame(tick);
}

function updateAnimationAngles(){ 
  if(g_animation){
    g_jumpHeight = (Math.max(5 * Math.sin(g_seconds), 0));
  }
  if(g_specialAnimation){
    if(g_specialAnimationStartTime == null){
      g_specialAnimationStartTime = g_seconds;
    }
    if(g_seconds > g_specialAnimationStartTime + 4){
      g_specialAnimation = false;
      g_specialAnimationStartTime = null;
    }
  }
}


function convertCoordinatesEventToGL(ev){
  var x = ev.clientX;
	var y = ev.clientY;
	var rect = ev.target.getBoundingClientRect();

	x = (x - rect.left - canvas.width / 2) / (canvas.width / 2);
	y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return([x,y]);
}

function resetKeys(){
  g_key_d = false;
  g_key_a = false;
  g_key_w = false;
  g_key_s = false;
  g_key_q = false;
  g_key_e = false;
}

function keydown(ev){
  if(ev == 'w'){
    g_key_w = true;
  }
  if(ev == 'a'){
    g_key_a = true;
  }
  if(ev == 's'){
    g_key_s = true;
  }
  if(ev == 'd'){
    g_key_d = true;
  }
  if(ev == 'q'){
    g_key_q = true;
  }
  if(ev == 'e'){
    g_key_e = true;
  }
  if(ev == 'b'){
    g_camera.removeBlock();
  }

}

function keyUp(input){
  if(input == 'w'){
    g_key_w = false;
  }
  if(input == 'a'){
    g_key_a = false;
  }
  if(input == 's'){
    g_key_s = false;
  }
  if(input == 'd'){
    g_key_d = false;
  }
  if(input == 'q'){
    g_key_q = false;
  }
  if(input == 'e'){
    g_key_e = false;
  }
}

function renderAllShapes(){
  // Check the time at the start of this function
  var startTime = performance.now();

  g_camera.update();
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, g_camera.projectionMatrix.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, g_camera.viewMatrix.elements);

  var globalRotMat = new Matrix4().rotate(0, 0, 1, 0).rotate(0, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  renderScene();

  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + duration.toFixed(2) + " fps: " + Math.floor(10000/duration), "numdot");
}

function sendTextToHTML(text, id){
  var htmlElm = document.getElementById(id);
  if(!htmlElm){
    console.log("Error: could not find HTML element with id: " + id);
    return;
  }
  htmlElm.innerHTML = text;
}

let frog1 = null;

function renderScene(){
  var Floor = new Cube();
  Floor.color = [1,0,0,1];
  Floor.textureNum = 1;
  Floor.matrix.translate(0, -.8, 0);
  Floor.matrix.scale(50, -0.1, 50);
  Floor.matrix.translate(-0.5, -0.5, -0.5);
  Floor.render();

  var Sky = new Cube();
  Sky.color = [1,0,0,1];
  Sky.textureNum = 0;
  Sky.matrix.scale(50, 50, 50);
  Sky.matrix.translate(-0.5, -0.1, -0.5);
  Sky.render();

  drawMaze();

  var simpleCube = new Cube();
  simpleCube.color = [1, 0, 0, 1];
  simpleCube.matrix.translate(randX, -0.2, randZ);
  simpleCube.matrix.scale(1, 1, 1); // Adjust size as needed
  simpleCube.render();

}


// used the function from: https://en.wikipedia.org/wiki/Maze_generation_algorithm#Recursive_division_method
function makeMaze(){
  var map = [];
  for(var i = 0; i < 50; i++){
    map.push([]);
    for(var j = 0; j < 50; j++){
      map[i].push(1);
    }
  }

  function divide(x, y, w, h){
    if(w < 2 || h < 2){
      return;
    }
    let wall;
    let hole;
    var dir = Math.floor(Math.random() * 2);
    if(dir == 0){
      wall = Math.floor(Math.random() * (h-1)) + 1;
      hole = Math.floor(Math.random() * w);
      for(var i = 0; i < w; i++){
        if(i != hole){
          map[y+wall][x+i] = 0;
        }
      }
      divide(x, y, w, wall);
      divide(x, y+wall, w, h-wall);
    }else{
      wall = Math.floor(Math.random() * (w-1)) + 1;
      hole = Math.floor(Math.random() * h);
      for(var i = 0; i < h; i++){
        if(i != hole){
          map[y+i][x+wall] = 0;
        }
      }
      divide(x, y, wall, h);
      divide(x+wall, y, w-wall, h);
    }
  }

  divide(0, 0, 50, 50);

  for(var i = 22; i < 28; i++){
    for(var j = 22; j < 28; j++){
      map[i][j] = 0;
    }
  }

  g_map = map;
}

function drawMaze(){
  let tempCube = new Cube();
  for(let i = 0; i < g_map.length; i++){
    for(let j = 0; j < g_map[i].length; j++){
      if(g_map[i][j] == 1){
        tempCube.color = [1, 0, 0, 1]; // Red
        tempCube.textureNum = -3;
        tempCube.matrix.setTranslate(j - g_map.length/2, 0, i - g_map.length/2);
        tempCube.matrix.scale(1, 5, 1);
        tempCube.matrix.translate(-0.5, -0.75, -0.5);

        tempCube.render();
      }
    }
  }
}
