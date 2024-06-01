class Camera{
	constructor(){
		this.type = 'camera';
		this.eye = [0, 0, -2];
		this.at = [0, 0, 100];
		this.up = [0, 1, 0];
		
	}
	
	moveForward(){
		// create vectors from camera arrays
		var at_vec = new Vector3([this.at[0],this.at[1],this.at[2]]);
		var eye_vec = new Vector3([this.eye[0],this.eye[1],this.eye[2]]);
		var d = new Vector3();
		
		// create and normalize direction vector
		d.set(at_vec.sub(eye_vec));
		d = d.normalize();
		// only move 1/2 square at a time
		d.div(2);
		
		// reset at_vec, then add direction vector to both at and eye
		at_vec = new Vector3([this.at[0],this.at[1],this.at[2]]);
		at_vec.add(d);
		eye_vec.add(d);
		this.at = at_vec.elements;
		this.eye = eye_vec.elements;
	}
	
	moveBackwards(){
		// create vectors from camera arrays
		var at_vec = new Vector3([this.at[0],this.at[1],this.at[2]]);
		var eye_vec = new Vector3([this.eye[0],this.eye[1],this.eye[2]]);
		var d = new Vector3();
		
		// create and normalize direction vector
		d.set(at_vec.sub(eye_vec));
		d = d.normalize();
		// only move 1/2 square at a time
		d.div(2);
		
		// reset at_vec, then subtract direction vector from both at and eye
		at_vec = new Vector3([this.at[0],this.at[1],this.at[2]]);
		at_vec.sub(d);
		eye_vec.sub(d);
		this.at = at_vec.elements;
		this.eye = eye_vec.elements;
	}
	
	moveLeft(){
		var at_vec = new Vector3([this.at[0],this.at[1],this.at[2]]);
		var eye_vec = new Vector3([this.eye[0],this.eye[1],this.eye[2]]);
		var up_vec = new Vector3([this.up[0],this.up[1],this.up[2]]);
		var d = new Vector3();
		
		d.set(at_vec.sub(eye_vec));
		d.normalize();
		var left = Vector3.cross(d, up_vec);
		left.normalize();
		// only move 1/2 square at a time
		left.div(2);
		
		at_vec = new Vector3([this.at[0],this.at[1],this.at[2]]);
		at_vec.sub(left);
		eye_vec.sub(left);
		this.at = at_vec.elements;
		this.eye = eye_vec.elements;
	}
	
	moveRight(){
		var at_vec = new Vector3([this.at[0],this.at[1],this.at[2]]);
		var eye_vec = new Vector3([this.eye[0],this.eye[1],this.eye[2]]);
		var up_vec = new Vector3([this.up[0],this.up[1],this.up[2]]);
		var d = new Vector3();
		
		d.set(at_vec.sub(eye_vec));
		d.normalize();
		var left = Vector3.cross(d, up_vec);
		left.normalize();
		// only move 1/2 square at a time
		left.div(2);
		
		at_vec = new Vector3([this.at[0],this.at[1],this.at[2]]);
		at_vec.add(left);
		eye_vec.add(left);
		this.at = at_vec.elements;
		this.eye = eye_vec.elements;
	}
	
	rotateCounterClockwise(){
		var at_vec = new Vector3([this.at[0],this.at[1],this.at[2]]);
		var eye_vec = new Vector3([this.eye[0],this.eye[1],this.eye[2]]);
		var d = new Vector3();
		d.set(at_vec.sub(eye_vec));
		var x = d.elements[0];
		var y = d.elements[1]
		var z = d.elements[2];
		
		// rotate about the y axis by 5 degrees
		d.elements[0] = x*Math.cos((5*Math.PI)/180) + z*Math.sin((5*Math.PI)/180);
		d.elements[1] = y;
		d.elements[2] = -x*Math.sin((5*Math.PI)/180) + z*Math.cos((5*Math.PI)/180);
		at_vec.set(eye_vec.add(d));
		this.at = at_vec.elements;
	}
	
	rotateClockwise(){
		var at_vec = new Vector3([this.at[0],this.at[1],this.at[2]]);
		var eye_vec = new Vector3([this.eye[0],this.eye[1],this.eye[2]]);
		var d = new Vector3();
		d.set(at_vec.sub(eye_vec));
		var x = d.elements[0];
		var y = d.elements[1]
		var z = d.elements[2];
		
		// rotate about the y axis by - 5 degrees
		d.elements[0] = x*Math.cos(-(5*Math.PI)/180) + z*Math.sin(-(5*Math.PI)/180);
		d.elements[1] = y;
		d.elements[2] = -x*Math.sin(-(5*Math.PI)/180) + z*Math.cos(-(5*Math.PI)/180);
		at_vec.set(eye_vec.add(d));
		this.at = at_vec.elements;
	}
}