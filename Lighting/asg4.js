// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
precision mediump float;
attribute vec4 a_Position;
attribute vec2 a_UV;
attribute vec3 a_Normal;
varying vec2 v_UV;
varying vec3 v_Normal;
varying vec4 v_vertPos;
uniform mat4 u_NormalMatrix;
uniform mat4 u_ModelMatrix;
uniform mat4 u_GlobalRotateMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjectionMatrix;
void main() {
	gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
	v_UV = a_UV;
	v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 1)));
	//v_Normal = a_Normal;
	v_vertPos = u_ModelMatrix * a_Position;
}`;

// Fragment shader program
// code for spot light lighting source: https://webglfundamentals.org/webgl/lessons/webgl-3d-lighting-spot.html
var FSHADER_SOURCE = `
precision mediump float;
varying vec2 v_UV;
varying vec3 v_Normal;
uniform vec4 u_FragColor;
uniform sampler2D u_Sampler0;
uniform sampler2D u_Sampler1;
uniform sampler2D u_Sampler2;
uniform sampler2D u_Sampler3;
uniform sampler2D u_Sampler4;
uniform int u_whichTexture;
uniform vec3 u_lightPos;
uniform vec3 u_lightDir;
uniform vec3 u_cameraPos;
uniform vec4 u_lightColor;
varying vec4 v_vertPos;
uniform bool u_lighting_on;
uniform bool u_point_light;
void main() {
	if (u_whichTexture == -3){
		gl_FragColor = vec4((v_Normal + 1.0)/2.0, 1.0); // use normal as color
	} else if (u_whichTexture == -2){
		gl_FragColor = u_FragColor;					// use color
	} else if (u_whichTexture == -1){
		gl_FragColor = vec4(v_UV, 1.0, 1.0);		// use UV debug color
	} else if (u_whichTexture == 0){
		gl_FragColor = texture2D(u_Sampler0, v_UV);	// use texture0
	} else if (u_whichTexture == 1){
		gl_FragColor = texture2D(u_Sampler1, v_UV);	// use texture1
	} else if (u_whichTexture == 2){
		gl_FragColor = texture2D(u_Sampler2, v_UV);	// use texture2
	} else if (u_whichTexture == 3){
		gl_FragColor = texture2D(u_Sampler3, v_UV);	// use texture3
	} else if (u_whichTexture == 4){
		gl_FragColor = texture2D(u_Sampler4, v_UV);	// use texture4
	} else{
		gl_FragColor = vec4(1,.2,.2,1);				// error, make it red
	}
	
	if (u_point_light){
		vec3 lightVector = u_lightPos - vec3(v_vertPos);
		float r = length(lightVector);
		
		// calculate n dot l
		vec3 L = normalize(lightVector);
		vec3 N = normalize(v_Normal);
		float nDotL = max(dot(N, L), 0.0);
		
		// reflection
		vec3 R = reflect(-L, N);
		
		// eye
		vec3 E = u_cameraPos - vec3(v_vertPos);
		E = normalize(E);
		
		// specular
		float specular = pow(max(dot(E, R), 0.0), 15.0);
		// diffuse
		vec3 diffuse = vec3(gl_FragColor) * nDotL * 0.7;
		// ambient
		vec3 ambient = vec3(gl_FragColor) * 0.3;
		
		// only change light if lighting is on
		if (u_lighting_on){
			float red = (specular + diffuse[0] + ambient[0])*u_lightColor[0];
			float green = (specular + diffuse[1] + ambient[2])*u_lightColor[1];
			float blue = (specular + diffuse[2] + ambient[2])*u_lightColor[2];
			gl_FragColor = vec4(red, green, blue, 1.0);
		}
	} else{
		float spotlight_limit = 0.94;
		vec3 lightVector = u_lightPos - vec3(v_vertPos);
		float r = length(lightVector);
		
		// calculate n dot l
		vec3 L = normalize(lightVector);
		vec3 N = normalize(v_Normal);
		float nDotL = max(dot(N, L), 0.0);
		
		// reflection
		vec3 R = reflect(-L, N);
		
		// eye
		vec3 E = u_cameraPos - vec3(v_vertPos);
		E = normalize(E);
		
		vec3 diffuse = vec3(0.0, 0.0, 0.0);
		vec3 ambient = vec3(gl_FragColor) * 0.15;
		float specular = 0.0;
		float dotFromDirection = dot(normalize(lightVector), -normalize(u_lightDir));
		if (dotFromDirection >= (spotlight_limit - .1)){
			if (dotFromDirection >= spotlight_limit){
				diffuse = vec3(gl_FragColor) * nDotL;
				if (nDotL > 0.0){
					specular = pow(max(dot(E, R), 0.0), 15.0);
				}
			} else{
				diffuse = vec3(gl_FragColor) * nDotL * ((dotFromDirection - spotlight_limit + 0.1)/0.1);
				if (nDotL > 0.0){
					specular = pow(max(dot(E, R), 0.0), 15.0)* ((dotFromDirection - spotlight_limit + 0.1)/0.1);
				}
			}
			
		} 
		// only change light if lighting is on
		if (u_lighting_on){
			float red = (specular + diffuse[0] + ambient[0])*u_lightColor[0];
			float green = (specular + diffuse[1] + ambient[2])*u_lightColor[1];
			float blue = (specular + diffuse[2] + ambient[2])*u_lightColor[2];
			gl_FragColor = vec4(red, green, blue, 1.0);
		}
	}	
	
}`;

// global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_Size;
let u_NormalMatrix
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_whichTexture;
let u_lightPos;
let u_lightColor;
let u_cameraPos;
let u_lighting_on;
let u_point_light;
let u_Sampler0;	// cobblestone floor
let u_Sampler1;	// hedge maze walls
let u_Sampler2;	// meadow floor
let u_Sampler3;	// lava floor
let u_Sampler4;	// trees skybox

function setUpWebGL(){
	// Retrieve <canvas> element
	canvas = document.getElementById('cnv1');

	// Get the rendering context for WebGL
	//gl = getWebGLContext(canvas);
	gl = canvas.getContext('webgl', {preserveDrawingBuffer: true});
	if (!gl) {
		console.log('Failed to get the rendering context for WebGL');
		return;
	}
	
	gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL(){
	// Initialize shaders
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log('Failed to intialize shaders.');
		return;
	}

	// // Get the storage location of a_Position
	a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	if (a_Position < 0) {
		console.log('Failed to get the storage location of a_Position');
		return;
	}
	
	// // Get the storage location of a_UV
	a_UV = gl.getAttribLocation(gl.program, 'a_UV');
	if (a_UV < 0) {
		console.log('Failed to get the storage location of a_UV');
		return;
	}
	
	// Get the storage location of v_Normal
	a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
	if (a_Normal < 0) {
		console.log('Failed to get the storage location of a_Normal');
		return;
	}

	// Get the storage location of u_FragColor
	u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
	if (!u_FragColor) {
		console.log('Failed to get the storage location of u_FragColor');
		return;
	}
	
	// Get the storage location of u_NormalMatrix
	u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
	if (!u_NormalMatrix){
		console.log('Failed to get the storage location of u_NormalMatrix');
		return;
	}
	
	// Get the storage location of u_ModelMatrix
	u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
	if (!u_ModelMatrix){
		console.log('Failed to get the storage location of u_ModelMatrix');
		return;
	}
	
	// Get the storage location of u_GlobalRotateMatrixMatrix
	u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
	if (!u_ProjectionMatrix){
		console.log('Failed to get the storage location of u_ProjectionMatrix');
		return -1;
	}
	
	// Get the storage location of u_GlobalRotateMatrixMatrix
	u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
	if (!u_ViewMatrix){
		console.log('Failed to get the storage location of u_ViewMatrix');
		return -1;
	}
	
	// Get the storage location of u_GlobalRotateMatrixMatrix
	u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
	if (!u_GlobalRotateMatrix){
		console.log('Failed to get the storage location of u_GlobalRotateMatrix');
		return -1;
	}
	
	// Get the storage location of u_lightPos
	u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
	if (!u_lightPos){
		console.log('Failed to get the storage location of u_lightPos');
		return -1;
	}
	
	// Get the storage location of u_lightDir
	u_lightDir = gl.getUniformLocation(gl.program, 'u_lightDir');
	if (!u_lightDir){
		console.log('Failed to get the storage location of u_lightDir');
		return -1;
	}
	
	// Get the storage location of u_lightColor
	u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
	if (!u_lightColor){
		console.log('Failed to get the storage location of u_lightColor');
		return -1;
	}
	
	// Get the storage location of u_cameraPos
	u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
	if (!u_cameraPos){
		console.log('Failed to get the storage location of u_cameraPos');
		return -1;
	}
	
	// Get the storage location of u_lighting_on
	u_lighting_on = gl.getUniformLocation(gl.program, 'u_lighting_on');
	if (!u_lighting_on){
		console.log('Failed to get the storage location of u_lighting_on');
		return -1;
	}
	
	// Get the storage location of u_point_light
	u_point_light = gl.getUniformLocation(gl.program, 'u_point_light');
	if (!u_point_light){
		console.log('Failed to get the storage location of u_point_light');
		return -1;
	}
	
	// Get the storage location of u_Sampler0
	u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
	if (!u_Sampler0) {
		console.log('Failed to get the storage location of u_Sampler0');
		return false;
	}
	
	// Get the storage location of u_Sampler1
	u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
	if (!u_Sampler1) {
		console.log('Failed to get the storage location of u_Sampler1');
		return false;
	}
	
	// Get the storage location of u_Sampler2
	u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
	if (!u_Sampler2) {
		console.log('Failed to get the storage location of u_Sampler2');
		return false;
	}
	
	// Get the storage location of u_Sampler3
	u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
	if (!u_Sampler3) {
		console.log('Failed to get the storage location of u_Sampler3');
		return false;
	}
	
	// Get the storage location of u_Sampler4
	u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
	if (!u_Sampler4) {
		console.log('Failed to get the storage location of u_Sampler4');
		return false;
	}
	
	// Get the storage location of u_whichTexture
	u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
	if (!u_whichTexture) {
		console.log('Failed to get the storage location of u_whichTexture');
		return false;
	}
	
	var identityM = new Matrix4();
	gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// UI related global variables
let g_cameraAngles = [0, 0, 0];
let g_bodyAngle = 0;
let g_headAngle = 0;
let g_tailAngle = 0;
let g_tailAngleX = 0;
let g_billAngle = 0;
let g_frontLegAngle = 0;
let g_hindLegAngle = 0;
let g_frontFlipperAngle = 0;
let g_hindFlipperAngle = 0;
let g_animation = true;
let g_normals_on = false;
let g_lightPos = [0, 1, -2];
let g_lightDir = [0, -1, 0];
let g_lightColor = [1.0, 1.0, 1.0];
let g_lighting_on = true;
let g_point_light = true;

// create camera control variable
let g_camera;

function addActionsForHtmlUI(){
	// normals on/off buttons
	document.getElementById('normals_on').onclick = function(){g_normals_on = true; renderAllShapes();};
	document.getElementById('normals_off').onclick = function(){g_normals_on = false; renderAllShapes();};
	
	// lighting on/off buttons
	document.getElementById('lighting_on').onclick = function(){g_lighting_on = true; renderAllShapes();};
	document.getElementById('lighting_off').onclick = function(){g_lighting_on = false; renderAllShapes();};
	
	// animations on/off buttons
	document.getElementById('animation_on').onclick = function(){g_animation = true; renderAllShapes();};
	document.getElementById('animation_off').onclick = function(){g_animation = false; renderAllShapes();};

	// swap between using point light and using spot light
	document.getElementById('point_light').onclick = function(){g_point_light = true; renderAllShapes();};
	document.getElementById('spot_light').onclick = function(){g_point_light = false; renderAllShapes();};
	
	// light movement event
	document.getElementById("light_x").addEventListener('mousemove', function() {g_lightPos[0] = this.value/100; renderAllShapes();});
	document.getElementById("light_y").addEventListener('mousemove', function() {g_lightPos[1] = this.value/100; renderAllShapes();});
	document.getElementById("light_z").addEventListener('mousemove', function() {g_lightPos[2] = this.value/100; renderAllShapes();});
	
	// light color sliders
	document.getElementById("light_r").addEventListener('mousemove', function() {g_lightColor[0] = this.value/255.0; renderAllShapes();});
	document.getElementById("light_g").addEventListener('mousemove', function() {g_lightColor[1] = this.value/255.0; renderAllShapes();});
	document.getElementById("light_b").addEventListener('mousemove', function() {g_lightColor[2] = this.value/255.0; renderAllShapes();});
}

function initTextures(n) {
	var image0 = new Image();  // Create the image object
	if (!image0) {
		console.log('Failed to create the image object 0');
		return false;
	}
	// Register the event handler to be called on loading an image
	image0.onload = function(){ sendTexture0toGLSL(n, image0); console.log('loaded texture 0');};
	// Tell the browser to load an image
	image0.src = 'resources/brick_pavement.jpg';
	
	var image1 = new Image();  // Create the image object
	if (!image1) {
		console.log('Failed to create the image object 1');
		return false;
	}
	// Register the event handler to be called on loading an image
	image1.onload = function(){ sendTexture1toGLSL(n, image1); console.log('loaded texture 1');};
	// Tell the browser to load an image
	image1.src = 'resources/hedge.jpg';
	
	var image2 = new Image();  // Create the image object
	if (!image2) {
		console.log('Failed to create the image object 2');
		return false;
	}
	// Register the event handler to be called on loading an image
	image2.onload = function(){ sendTexture2toGLSL(n, image2); console.log('loaded texture 2');};
	// Tell the browser to load an image
	image2.src = 'resources/meadow.jpg';
	
	var image3 = new Image();  // Create the image object
	if (!image3) {
		console.log('Failed to create the image object 3');
		return false;
	}
	// Register the event handler to be called on loading an image
	image3.onload = function(){ sendTexture3toGLSL(n, image3); console.log('loaded texture 3');};
	// Tell the browser to load an image
	image3.src = 'resources/lava.jpg';
	
	var image4 = new Image();  // Create the image object
	if (!image4) {
		console.log('Failed to create the image object 4');
		return false;
	}
	// Register the event handler to be called on loading an image
	image4.onload = function(){ sendTexture4toGLSL(n, image4); console.log('loaded texture 4');};
	// Tell the browser to load an image
	image4.src = 'resources/forest.jpg';

	return true;
}

function sendTexture0toGLSL(n, image) {
	var texture0 = gl.createTexture();   // Create a texture object
	if (!texture0) {
		console.log('Failed to create the texture object');
		return false;
	}
	
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
	// Enable texture unit0
	gl.activeTexture(gl.TEXTURE0);
	// Bind the texture object to the target
	gl.bindTexture(gl.TEXTURE_2D, texture0);

	// Set the texture parameters
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	// Set the texture image
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

	// Set the texture unit 0 to the sampler
	gl.uniform1i(u_Sampler0, 0);
}

function sendTexture1toGLSL(n, image) {
	var texture1 = gl.createTexture();   // Create a texture object
	if (!texture1) {
		console.log('Failed to create the texture object');
		return false;
	}
	
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
	// Enable texture unit1
	gl.activeTexture(gl.TEXTURE1);
	// Bind the texture object to the target
	gl.bindTexture(gl.TEXTURE_2D, texture1);

	// Set the texture parameters
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	// Set the texture image
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

	// Set the texture unit 1 to the sampler
	gl.uniform1i(u_Sampler1, 1);
}

function sendTexture2toGLSL(n, image) {
	var texture2 = gl.createTexture();   // Create a texture object
	if (!texture2) {
		console.log('Failed to create the texture object');
		return false;
	}
	
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
	// Enable texture unit2
	gl.activeTexture(gl.TEXTURE2);
	// Bind the texture object to the target
	gl.bindTexture(gl.TEXTURE_2D, texture2);

	// Set the texture parameters
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	// Set the texture image
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

	// Set the texture unit 2 to the sampler
	gl.uniform1i(u_Sampler2, 2);
}

function sendTexture3toGLSL(n, image) {
	var texture3 = gl.createTexture();   // Create a texture object
	if (!texture3) {
		console.log('Failed to create the texture object');
		return false;
	}
	
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
	// Enable texture unit3
	gl.activeTexture(gl.TEXTURE3);
	// Bind the texture object to the target
	gl.bindTexture(gl.TEXTURE_2D, texture3);

	// Set the texture parameters
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	// Set the texture image
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

	// Set the texture unit 3 to the sampler
	gl.uniform1i(u_Sampler3, 3);
}

function sendTexture4toGLSL(n, image) {
	var texture4 = gl.createTexture();   // Create a texture object
	if (!texture4) {
		console.log('Failed to create the texture object');
		return false;
	}
	
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
	// Enable texture unit4
	gl.activeTexture(gl.TEXTURE4);
	// Bind the texture object to the target
	gl.bindTexture(gl.TEXTURE_2D, texture4);

	// Set the texture parameters
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	// Set the texture image
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

	// Set the texture unit 4 to the sampler
	gl.uniform1i(u_Sampler4, 4);
}

// set up global color dictionary to determine colors for each platypus part
let g_color_set = { "body" : [133/255.0, 80/255.0, 27/255.0, 1.0],
	"head" : [163/255.0, 100/255.0, 36/255.0, 1.0], 
	"eye" : [0.0, 0.0, 0.0, 1.0],
	"nose" : [56/255.0, 47/255.0, 39/255.0, 1.0],
	"bill" : [56/255.0, 47/255.0, 39/255.0, 1.0],
	"tail" : [133/255.0, 80/255.0, 27/255.0, 1.0],
	"leg" : [163/255.0, 100/255.0, 36/255.0, 1.0],
	"flipper" : [56/255.0, 47/255.0, 39/255.0, 1.0], 
	"hat" : [222/255.0, 121/255.0, 27/255.0, 1.0],
	"hat band" : [105/255.0, 50/255.0, 30/255.0, 1.0]
};

function main() {
	
	// set up and connect variables to WebGL
	setUpWebGL();
	connectVariablesToGLSL();
	
	// set the global camera to a new camera object
	g_camera = new Camera();		

	// Add responses for user input
	addActionsForHtmlUI();
	
	// add responses to key presses
	document.onkeydown = keydown;
	
	initTextures(0);
	
	// Specify the color for clearing <canvas>
	gl.clearColor(30/255.0, 126/255.0, 156/255.0, 1.0);

	// Start animation
	requestAnimationFrame(tick);
	
	// render all shapes
	//renderAllShapes();
}


var g_startTime=performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;
function tick(){
	// update current time
	g_seconds = performance.now()/1000.0 - g_startTime;
	//console.log(g_seconds);
	
	// update animation state based on what animations are currently active
	updateAnimationAngles();
	
	// render the current scene
	renderAllShapes();
	
	// go to the next animation frame
	requestAnimationFrame(tick);
}

function updateAnimationAngles(){
	
	// platypus animations
	g_billAngle = 15/2.0 + (15/2.0)*Math.sin(g_seconds);
	g_tailAngle = 5.0*Math.sin(g_seconds + .174);
	g_tailAngleX = 15.0*Math.sin(g_seconds + .174);
	g_frontLegAngle = 70 + 10*Math.sin(8*g_seconds);
	g_frontFlipperAngle = 90*Math.sin(5*g_seconds);
	g_hindLegAngle = 10*Math.sin(2*g_seconds);
	g_hindFlipperAngle = 10*Math.sin(g_seconds);
	g_bodyAngle = 10*Math.sin(g_seconds);
	
	if (g_animation){
		// light animations
		g_lightPos[0] = 2*Math.cos(.5*g_seconds);
		g_lightPos[1] = 1 + Math.cos(g_seconds)*Math.cos(g_seconds);
		g_lightPos[2] = 2*Math.sin(.5*g_seconds);
	} else{
		g_tailAngleX = 0;
	}
}

// event variables
g_platypus_collection = false;
g_portal_reached = false;

function keydown(ev){
	if (ev.keyCode == 65){	// a
		g_camera.moveLeft();
		// if the camera collides with an occupied square, move back
		if (collision() == 1){
			g_camera.moveRight();
		}
	} 
	if (ev.keyCode == 68){	// d
		g_camera.moveRight();
		// if the camera collides with an occupied square, move back
		if (collision() == 1){
			g_camera.moveLeft();
		}
	}
	if (ev.keyCode == 87){	// w
		g_camera.moveForward();
		// if the camera collides with an occupied square, move back
		if (collision() == 1){
			g_camera.moveBackwards();
		}
	}
	if (ev.keyCode == 83){	// s
		g_camera.moveBackwards();
		// if the camera collides with an occupied square, move back
		if (collision() == 1){
			g_camera.moveForward();
		}
	}
	if (ev.keyCode == 81){	// q
		g_camera.rotateCounterClockwise();
	}
	if (ev.keyCode == 69){	// e
		g_camera.rotateClockwise();
	}
	
	renderAllShapes();
}

// checks the map to see if the camera has collided with anything, returns the number of whatever's in the grid square
function collision(){
	return 0;
}

let g_inc = 0;
function renderAllShapes(){
	// Clear <canvas>
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.clear(gl.DEPTH_BUFFER_BIT);
	
	// pass projection matrix
	var projMat = new Matrix4;
	projMat.setPerspective(90, canvas.width/canvas.height, .1, 100);
	gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);
	
	// pass view matrix
	var viewMat = new Matrix4;
	viewMat.setLookAt(g_camera.eye[0],g_camera.eye[1],g_camera.eye[2], 
	g_camera.at[0],g_camera.at[1],g_camera.at[2], 
	g_camera.up[0],g_camera.up[1],g_camera.up[2]);
	gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);
	
	// global rotate matrix is used to rotate the entire model
	var globalRotateMatrix = new Matrix4().rotate(g_cameraAngles[0], 1, 0, 0);
	globalRotateMatrix.rotate(g_cameraAngles[1], 0, 1, 0);
	globalRotateMatrix.rotate(g_cameraAngles[2], 0, 0, 1);
	gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotateMatrix.elements);
	
	// send light position to glsl
	gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
	// send light direction to glsl
	gl.uniform3f(u_lightDir, g_lightDir[0], g_lightDir[1], g_lightDir[2]);
	// send camera position to glsl
	gl.uniform3f(u_cameraPos, g_camera.eye[0], g_camera.eye[1], g_camera.eye[2]);
	// send light color to glsl
	gl.uniform4f(u_lightColor, g_lightColor[0], g_lightColor[1], g_lightColor[2], 1.0);
	
	// send lighting boolean to glsl
	gl.uniform1i(u_lighting_on, g_lighting_on);
	// send point lighting boolean to glsl
	gl.uniform1i(u_point_light, g_point_light);
	
	// draw the light
	var light = new Cube();
	light.moves = false;
	light.color = [g_lightColor[0], g_lightColor[1], g_lightColor[2], 1];
	light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
	light.matrix.scale(-.1,-.1,-.1);
	light.matrix.translate(-.5,-.5,-.5);
	light.renderfast();
	
	// Draw the ground
	var floor = new Cube();
	if (g_normals_on){floor.textureNum = -3;}
	floor.color = [1.0, 0.20, 0.5, 1.0];
	floor.matrix.translate(0, -.75, 0.0);
	floor.matrix.scale(7, 0, 7);
	floor.matrix.translate(-.5, 0, -.5);
	floor.renderfast();
	//floor.render();
	
	// Draw the sky
	var sky = new Cube();
	sky.moves = false;
	if (g_normals_on){sky.textureNum = -3;}
	sky.color = [135/255.0, 206/255.0, 235/255.0, 1.0];
	sky.matrix.scale(-7, -7, -7);
	sky.matrix.translate(-.5, -.5, -.5);
	sky.renderfast();
	//sky.render();
	
	var cubie = new Cube();
	if (g_normals_on){cubie.textureNum = -3;}
	cubie.color = [210/255.0, 132/255.0, 232/255.0, 1.0];
	cubie.matrix.translate(-3, 0, 1);
	cubie.matrix.rotate(180*Math.sin(g_seconds), 0, 1, 0);
	cubie.matrix.translate(-0.5, 0, -0.5)
	cubie.renderfast();
	//cubie.render();
	
	var sp = new Sphere();
	sp.color = [1.0, 1.0, 1.0, 1.0];
	sp.matrix.translate(1, 1, 1);
	if (g_normals_on){sp.textureNum = -3;}
	sp.render();
	
	drawPlatypus(-1.5, 2);
}

function drawPlatypus(map_x, map_y){
	// Render the platypus!
	var body = new Cube();
	if (g_normals_on){body.textureNum = -3;}
	body.color = g_color_set["body"];
	body.matrix.translate(map_x, -.25, map_y);
	body.matrix.rotate(g_bodyAngle, 1, 0, 0);
	body.matrix.translate(0, 0, -.5*.1*2);
	var bodyCoordMatrix = new Matrix4(body.matrix);
	body.matrix.scale(.1*5, .1*2, .1*2);
	body.renderfast();
	
	var head = new Cube();
	if (g_normals_on){head.textureNum = -3;}
	head.color = g_color_set["head"];
	head.matrix = new Matrix4(bodyCoordMatrix);
	head.matrix.translate(-.1*1.5, 0, .1*.25);
	head.matrix.rotate(g_headAngle, 0, 0, 1);
	var headCoordMatrix = new Matrix4(head.matrix);
	head.matrix.scale(.1*2, .1*1.75, .1*1.5);
	head.renderfast();
	
	var left_eye = new Cube();
	if (g_normals_on){left_eye.textureNum = -3;}
	left_eye.color = g_color_set["eye"];
	left_eye.matrix = new Matrix4(headCoordMatrix);
	left_eye.matrix.translate(.1*.3, .1*1.75 - 2*.1*.3 , - .1*.1);
	left_eye.matrix.scale(.1*.3, .1*.3, .1*.1);
	left_eye.renderfast();
	
	var right_eye = new Cube();
	if (g_normals_on){right_eye.textureNum = -3;}
	right_eye.color = g_color_set["eye"];
	right_eye.matrix = new Matrix4(headCoordMatrix);
	right_eye.matrix.translate(.1*.3, .1*1.75 - 2*.1*.3 , .1*1.5);
	right_eye.matrix.scale(.1*.3, .1*.3, .1*.1);
	right_eye.renderfast();
	
	var nose = new Cube();
	if (g_normals_on){nose.textureNum = -3;}
	nose.color = g_color_set["nose"];
	nose.matrix = new Matrix4(headCoordMatrix);
	nose.matrix.translate(-.1*.3, .1*.25, 0);
	var noseCoordMatrix = new Matrix4(nose.matrix);
	nose.matrix.scale(.1*.3, .1*1.25, .1*1.5);
	nose.renderfast();
	
	var top_bill = new Cube();	
	if (g_normals_on){top_bill.textureNum = -3;}
	top_bill.color = g_color_set["bill"];
	top_bill.matrix = new Matrix4(noseCoordMatrix);
	top_bill.matrix.translate(-.1*2, .1*.25 + .1*.75*.5, 0);
	top_bill.matrix.scale(.1*2, .1*.75*.5, .1*1.5);
	top_bill.renderfast();

	var lower_bill = new Cube();
	if (g_normals_on){lower_bill.textureNum = -3;}	
	lower_bill.color = g_color_set["bill"];
	lower_bill.matrix = new Matrix4(noseCoordMatrix);
	lower_bill.matrix.translate(.1*.1, .1*.25 , .1*1.5);
	lower_bill.matrix.rotate(g_billAngle, 0, 0, 1);
	lower_bill.matrix.rotate(180, 0, 1, 0);
	lower_bill.matrix.scale(.1*2.1, .1*.75*.5, .1*1.5);
	lower_bill.renderfast();
	
	var tail = new Cube();
	if (g_normals_on){tail.textureNum = -3;}
	tail.color = g_color_set["tail"];
	tail.matrix = new Matrix4(bodyCoordMatrix);
	tail.matrix.translate(.1*3*1.5, .1*.5 + .5*.1*1, 2*.1*.25 + .5*.1*1);
	tail.matrix.rotate(g_tailAngleX, 1, 0, 0);
	tail.matrix.translate(0, -.5*.1*1, -.5*.1*1);
	tail.matrix.rotate(g_tailAngle, 0, 0, 1);
	tail.matrix.scale(.1*3, .1*1, .1*1);
	tail.renderfast();
	
	var front_left_leg = new Cube();
	if (g_normals_on){front_left_leg.textureNum = -3;}
	front_left_leg.color = g_color_set["leg"];
	front_left_leg.matrix = new Matrix4(bodyCoordMatrix);
	front_left_leg.matrix.translate(.1*.5 + .5*.1*1, 0, -.1*.75);
	front_left_leg.matrix.rotate(g_frontLegAngle, 0, 0, 1);
	front_left_leg.matrix.translate(-.5*.1*1, 0, 0);	// have it so that the leg rotates about its center
	var frontLeftLegCoordMatrix = new Matrix4(front_left_leg.matrix);
	front_left_leg.matrix.scale(.1*1, .1*.2, .1*.75);
	front_left_leg.renderfast();
	
	var front_left_flipper = new Cube();
	if (g_normals_on){front_left_flipper.textureNum = -3;}
	front_left_flipper.color = g_color_set["flipper"];
	front_left_flipper.matrix = new Matrix4(frontLeftLegCoordMatrix);
	front_left_flipper.matrix.translate(0, .1*.2, 0);
	front_left_flipper.matrix.rotate(180 - g_frontFlipperAngle, 1, 0, 0);
	front_left_flipper.matrix.translate(-.1*.25, 0, 0);
	front_left_flipper.matrix.scale(.1*1.5, .1*.2, 2*.1*.75);
	front_left_flipper.renderfast();
	
	var front_right_leg = new Cube();
	if (g_normals_on){front_right_leg.textureNum = -3;}
	front_right_leg.color = g_color_set["leg"];
	front_right_leg.matrix = new Matrix4(bodyCoordMatrix);
	front_right_leg.matrix.translate(.1*.5 + .5*.1*1, 0, .1*2);
	front_right_leg.matrix.rotate(g_frontLegAngle, 0, 0, 1);
	front_right_leg.matrix.translate(-.5*.1*1, 0, 0);	// have it so that the leg rotates about its center
	var frontRightLegCoordMatrix = new Matrix4(front_right_leg.matrix);
	front_right_leg.matrix.scale(.1*1, .1*.2, .1*.75);
	front_right_leg.renderfast();
	
	var front_right_flipper = new Cube();
	if (g_normals_on){front_right_flipper.textureNum = -3;}
	front_right_flipper.color = g_color_set["flipper"];
	front_right_flipper.matrix = new Matrix4(frontRightLegCoordMatrix);
	front_right_flipper.matrix.translate(-.1*.25 + .5*.1*1.5, 0, .1*.75);
	front_right_flipper.matrix.rotate(g_frontFlipperAngle, 1, 0, 0);
	front_right_flipper.matrix.translate(-.5*.1*1.5, 0, 0);
	front_right_flipper.matrix.scale(.1*1.5, .1*.2, 2*.1*.75);
	front_right_flipper.renderfast();
	
	var hind_left_leg = new Cube();
	if (g_normals_on){hind_left_leg.textureNum = -3;}
	hind_left_leg.color = g_color_set["leg"];
	hind_left_leg.matrix = new Matrix4(bodyCoordMatrix);
	hind_left_leg.matrix.translate(.1*5 - 2*.1*.5 + .5*.1*1, 0, -.1*.75);
	hind_left_leg.matrix.rotate(g_hindLegAngle, 0, 0, 1);
	hind_left_leg.matrix.translate(-.5*.1*1, 0, 0);	// have it so that the leg rotates about its center
	var hindLeftLegCoordMatrix = new Matrix4(hind_left_leg.matrix);
	hind_left_leg.matrix.scale(.1*1, .1*.2, .1*.75);
	hind_left_leg.renderfast();
	
	var hind_left_flipper = new Cube();
	if (g_normals_on){hind_left_flipper.textureNum = -3;}
	hind_left_flipper.color = g_color_set["flipper"];
	hind_left_flipper.matrix = new Matrix4(hindLeftLegCoordMatrix);
	hind_left_flipper.matrix.translate(0, .1*.2, 0);
	hind_left_flipper.matrix.rotate(180 - g_hindFlipperAngle, 1, 0, 0);
	hind_left_flipper.matrix.translate(-.1*.25, 0, 0);
	hind_left_flipper.matrix.scale(.1*1.5, .1*.2, 2*.1*.75);
	hind_left_flipper.renderfast();
	
	var hind_right_leg = new Cube();
	if (g_normals_on){hind_right_leg.textureNum = -3;}
	hind_right_leg.color = g_color_set["leg"];
	hind_right_leg.matrix = new Matrix4(bodyCoordMatrix);
	hind_right_leg.matrix.translate(.1*5 - 2*.1*.5 + .5*.1*1, 0, .1*2 );
	hind_right_leg.matrix.rotate(g_hindLegAngle, 0, 0, 1);
	hind_right_leg.matrix.translate(-.5*.1*1, 0, 0);	// have it so that the leg rotates about its center
	var hindRightLegCoordMatrix = new Matrix4(hind_right_leg.matrix);
	hind_right_leg.matrix.scale(.1*1, .1*.2, .1*.75);
	hind_right_leg.renderfast();
	
	var hind_right_flipper = new Cube();
	if (g_normals_on){hind_right_flipper.textureNum = -3;}
	hind_right_flipper.color = g_color_set["flipper"];
	hind_right_flipper.matrix = new Matrix4(hindRightLegCoordMatrix);
	hind_right_flipper.matrix.translate(-.1*.25 + .5*.1*1.5, 0, .1*.75);
	hind_right_flipper.matrix.rotate(g_hindFlipperAngle, 1, 0, 0);
	hind_right_flipper.matrix.translate(-.5*.1*1.5, 0, 0);
	hind_right_flipper.matrix.scale(.1*1.5, .1*.2, 2*.1*.75);
	hind_right_flipper.renderfast();
}