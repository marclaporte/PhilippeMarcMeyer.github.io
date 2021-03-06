/*
Philippe MEYER pmg.meyer@gmail.com
DATE : 2018-09-28
v 1.0 2018-11-12 : no more animation
*/

var globals = {
	mainHeight : 384,//480
	mainWidth : 384,
	radius : 160,
	baseY : 96, // half radius
	mode : "100",
	angleOffset : 0.2,
	soilAngle : Math.PI/4,
	plantColor : 255,
	backgroundColor : 0,
	soilColor:"#44aa66",
	soilPoints : [],
	baseTrunkSize : 32,
	treeLines : [],
	maxIter : 12,
	childrenAngle : 0.2,
	fr : 34,
	bg : null,
	drawDelay:50,
	weight : [
	  6,5,4,3,2,1
	],
	colors :[
		{r:116,g:73,b:73},
		{r:128,g:64,b:64},
		{r:154,g:78,b:78},
		{r:172,g:89,b:89},
		{r:187,g:106,b:102},
		{r:197,g:137,b:92},
		{r:197,g:137,b:92},
		{r:68,g:146,b:46},
		{r:68,g:146,b:46},
		{r:87,g:186,b:58},
		{r:255,g:108,b:108},
		{r:255,g:255,b:255}
	],	
	defaultColor :  {r:255,g:255,b:255},
	defaultWeight : 1
};

var myLandscape=null;
var myLandscapeSaved = false;
var xOff = 0;
var yOff = 0;
var originX = globals.mainWidth/2;
var originY = globals.mainHeight/2 + globals.baseY;

var message;
var bbox;

function setup() {
    var mode = (globals.mode == "WEBGL") ? WEBGL : P2D;
	var cnv = createCanvas(globals.mainWidth,globals.mainHeight,mode);
    cnv.parent('canvasZone');
	message = "Germination time...";
	frameRate(globals.fr);
    calculateSoil();
	calculateTree(globals.maxIter);
}

function drawSky(){
	var r2 = 10;
	var g2 = 0;
	var b2 = 120;
	
	var r = 120;
	var g = 0;
	var b = 70;
	
	var diffr = r2 - r;	
	var diffg = g2 - g;	
	var diffb = b2 - b;
	
	var minDiff = min([abs(diffr),abs(diffb)]) /2; //,abs(diffg)
	
	diffr = diffr / minDiff;	
	diffg = 0;
	diffb = diffb / minDiff;
	
	var diagonal = Math.floor(Math.sqrt(globals.mainWidth*globals.mainWidth+globals.mainHeight*globals.mainHeight));
	var weight  = Math.floor(diagonal / minDiff) *2.2;
	
	for(var i = minDiff ;i > 0;i--){
	    
		size = i * weight;

		var r3 = Math.floor(r + diffr*i);
		var g3 = Math.floor(g + diffg*i);
		var b3 = Math.floor(b + diffb*i);
		
		stroke(r3,g3,b3,100);
		fill(r3,g3,b3,100);
		ellipse(0, 0, size, size*1.5);
	}
}

function draw() {
	if(myLandscape == null){
		
		background(0);	
		drawSky();
		   
		
		if(frameCount>globals.drawDelay){
			drawSoil();
			drawTree(frameCount-globals.drawDelay);
		}else{
			push();
			textSize(24);
			stroke(255);
			fill(255);
			text(message,originX-100,originY-120);
			pop();
		}
	}else{
		image(myLandscape, 0, 0);
	}
}

function calculateSoil(){
	var xoff = 0;
	var yoff = 0;
	globals.soilPoints = [];
	var nrPoints = Math.floor(globals.mainWidth / 10);
	for(var i = 0 ; i < nrPoints; i++){
		globals.soilPoints.push({
			x :  i * 10 + map(noise(xoff), 0, 1, -6, 6),
			y : originY + map(noise(yoff), 0, 1, -4, 4)
		});
		  xoff += 0.15;
		  yoff += 0.4;
	}

}

function drawSoil(){
	stroke(255,255,255,96);
	for(var i = 0 ; i < globals.soilPoints.length-1; i++){
		if(globals.soilPoints[i+1].x < -15 || globals.soilPoints[i].x > 10){
		line(globals.soilPoints[i].x, globals.soilPoints[i].y,globals.soilPoints[i+1].x, globals.soilPoints[i+1].y);
		}
	}
}

function calculateTree(maxRounds){
	globals.treeLines.length = 0;
	var round = 0;
	var start = {x:0,y:30};
	calculateBranch(0,maxRounds,start,PI/2);
}

function calculateBranch(round,maxRounds,start,angle){
	var branch = {round : round,start : start};
	var len = globals.baseTrunkSize;
	var ratio = Math.pow(0.9,round+1);
	var end = {};
	// create the branch
	len = Math.floor(ratio * len * random(0.8,1.3) +0.5);
	end.x = start.x+cos(angle)*len;
	end.y = start.y-sin(angle)*len;
	branch.end = end;
	branch.len = len;
	globals.treeLines.push(branch);
	round ++;
	// create two children branch
	if(round < maxRounds){
		calculateBranch(round,maxRounds,end,angle+globals.childrenAngle);
		calculateBranch(round,maxRounds,end,angle-globals.childrenAngle);
	}
}

function drawTree(fcount){
	stroke(255);
	depth = Math.round(fcount / 10);
		if(depth > globals.maxIter -1) {
			depth = globals.maxIter -1 ;
		}
	
		var round = 0;
		while(round <= depth){
			var color = round < globals.colors.length ? globals.colors[round] : globals.defaultColor;
			var weight = round < globals.weight.length ? globals.weight[round] : globals.defaultWeight;
			var tree = globals.treeLines.filter(function(x){
				return x.round == round;
			});
			
			var diff = depth - round;
			
			if(weight > depth) weight = depth+1;
			
			fill(color.r,color.g,color.b,100);
			stroke(color.r,color.g,color.b,95);
			
			tree.forEach(function(dash,i){
				if(diff > 4)
				 ellipseLine(dash,weight); // Draw the line with continuous points is nicer
				else
				 line(dash.start.x+originX,dash.start.y+originY,dash.end.x+originX,dash.end.y+originY); // too tiny to notice the difference son we choose the fastest path
			});
			
			if(!myLandscapeSaved && round == globals.maxIter -1){
				myLandscapeSaved = true;
				saveFrames('out', 'png', 1, globals.fr, function(data) {
					if(data.length >0){
					var imgData = data[0].imageData;
					  myLandscape = loadImage(imgData);
					}
				});
			}
			round++;
		}

}


function ellipseLine(dash,weight){
	var nrPoints = dash.len;
	var xDiff = dash.end.x - dash.start.x ;
	var yDiff = dash.end.y - dash.start.y ;
	var len = Math.floor(Math.sqrt(xDiff*xDiff + yDiff*yDiff));
	
	xDiff = xDiff/len;
	yDiff =  yDiff/len;
	
	var x = dash.start.x;
	var y = dash.start.y;
	var extra = dash.round == 0 ? weight : 0;
	
	for(var i = 0; i < nrPoints;i++){
		 y+= yDiff;
		 x+= xDiff;
		ellipse(x+originX,y+originY,weight+extra+1,weight+extra);
		if(extra > 0 && i% 3 == 0) extra--;
	}
	ellipse(dash.end.x+originX,dash.end.y+originY,weight,weight);
}

