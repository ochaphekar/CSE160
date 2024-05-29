class Cube {
    constructor(){
        this.type = "cube";
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = -2;

        this.rgba = null;

        this.vertices = null;
        this.uv = null;
        this.colors = null;

        this.vertexBuffer = null;
        this.uvBuffer = null;
        this.colorBuffer = null;

    }

    generateVertices(){
        this.vertices = new Float32Array([
            0,0,0,  1,1,0,  1,0,0,
            0,0,0,  1,1,0,  0,1,0,
            0,1,0,  0,1,1,  1,1,1,
            0,1,0,  1,1,1,  1,1,0,
            0,0,1,  0,1,1,  1,1,1,
            0,0,1,  1,1,1,  1,0,1,
            0,0,0,  0,0,1,  0,1,1,
            0,0,0,  0,1,1,  0,1,0,
            1,0,0,  1,1,0,  1,1,1,
            1,0,0,  1,1,1,  1,0,1,
            0,0,0,  1,0,0,  1,0,1,
            0,0,0,  1,0,1,  0,0,1
        ]);

        this.uv = new Float32Array([
            1,0,  0,1,  1,1,
            1,0,  0,1,  0,0,
            0,1,  0,0,  1,0,
            0,1,  1,0,  1,1,
            0,0,  0,1,  1,1,
            0,0,  1,1,  1,0,
            0,0,  1,0,  1,1,
            0,0,  1,1,  1,0,
            1,0,  1,1,  0,1,
            1,0,  0,1,  0,0,
            0,0,  1,0,  1,1,
            0,0,  1,1,  0,1
        ]);

        this.colors = new Float32Array([
            this.rgba[0], this.rgba[1], this.rgba[2], this.rgba[3],
            this.rgba[0], this.rgba[1], this.rgba[2], this.rgba[3],
            this.rgba[0], this.rgba[1], this.rgba[2], this.rgba[3],
            this.rgba[0], this.rgba[1], this.rgba[2], this.rgba[3],
            this.rgba[0], this.rgba[1], this.rgba[2], this.rgba[3],
            this.rgba[0], this.rgba[1], this.rgba[2], this.rgba[3],

            this.rgba[0]*0.9, this.rgba[1]*0.9, this.rgba[2]*0.9, this.rgba[3],
            this.rgba[0]*0.9, this.rgba[1]*0.9, this.rgba[2]*0.9, this.rgba[3],
            this.rgba[0]*0.9, this.rgba[1]*0.9, this.rgba[2]*0.9, this.rgba[3],
            this.rgba[0]*0.9, this.rgba[1]*0.9, this.rgba[2]*0.9, this.rgba[3],
            this.rgba[0]*0.9, this.rgba[1]*0.9, this.rgba[2]*0.9, this.rgba[3],
            this.rgba[0]*0.9, this.rgba[1]*0.9, this.rgba[2]*0.9, this.rgba[3],

            this.rgba[0]*0.8, this.rgba[1]*0.8, this.rgba[2]*0.8, this.rgba[3],
            this.rgba[0]*0.8, this.rgba[1]*0.8, this.rgba[2]*0.8, this.rgba[3],
            this.rgba[0]*0.8, this.rgba[1]*0.8, this.rgba[2]*0.8, this.rgba[3],
            this.rgba[0]*0.8, this.rgba[1]*0.8, this.rgba[2]*0.8, this.rgba[3],
            this.rgba[0]*0.8, this.rgba[1]*0.8, this.rgba[2]*0.8, this.rgba[3],
            this.rgba[0]*0.8, this.rgba[1]*0.8, this.rgba[2]*0.8, this.rgba[3],

            this.rgba[0]*0.7, this.rgba[1]*0.7, this.rgba[2]*0.7, this.rgba[3],
            this.rgba[0]*0.7, this.rgba[1]*0.7, this.rgba[2]*0.7, this.rgba[3],
            this.rgba[0]*0.7, this.rgba[1]*0.7, this.rgba[2]*0.7, this.rgba[3],
            this.rgba[0]*0.7, this.rgba[1]*0.7, this.rgba[2]*0.7, this.rgba[3],
            this.rgba[0]*0.7, this.rgba[1]*0.7, this.rgba[2]*0.7, this.rgba[3],
            this.rgba[0]*0.7, this.rgba[1]*0.7, this.rgba[2]*0.7, this.rgba[3],

            this.rgba[0]*0.6, this.rgba[1]*0.6, this.rgba[2]*0.6, this.rgba[3],
            this.rgba[0]*0.6, this.rgba[1]*0.6, this.rgba[2]*0.6, this.rgba[3],
            this.rgba[0]*0.6, this.rgba[1]*0.6, this.rgba[2]*0.6, this.rgba[3],
            this.rgba[0]*0.6, this.rgba[1]*0.6, this.rgba[2]*0.6, this.rgba[3],
            this.rgba[0]*0.6, this.rgba[1]*0.6, this.rgba[2]*0.6, this.rgba[3],
            this.rgba[0]*0.6, this.rgba[1]*0.6, this.rgba[2]*0.6, this.rgba[3],
            
            this.rgba[0]*0.5, this.rgba[1]*0.5, this.rgba[2]*0.5, this.rgba[3],
            this.rgba[0]*0.5, this.rgba[1]*0.5, this.rgba[2]*0.5, this.rgba[3],
            this.rgba[0]*0.5, this.rgba[1]*0.5, this.rgba[2]*0.5, this.rgba[3],
            this.rgba[0]*0.5, this.rgba[1]*0.5, this.rgba[2]*0.5, this.rgba[3],
            this.rgba[0]*0.5, this.rgba[1]*0.5, this.rgba[2]*0.5, this.rgba[3],
            this.rgba[0]*0.5, this.rgba[1]*0.5, this.rgba[2]*0.5, this.rgba[3]
        ]);

    }

    render() {
        this.rgba = this.color;

        this.rgba[0] = this.rgba[0] / 255.0;
        this.rgba[1] = this.rgba[1] / 255.0;
        this.rgba[2] = this.rgba[2] / 255.0;
        
        gl.uniform1i(u_whichTexture, this.textureNum);
        // console.log(this.textureNum)
        
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        if(this.vertices == null){
            this.generateVertices();
        }

        if(this.vertexBuffer == null){
            this.vertexBuffer = gl.createBuffer();
            if (!this.vertexBuffer) {
                console.log('Failed to create the buffer object');
                return -1;
              }
        }
      
        // Bind the buffer object to target
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        // Write date into the buffer object
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
        
        // Assign the buffer object to a_Position variable
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
      
        // Enable the assignment to a_Position variable
        gl.enableVertexAttribArray(a_Position);

        if(this.uvBuffer == null){
            this.uvBuffer = gl.createBuffer();
            if (!this.uvBuffer) {
                console.log('Failed to create the buffer object');
                return -1;
            }
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    
        gl.bufferData(gl.ARRAY_BUFFER, this.uv, gl.DYNAMIC_DRAW);
    
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    
        gl.enableVertexAttribArray(a_UV);

        if(this.colorBuffer == null){
            this.colorBuffer = gl.createBuffer();
            if (!this.colorBuffer) {
                console.log('Failed to create the buffer object');
                return -1;
            }
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);

        gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);

        gl.vertexAttribPointer(u_FragColor, 4, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(u_FragColor);

      
        gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length/3);
    }
}

function drawTriangle3DUV(vertices, uv){
    var n = 3;

    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
  
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    
    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  
    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);


    var uvBuffer = gl.createBuffer();
    if (!uvBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);

    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(a_UV);
  
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangle3D(vertices) {
    var n = 3; // The number of vertices
  
    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
  
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    
    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  
    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);
  
    gl.drawArrays(gl.TRIANGLES, 0, n);
  }
