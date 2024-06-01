class Cube{
	constructor(){
		this.type = 'cube';
		this.color = [1.0, 1.0, 1.0, 1.0];
		//this.size = 1.0;
		this.matrix = new Matrix4();
		this.normalMat = new Matrix4();
		this.moves = true;
		this.textureNum = -2;
	}
	
	render(){
		//var xy = this.position;
		var rgba = this.color;
		//var size = this.size;

		// pass in the texture mode used
		gl.uniform1i(u_whichTexture, this.textureNum);
		
		// Pass the color of a point to u_FragColor variable
		gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
		
		// pass the cube's matrix to u_ModelMatrix attribute
		gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
		
		if (this.moves){
			// calculate this cube's normal matrix and pass it to u_NormalMatrix
			this.normalMat = this.normalMat.setInverseOf(this.matrix).transpose();
			gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMat.elements);
		} else {
			// if the object doesn't move, don't calculate a normal matrix for it
			gl.uniformMatrix4fv(u_NormalMatrix, false, new Matrix4());
		}
		
		// Front of cube
		drawTriangle3DUVNormal([0.0,0.0,0.0, 1.0,1.0,0.0, 1.0,0.0,0.0], 
			[0,0, 1,1, 1,0], [0,0,-1, 0,0,-1, 0,0,-1]);
		drawTriangle3DUVNormal([0.0,0.0,0.0, 0.0,1.0,0.0, 1.0,1.0,0.0], 
			[0,0, 0,1, 1,1], [0,0,-1, 0,0,-1, 0,0,-1]);
		
		// Back of cube
		//gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
		drawTriangle3DUVNormal([0.0,0.0,1.0, 1.0,1.0,1.0, 1.0,0.0,1.0], 
			[0,0, 1,1, 1,0], [0,0,1, 0,0,1, 0,0,1]);
		drawTriangle3DUVNormal([0.0,0.0,1.0, 0.0,1.0,1.0, 1.0,1.0,1.0], 
			[0,0, 0,1, 1,1], [0,0,1, 0,0,1, 0,0,1]);
		
		// Left side of cube
		//gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.8, rgba[2]*.8, rgba[3]);
		drawTriangle3DUVNormal([0.0,0.0,1.0, 0.0,1.0,0.0, 0.0,0.0,0.0], 
			[0,0, 1,1, 1,0], [-1,0,0, -1,0,0, -1,0,0]);
		drawTriangle3DUVNormal([0.0,0.0,1.0, 0.0,1.0,1.0, 0.0,1.0,0.0], 
			[0,0, 0,1, 1,1], [-1,0,0, -1,0,0, -1,0,0]);
		
		// Right side of cube
		//gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.8, rgba[2]*.8, rgba[3]);
		drawTriangle3DUVNormal([1.0,0.0,1.0, 1.0,1.0,0.0, 1.0,0.0,0.0], 
			[0,0, 1,1, 1,0], [1,0,0, 1,0,0, 1,0,0]);
		drawTriangle3DUVNormal([1.0,0.0,1.0, 1.0,1.0,1.0, 1.0,1.0,0.0], 
			[0,0, 0,1, 1,1], [1,0,0, 1,0,0, 1,0,0]);
		
		// Top of cube 
		//gl.uniform4f(u_FragColor, rgba[0]*1.0, rgba[1]*1.0, rgba[2]*1.0, rgba[3]);
		drawTriangle3DUVNormal([0.0,1.0,0.0, 1.0,1.0,1.0, 1.0,1.0,0.0], 
			[0,0, 1,1, 1,0], [0,1,0, 0,1,0, 0,1,0]);
		drawTriangle3DUVNormal([0.0,1.0,0.0, 0.0,1.0,1.0, 1.0,1.0,1.0], 
			[0,0, 0,1, 1,1], [0,1,0, 0,1,0, 0,1,0]);
		
		// Bottom of cube 
		//gl.uniform4f(u_FragColor, rgba[0]*.5, rgba[1]*.7, rgba[2]*.7, rgba[3]);
		drawTriangle3DUVNormal([0.0,0.0,0.0, 1.0,0.0,1.0, 1.0,0.0,0.0], 
			[0,0, 1,1, 1,0], [0,-1,0, 0,-1,0, 0,-1,0]);
		drawTriangle3DUVNormal([0.0,0.0,0.0, 0.0,0.0,1.0, 1.0,0.0,1.0], 
			[0,0, 0,1, 1,1], [0,-1,0, 0,-1,0, 0,-1,0]);
	}
	
	renderfast(){
		//var xy = this.position;
		var rgba = this.color;
		//var size = this.size;

		// pass in the texture mode used
		gl.uniform1i(u_whichTexture, this.textureNum);
		
		// Pass the color of a point to u_FragColor variable
		//gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
		
		// pass the cube's matrix to u_ModelMatrix attribute
		gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
		
		if (this.moves){
			// calculate this cube's normal matrix and pass it to u_NormalMatrix
			this.normalMat.setInverseOf(this.matrix).transpose();
			gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMat.elements);
		} else {
			// if the object doesn't move, don't calculate a normal matrix for it
			let temp = new Matrix4()
			gl.uniformMatrix4fv(u_NormalMatrix, false, temp.elements);
		}
		
		// all cube sides have the same color
		gl.uniform4f(u_FragColor, rgba[0]*1.0, rgba[1]*1.0, rgba[2]*1.0, rgba[3]*1.0);
		
		var all_verts = [];
		var all_uv = [];
		var all_norm = [];
		
		// Front of cube
		all_verts = all_verts.concat([0.0,0.0,0.0, 1.0,1.0,0.0, 1.0,0.0,0.0]);
		all_uv = all_uv.concat([0,0, 1,1, 1,0]);
		all_norm = all_norm.concat([0,0,-1, 0,0,-1, 0,0,-1]);
		all_verts = all_verts.concat([0.0,0.0,0.0, 0.0,1.0,0.0, 1.0,1.0,0.0]);
		all_uv = all_uv.concat([0,0, 0,1, 1,1]);
		all_norm = all_norm.concat([0,0,-1, 0,0,-1, 0,0,-1]);
		
		// Back of cube
		all_verts = all_verts.concat([0.0,0.0,1.0, 1.0,1.0,1.0, 1.0,0.0,1.0]);
		all_uv = all_uv.concat([0,0, 1,1, 1,0]);
		all_norm = all_norm.concat([0,0,1, 0,0,1, 0,0,1]);
		all_verts = all_verts.concat([0.0,0.0,1.0, 0.0,1.0,1.0, 1.0,1.0,1.0]);
		all_uv = all_uv.concat([0,0, 0,1, 1,1]);
		all_norm = all_norm.concat([0,0,1, 0,0,1, 0,0,1]);
		
		// Left side of cube
		all_verts = all_verts.concat([0.0,0.0,1.0, 0.0,1.0,0.0, 0.0,0.0,0.0]);
		all_uv = all_uv.concat([0,0, 1,1, 1,0]);
		all_norm = all_norm.concat([-1,0,0, -1,0,0, -1,0,0]);
		all_verts = all_verts.concat([0.0,0.0,1.0, 0.0,1.0,1.0, 0.0,1.0,0.0]);
		all_uv = all_uv.concat([0,0, 0,1, 1,1]);
		all_norm = all_norm.concat([-1,0,0, -1,0,0, -1,0,0]);
		
		// Right side of cube
		all_verts = all_verts.concat([1.0,0.0,1.0, 1.0,1.0,0.0, 1.0,0.0,0.0]);
		all_uv = all_uv.concat([0,0, 1,1, 1,0]);
		all_norm = all_norm.concat([1,0,0, 1,0,0, 1,0,0]);
		all_verts = all_verts.concat([1.0,0.0,1.0, 1.0,1.0,1.0, 1.0,1.0,0.0]);
		all_uv = all_uv.concat([0,0, 0,1, 1,1]);
		all_norm = all_norm.concat([1,0,0, 1,0,0, 1,0,0]);
		
		// Top of cube 
		all_verts = all_verts.concat([0.0,1.0,0.0, 1.0,1.0,1.0, 1.0,1.0,0.0]);
		all_uv = all_uv.concat([0,0, 1,1, 1,0]);
		all_norm = all_norm.concat([0,1,0, 0,1,0, 0,1,0]);
		all_verts = all_verts.concat([0.0,1.0,0.0, 0.0,1.0,1.0, 1.0,1.0,1.0]);
		all_uv = all_uv.concat([0,0, 0,1, 1,1]);
		all_norm = all_norm.concat([0,1,0, 0,1,0, 0,1,0]);
		
		// Bottom of cube 
		all_verts = all_verts.concat([0.0,0.0,0.0, 1.0,0.0,1.0, 1.0,0.0,0.0]);
		all_uv = all_uv.concat([0,0, 1,1, 1,0]);
		all_norm = all_norm.concat([0,-1,0, 0,-1,0, 0,-1,0]);
		all_verts = all_verts.concat([0.0,0.0,0.0, 0.0,0.0,1.0, 1.0,0.0,1.0]);
		all_uv = all_uv.concat([0,0, 0,1, 1,1]);
		all_norm = all_norm.concat([0,-1,0, 0,-1,0, 0,-1,0]);
		
		drawTriangle3DUVNormal(all_verts, all_uv, all_norm);
	}
}