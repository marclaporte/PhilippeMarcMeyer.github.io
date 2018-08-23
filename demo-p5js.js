/*
	x = r sin(Lon) cos(lat)
	y = r sin(Lon) sin(lat)
	z = r cos(Lon)
	
	translated from https://github.com/CodingTrain/website/blob/master/CodingChallenges/CC_026_SuperShape3D/CC_026_SuperShape3D.pde
	in p5.js
*/

var r = 160;
var total = 28;
var starNr = 75;
var globe;
var offset =0;
var auto = true;
var lastRotationX;
var lastRotationY;

 function setup(){
  var cnv = createCanvas(640,480,WEBGL);
 cnv.parent('demoZone');
 cnv.mousePressed(function(){
	 auto = !auto;
 });
 colorMode(RGB);
 frameRate(30);
  _text = createGraphics(640,480);

  _text.fill(245);
  

 globe = [];

 var sign = "*";

 for(var i = 0;i < starNr;i++){
	var rx = random(640); 
	var ry = random(480); 
	var rsize = random(24)+12;
	
	
	if(rsize > 12){
		_text.textSize(rsize);
		_text.text('*', rx, ry);
	}else{

		_text.ellipse(rx,ry,rsize);
	}


	
 }
 _text.filter(ERODE,BLUR); // DILATE ,BLUR ,POSTERIZE,

 globe = [];
	for(var i = 0; i < total+1; i++){
		var lat = map(i,0,total,-HALF_PI, HALF_PI);
		globe.push([]);
		for(var j = 0; j < total+2; j++){
			var lon = map(j,0,total+1, -PI, PI);
			var x = r * sin(lon) * cos(lat);
			var y = r * sin(lon) * sin(lat);
			var z = r * cos(lon);
			globe[i].push(createVector(x,y,z));
		}
	}
 }
 offset=0;
 function draw(){
	// offset++;
	 
  background(0);
  texture(_text);
  plane(640,480);

  orbitControl();

	if(auto){
		lastRotationX = millis() / 4000;
		lastRotationY = millis() / 2000;
		rotateX(lastRotationX);
		rotateY(lastRotationY);
	}else{
		rotateX(lastRotationX);
		rotateY(lastRotationY);
		
	}

	for(var i = 1; i < total+1; i++){
			var hu = map(i, 0, total, 0, 255*6);
			fill((hu + offset)  % 250, 200, 200);
			
		//stroke(255);
		beginShape(TRIANGLE_STRIP);
		for(var j = 0; j < total+2; j++){

			var v1 = globe[i][j];	
			vertex(v1.x,v1.y,v1.z);
			//fill(200, 200, 200);
			var v2 = globe[i-1][j];
			vertex(v2.x,v2.y,v2.z);
		}
		endShape();
	}
 }
 
