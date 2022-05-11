"use strict";

var canvas;
var gl;

var numTimesToSubdivide = 6;

var index = 0;

var bool = true;
var copperbool = false;
var jadebool = false;
var pewterbool = false;
var big = false;
var uup = true;
var go = false;
var stop = true;
var a = 0;
var increment = 10;
var ceiling = 1;
var Lceiling = -1;
var floor = 3;
var Lfloor = -3;
var run = 0;
var run1 = 0;
var run2 = 0;
var run3 = 0;

var pointsArray = [];
var normalsArray = [];

var near = -10;
var far = 10;
var radius = 1.5;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var left = -3.0;
var right = 3.0;
var ytop = 3.0;
var bottom = -3.0;

var va = vec4(0.0, 0.0, -1.0, 1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333, 1);

var lightPosition = vec4(0.6, 0.6, 0.6, 0.0 );

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialDiffuse = vec4( 0.5, 0.5, 0.5, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 12.8;

//copper
var lightAmbientT = vec4( 0.19125, 0.0735, 0.0225, 1 );
var lightDiffuseT = vec4( 0.7038, 0.27048, 0.0828, 1 );
var lightSpecularT = vec4( 0.256777, 0.137622, 0.086014, 1 );
var materialAmbientT = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuseT = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecularT = vec4( 1.0, 1.0, 1.0, 1.0 );

//JADE
var lightAmbientJ = vec4( 0.135, 0.2225, 0.1575, 0.95 );
var lightDiffuseJ = vec4( 0.54, 0.89, 0.63, 0.95 );
var lightSpecularJ = vec4( 0.316228, 0.316228, 0.316228, 0.95 );
var materialAmbientJ = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuseJ = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecularJ = vec4( 1.0, 1.0, 1.0, 1.0 );

//pewter
var lightAmbientP = vec4( 0.105882, 0.058824, 0.113725, 1 );
var lightDiffuseP = vec4( 0.427451, 0.470588, 0.541176, 1 );
var lightSpecularP = vec4( 0.333333, 0.333333, 0.521569, 1 );
var materialAmbientP = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuseP = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecularP = vec4( 1.0, 1.0, 1.0, 1.0 );

var ambientColor, diffuseColor, specularColor;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var normalMatrix, normalMatrixLoc;

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

function triangle(a, b, c) {

     var t1 = subtract(b, a);
     var t2 = subtract(c, a);
     var normal = normalize(cross(t2, t1));
     normal = vec4(normal);

     normalsArray.push(normal);
     normalsArray.push(normal);
     normalsArray.push(normal);

     pointsArray.push(a);
     pointsArray.push(b);
     pointsArray.push(c);

     index += 3;
}


function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {

        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);

        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);

        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else {
        triangle( a, b, c );
    }
}


function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);
    
    var ambientProductT = mult(lightAmbientT, materialAmbientT);
    var diffuseProductT = mult(lightDiffuseT, materialDiffuseT);
    var specularProductT = mult(lightSpecularT, materialSpecularT);
    
    var ambientProductJ = mult(lightAmbientJ, materialAmbientJ);
    var diffuseProductJ = mult(lightDiffuseJ, materialDiffuseJ);
    var specularProductJ = mult(lightSpecularJ, materialSpecularJ);
    
    var ambientProductP = mult(lightAmbientP, materialAmbientP);
    var diffuseProductP = mult(lightDiffuseP, materialDiffuseP);
    var specularProductP = mult(lightSpecularP, materialSpecularP);

    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
    
    //buttons
    //top layer
    document.getElementById("up").onclick = function(){
		lightPosition[1] += 0.1;
		init();
	};
	document.getElementById("down").onclick = function(){
		lightPosition[1] -= 0.1;
		init();
	};
	document.getElementById("left").onclick = function(){
		lightPosition[0] -= 0.1;
		init();
	};
	document.getElementById("right").onclick = function(){
		lightPosition[0] += 0.1;
		init();
	};
	document.getElementById("dim").onclick = function(){
		materialShininess += 3;
		init();
	};
	document.getElementById("brighten").onclick = function(){
		if (materialShininess >= 1){
		
		}else{
			
		}
		materialShininess -= 3;
		init();
	};
	
	//middle layer
	document.getElementById("copper").onclick = function(){
		gl.uniform4fv( gl.getUniformLocation(program,
       		"ambientProduct"),flatten(ambientProductT) );
    	gl.uniform4fv( gl.getUniformLocation(program,
       		"diffuseProduct"),flatten(diffuseProductT) );
    	gl.uniform4fv( gl.getUniformLocation(program,
       		"specularProduct"),flatten(specularProductT) );
       	copperbool = true;
       	jadebool = false;
       	pewterbool = false;
	};
	
	document.getElementById("jade").onclick = function(){
		gl.uniform4fv( gl.getUniformLocation(program,
       		"ambientProduct"),flatten(ambientProductJ) );
    	gl.uniform4fv( gl.getUniformLocation(program,
       		"diffuseProduct"),flatten(diffuseProductJ) );
    	gl.uniform4fv( gl.getUniformLocation(program,
       		"specularProduct"),flatten(specularProductJ) );
       	jadebool = true;
       	copperbool = false;
       	pewterbool = false;
	};
	
	document.getElementById("pewter").onclick = function(){
		gl.uniform4fv( gl.getUniformLocation(program,
       		"ambientProduct"),flatten(ambientProductP) );
    	gl.uniform4fv( gl.getUniformLocation(program,
       		"diffuseProduct"),flatten(diffuseProductP) );
    	gl.uniform4fv( gl.getUniformLocation(program,
       		"specularProduct"),flatten(specularProductP) );
       	pewterbool = true;
       	copperbool = false;
       	jadebool = false;
	};
	
	document.getElementById("pulse").onclick = function(){
		lightDiffuse[0] += 1;
		materialDiffuse[0] += 1;
	};
	
	document.getElementById("reset").onclick = function(){
		gl.uniform4fv( gl.getUniformLocation(program,
       		"ambientProduct"),flatten(ambientProduct) );
    	gl.uniform4fv( gl.getUniformLocation(program,
       		"diffuseProduct"),flatten(diffuseProduct) );
   	    gl.uniform4fv( gl.getUniformLocation(program,
       		"specularProduct"),flatten(specularProduct) );
    	gl.uniform4fv( gl.getUniformLocation(program,
       		"lightPosition"),flatten(lightPosition) );
    	gl.uniform1f( gl.getUniformLocation(program,
       		"shininess"),materialShininess );
       	bool = true;
       	pewterbool = false;
       	copperbool = false;
       	jadebool = false;
	};

	//bottom layer
	document.getElementById("increase").onclick = function(){
        numTimesToSubdivide++;
        index = 0;
        pointsArray = [];
        normalsArray = [];
        init();
    };
    document.getElementById("decrease").onclick = function(){
        numTimesToSubdivide--;
        index = 0;
        pointsArray = [];
        normalsArray = [];
        init();
    };
    

    document.getElementById("balloon").onclick = function(){
    	/*
    	if(go == false){
    		bigger();
    	}
    	
    	if (a < 10){
    	left -= -.1;
 		right -= .1;
		ytop -= .1;
 		bottom -= -.1;
    	}
    	a++;
    	*/
    	
	var interval = setInterval(function(){ 
    			left += 0.2;
    			bottom += 0.2;
    			right += -0.2;
				ytop += -0.2;
    			run++;
    			if ( run == 10 ){
    				clearInterval(interval);
    				smaller();
				}
				
		 	}, 300);
    	/*
    	if( go == false ){
    	console.log(go);
    		var left = -3.0;
			var right = 3.0;
			var ytop = 3.0;
			var bottom = -3.0;
			init();
    		
    	}
    	*/
    	//init();
    };
    

    /*
    function bigger() {
    console.log(go);
    	var interval = setInterval(function(){ 
    			left += 0.2;
    			bottom += 0.2;
    			run++;
    			if ( run == 10 ){
    				clearInterval(interval);
    				if ( go == false ) {
    					//console.log(go);
    					smaller();
    				} 
    				if (go == true ){
    					normal();
    				}
				}
			
		 	}, 300);
		 	run = run - run;
		 	
		var interval1 = setInterval(function(){ 
				right += -0.2;
				ytop += -0.2;
				run1++;
    			if ( run1 == 10 ){
    				clearInterval(interval1);
    				if (go == true ){
    					normal();
    				}
    			}
    			
		 	}, 300);
		 	run1 = run1 - run1;
	
		 
    }//bigger
    */
    function smaller() {
    	var interval2 = setInterval(function(){ 
    			left -= 0.2;
    			bottom -= 0.2;
    			right -= -0.2;
				ytop -= -0.2;
    			run2++;
    			if ( run2 == 10 ){
    				clearInterval(interval2);
    				if ( go == false ) {
    					bigger();
    				} 
    				if (go == true ){
    					normal();
    				}
    			}
		
		 	}, 300);
		 	run2 = run2 - run2;
		 	 	
    	
    }//smaller

	function normal(){
	clearInterval(interval);
	clearInterval(interval1);
	clearInterval(interval2);
	clearInterval(interval3);
		    var left = -3.0;
			var right = 3.0;
			var ytop = 3.0;
			var bottom = -3.0;
	}
	
	
	if (bool == true){
		gl.uniform4fv( gl.getUniformLocation(program,
       		"ambientProduct"),flatten(ambientProduct) );
    	gl.uniform4fv( gl.getUniformLocation(program,
       		"diffuseProduct"),flatten(diffuseProduct) );
    	gl.uniform4fv( gl.getUniformLocation(program,
       		"specularProduct"),flatten(specularProduct) );
    	gl.uniform4fv( gl.getUniformLocation(program,
       		"lightPosition"),flatten(lightPosition) );
    	gl.uniform1f( gl.getUniformLocation(program,
       		"shininess"),materialShininess );
	}
	
	if (copperbool == true){
		gl.uniform4fv( gl.getUniformLocation(program,
       		"ambientProduct"),flatten(ambientProductT) );
    	gl.uniform4fv( gl.getUniformLocation(program,
       		"diffuseProduct"),flatten(diffuseProductT) );
    	gl.uniform4fv( gl.getUniformLocation(program,
       		"specularProduct"),flatten(specularProductT) );
    	gl.uniform4fv( gl.getUniformLocation(program,
       		"lightPosition"),flatten(lightPosition) );
    	gl.uniform1f( gl.getUniformLocation(program,
       		"shininess"),materialShininess );
	}
	
	if (jadebool == true){
		gl.uniform4fv( gl.getUniformLocation(program,
       		"ambientProduct"),flatten(ambientProductJ) );
    	gl.uniform4fv( gl.getUniformLocation(program,
       		"diffuseProduct"),flatten(diffuseProductJ) );
    	gl.uniform4fv( gl.getUniformLocation(program,
       		"specularProduct"),flatten(specularProductJ) );
    	gl.uniform4fv( gl.getUniformLocation(program,
       		"lightPosition"),flatten(lightPosition) );
    	gl.uniform1f( gl.getUniformLocation(program,
       		"shininess"),materialShininess );
	}
	
	if (pewterbool == true){
		gl.uniform4fv( gl.getUniformLocation(program,
       		"ambientProduct"),flatten(ambientProductP) );
    	gl.uniform4fv( gl.getUniformLocation(program,
       		"diffuseProduct"),flatten(diffuseProductP) );
    	gl.uniform4fv( gl.getUniformLocation(program,
       		"specularProduct"),flatten(specularProductP) );
    	gl.uniform4fv( gl.getUniformLocation(program,
       		"lightPosition"),flatten(lightPosition) );
    	gl.uniform1f( gl.getUniformLocation(program,
       		"shininess"),materialShininess );
	}


    render();
}



function render() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    normalMatrix = [
        vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
        vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
        vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2])
    ];

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix) );

    for( var i=0; i<index; i+=3)
        gl.drawArrays( gl.TRIANGLES, i, 3 );

    window.requestAnimFrame(render);
}
