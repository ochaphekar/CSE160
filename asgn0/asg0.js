
var canvas = document.getElementById('example');  
var ctx = canvas.getContext('2d');  

function main(){  
   if (!canvas){ 
      console.log('Failed to retrieve the <canvas> element');
      return false; 
   } 
   ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
   ctx.fillRect(0, 0, 400, 400);
}

function drawVector(v, color){
   ctx.beginPath();
   ctx.strokeStyle = color;
   ctx.moveTo(200, 200);
   ctx.lineTo(200 + v.elements[0] * 20, 200 - v.elements[1] * 20);
   ctx.stroke();
}

function handleDrawEvent(){
   ctx.clearRect(0, 0, 400, 400);
   ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
   ctx.fillRect(0, 0, 400, 400);

   var x = document.getElementById('x_coordinate').value;
   var y = document.getElementById('y_coordinate').value;
   var x2 = document.getElementById('x2_coordinate').value;
   var y2 = document.getElementById('y2_coordinate').value;

   var v1 = new Vector3([x, y, 0]);
   drawVector(v1, "red");
   var v2 = new Vector3([x2, y2, 0]);
   drawVector(v2, "blue");
}

function handleDrawOperationEvent(){
   ctx.clearRect(0, 0, canvas.width, canvas.height);
   ctx.fillStyle = 'black'; 
   ctx.fillRect(0, 0, 400, 400);

   var x_coordinate = document.getElementById('x_coordinate').value;
   var y_coordinate = document.getElementById('y_coordinate').value;
   var x2_coordinate = document.getElementById('x2_coordinate').value;
   var y2_coordinate = document.getElementById('y2_coordinate').value;


   var v1 = new Vector3([x_coordinate, y_coordinate, 0.0]);
   drawVector(v1, "red");
   var v2 = new Vector3([x2_coordinate, y2_coordinate, 0.0]);
   drawVector(v2, "blue");
   var op = document.getElementById('opt').value;
   if (op == "Add"){
      v1.add(v2);
      drawVector(v1, "green");
   } 
   else if (op == "Subtract"){
      v1.sub(v2);
      drawVector(v1, "green");
   } 
   else if (op == "Multiply"){
      var scalar = document.getElementById('scalar').value;
      v1.mul(scalar);
      v2.mul(scalar);
      drawVector(v1, "green");
      drawVector(v2, "green");
   } 
   else if (op == "Divide"){
      var scalar = document.getElementById('scalar').value;
      v1.div(scalar);
      v2.div(scalar);
      drawVector(v1, "green");
      drawVector(v2, "green");
   } 
   else if (op == "Magnitude"){
      console.log("Magnitude v1: "+ v1.magnitude());
      console.log("Magnitude v2: "+ v2.magnitude());
   } 
   else if (op == "Normalize"){
      drawVector(v1.normalize(), "green");
      drawVector(v2.normalize(), "green");   
   } 
   else if (op == "Angle Between"){
      angleBetween(v1,v2);
   } 
   else if (op == "Area"){
      areaTriangle(v1, v2);
   }
}
function angleBetween(v1, v2){
   var x = (Vector3.dot(v1,v2));
   var y = v1.magnitude();
   var z = v2.magnitude()
   var angle = Math.acos((x/(y*z))) * (180/Math.PI);
   console.log("Angle: ", angle);
}

function areaTriangle(v1, v2){   
   var x = Vector3.cross(v1, v2).magnitude();
   var area = (x)*(1/2)
   console.log("Area of this triangle: ", area);
}