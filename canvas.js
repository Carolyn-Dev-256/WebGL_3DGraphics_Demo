//+ vec4(u_Color.rgb * amb, u_Color.a)
//'  float amb = 0.05;\n' + 	
//Shaders---------------------------------------------
var vShaderCode = 
'attribute vec4 a_position;\n' + 
'attribute vec4 a_Normal;\n' +   // Normal
'attribute vec4 a_vNormal;\n' +       
'uniform vec4 u_Color;\n' + 
'uniform vec4 u_PointPos;\n' + 
'uniform bool u_Ping;\n' + // applies a solid color with no shading to the shape, used for wireframe and object selection
'uniform bool u_Ortho;\n' +
//'uniform float u_Fudge;\n' +
'uniform bool u_Dilight;\n' +
'uniform bool u_Pointlight;\n' +
'uniform bool u_Ambient;\n' +
'uniform bool u_Specular;\n' +
'uniform int u_shadeMode;\n' + //0 for flat, 1 for gouraud, 2 for phong
'uniform mat4 u_MvpMatrix;\n' +
'uniform vec3 u_LightColor;\n' +     // Light color
'uniform vec3 u_PointColor;\n' +
'uniform vec3 u_LightDirection;\n' + // Light direction (in the world coordinate, normalized)
'varying vec4 v_Pos;\n' +
'varying vec4 v_Norm;\n' +
'varying vec4 v_vNorm;\n' +
'varying vec4 v_Color;\n' +

'void main(){\n' +
//initializing the local variables
'  float amb = 0.2;\n' + 
'  float nDotL;\n' +
//passing vertices 
'  gl_PointSize = 10.0;\n' +
'  vec4 tColor = vec4(0, 0, 0, 1);\n' + //setting the total color output to 0 so that components can be added individually
//'  vec4 pos = vec4(a_position.xyz/a_position.w, a_position.w);\n' +
'  vec4 pos = a_position;\n' +
'  if(!u_Ortho){\n' +
'  pos = vec4(pos.xy/(((pos.z) * 0.2)+1.0), pos.zw);\n' +
'  }\n' +
'  gl_Position = pos;\n' +
'  if (u_Ping) {\n' +
'    v_Color = u_Color;\n' +

'  } else {\n' + //if rendering normally...

'    if(u_Ambient){\n' + //add ambient component if enabled
'      tColor += vec4(u_Color.rgb * amb, u_Color.a);\n' +
'    }\n' +


 
'    if(u_shadeMode != 2){\n' +
'      vec3 normal = vec3(0,0,0);\n' + //initialize normal vector
'      if(u_shadeMode == 0){\n' + //if flat shading, set normal to surface normal
'        normal = normalize(a_Normal.xyz);\n' +
'      }\n' +
'      if(u_shadeMode == 1){\n' + //if gouraud shading, set normal to vector normal
'        normal = normalize(a_vNormal.xyz);\n' +
'      }\n' +

'      vec3 diffuse = vec3(0, 0, 0);\n' + //initialize diffuse component
'      if(u_Dilight){\n' + //if enabled, add diffuse component from directional lighting
'        nDotL = max(dot(normalize(u_LightDirection), normal), 0.0);\n' +
'        diffuse += u_LightColor * u_Color.rgb * nDotL;\n' +
'      }\n' +
'      if(u_Pointlight){\n' + //if enabled, add diffuse component from point lighting
'        nDotL = max(dot(normalize(u_PointPos.xyz - a_position.xyz), normal), 0.0);\n' +
'        diffuse += u_PointColor * u_Color.rgb * nDotL;\n' +
'      }\n' +

'      tColor += vec4(diffuse, u_Color.a);\n' + //add diffuse component to color total

'    }\n' +

'    v_Pos = pos;\n' +
'    v_Norm = a_Normal;\n' +
'    v_vNorm = a_vNormal;\n' +
'    v_Color = tColor;\n' +
'  }\n' +
'}\n';

var fShaderCode = 
'precision highp float;\n' +
'uniform vec4 u_Color;\n' + 
'uniform vec4 u_PointPos;\n' + 
'uniform bool u_Ping;\n' + 
'uniform bool u_Dilight;\n' +
'uniform bool u_Pointlight;\n' +
'uniform bool u_Specular;\n' +
'uniform highp float u_Shininess;\n' +
'uniform highp int u_shadeMode;\n' +
'uniform vec3 u_LightColor;\n' +
'uniform vec3 u_PointColor;\n' +
'uniform vec3 u_LightDirection;\n' +
'uniform vec4 u_CamPos;\n' +
'varying vec4 v_Pos;\n' +
'varying vec4 v_Norm;\n' +
'varying vec4 v_vNorm;\n' +
'varying vec4 v_Color;\n' +
'void main(){\n' +
'  vec4 tColor = v_Color;\n' +
'  float spec = 0.5;\n' + 
'  float nDotL;\n' +
'  vec3 pos = v_Pos.xyz;\n' +

'  if(u_Specular && !u_Ping){\n' + //add specular component if enabled
'    vec3 nHat;\n' +
'    if(u_shadeMode == 0){\n' +
'      nHat = normalize(v_Norm.xyz);\n' +
'    } else {\n' +
'      nHat = normalize(v_vNorm.xyz);\n' +
'    }\n' +

'    vec3 specular = vec3(0, 0, 0);\n' + //initialize specular component
'    vec3 ref = vec3(0, 0, 0);\n' +
//'    vec3 view = normalize(vec3(0, 0, -1) - pos);\n' +
'    vec3 view = normalize(u_CamPos.xyz - pos);\n' +
'    float thet;\n' +

'    if(u_Dilight){\n' + //if enabled, add specular component from directional lighting
'      nDotL = dot(normalize(u_LightDirection), nHat);\n' +
'      ref = normalize(reflect(-u_LightDirection, nHat));\n' +
'      thet = pow(max(dot(view, ref), 0.0), u_Shininess);\n' +
'      specular += spec * u_PointColor * u_Color.rgb * thet;\n' +
'    }\n' +

'    if(u_Pointlight){\n' + //if enabled, add specular component from point lighting
'      nDotL = dot(normalize(u_PointPos.xyz - pos), nHat);\n' +
'      ref = normalize(reflect(-(u_PointPos.xyz - pos), nHat));\n' +
'      thet = pow(max(dot(view, ref), 0.0), u_Shininess);\n' +
'      specular += spec * u_PointColor * u_Color.rgb * thet;\n' +
'    }\n' +
'    tColor += vec4(specular, 0);\n' +
'  }\n' +

'  if(u_shadeMode == 2 && !u_Ping){\n' +
'    vec3 pos = v_Pos.xyz;\n' +
'    vec3 normal = normalize(v_vNorm.xyz);\n' +
'    vec3 diffuse = vec3(0, 0, 0);\n' + //initialize diffuse component
'    if(u_Dilight){\n' + //if enabled, add diffuse component from directional lighting
'      nDotL = max(dot(normalize(u_LightDirection), normal), 0.0);\n' +
'      diffuse += u_LightColor * u_Color.rgb * nDotL;\n' +
'    }\n' +
'    if(u_Pointlight){\n' + //if enabled, add diffuse component from point lighting
'      nDotL = max(dot(normalize(u_PointPos.xyz - pos), normal), 0.0);\n' +
'      diffuse += u_PointColor * u_Color.rgb * nDotL;\n' +
'    }\n' +
'    tColor += vec4(diffuse, u_Color.a);\n' + //add diffuse component to color total
'  }\n' +

'  gl_FragColor = tColor;\n' +
'}\n';



//global vars-----------------------------------------

//Draw canvas
var mX = 0;
var mY = 0;
var numClicks = 0;
var stillDrawing = true;
var ar = [];

//Render Canvas

//Constants
var lightpos = [1, 1, -1];
var lightcol = [1, 1, 1];
var pointcol = [1,0.8,0.2];

var lX;
var lY;
var rmX = 0;
var rmY = 0;
var lmHeld = false;
var mmHeld = false;
var rmHeld = false;

//canvas and camera
var scale = [960, 960, 960] // X, Y, Z dimensions of render canvas
var persp = false;
var Fov = document.getElementById("fov").value;
var FovTarg = document.getElementById("fov").value;
var CamAz = document.getElementById("hor").value;
var CamAzTarg = document.getElementById("hor").value;
var CamAzMat = [
	[Math.cos((CamAz*Math.PI)/180), 0, -Math.sin((CamAz*Math.PI)/180), 0],
	[0, 1, 0, 0],
	[Math.sin((CamAz*Math.PI)/180), 0, Math.cos((CamAz*Math.PI)/180), 0],
	[0, 0, 0, 1]
];
var CamVer = document.getElementById("ver").value;
var CamVerTarg = document.getElementById("ver").value;
var CamVerMat = [
	[1, 0, 0, 0],
	[0, Math.cos((CamVer*Math.PI)/180), Math.sin((CamVer*Math.PI)/180), 0],
	[0, -Math.sin((CamVer*Math.PI)/180), Math.cos((CamVer*Math.PI)/180), 0],
	[0, 0, 0, 1]
];
var CamX = document.getElementById("pX").value;
var CamXTarg = document.getElementById("pX").value;
var CamY = document.getElementById("pY").value;
var CamYTarg = document.getElementById("pY").value;

//User-specified mesh settings
var rots = 3;
var ecaps = false;
var wFrame = false;

/*var verts = [
	[0, -.90, -.30],
	[0, -.60, 0],
	[0, -.30, .30],
];*/
var verts = [];
var rVerts = [];
var triangles = [];
var normals = [];
var vnormals = [];
var instances = 3;
var imax = 24;
var selected = 0;
var scalemats = [];
var rotmats =[];
var transmats =[];

var colors = [];
var keys = [];
var ident = [
	[1, 0, 0, 0],
	[0, 1, 0, 0],
	[0, 0, 1, 0],
	[0, 0, 0, 1]
	];

var benchmark = [
	0, 0, 0,
	1, 0, 0,
	-1, 0, 0,
	0, 1, 0,
	0, -1, 0
];
var SORGenerated = false;
var th = 0;
var pos;
var yrot;

//setting up canvas-------------------------------------
var canvas = document.getElementById('drawing-surface');
var c = canvas.getContext("2d");
canvas.width = 480;
canvas.height = 480;

console.log(canvas);

//drawing horizontal axis
c.strokeStyle = "red";
c.beginPath();
c.moveTo(0,240);
c.lineTo(480,240);
c.stroke();

//drawing vertical axis
c.strokeStyle = "green";
c.beginPath();
c.moveTo(240,0);
c.lineTo(240,480);
c.stroke();

c.strokeStyle = "black";


//Setting up 3d render canvas--------------------------
var render = document.getElementById('render-surface');
var r = render.getContext("webgl");
render.width = scale[0];
render.height = scale[1];
r.viewport(0, 0, scale[0], scale[1]);

var vShader = r.createShader(r.VERTEX_SHADER);
var fShader = r.createShader(r.FRAGMENT_SHADER);

r.shaderSource(vShader, vShaderCode);
r.shaderSource(fShader, fShaderCode);

r.compileShader(vShader);
r.compileShader(fShader);

var program = r.createProgram();
r.attachShader(program, vShader);
r.attachShader(program, fShader);
r.linkProgram(program);

r.enable(r.DEPTH_TEST);

var vertBuffer = r.createBuffer();
var lBuffer = r.createBuffer();
var normBuffer = r.createBuffer();
var vnormBuffer = r.createBuffer();


if(!r.getProgramParameter(program, r.LINK_STATUS)){
	console.error('error linking program');
}

//instancing SORS
for(let i = 0; i < instances; i++){
	transmats[i] = [];
	transmats[i][0] = ident; //scale
	transmats[i][1] = Mrotate(-Math.PI/2, 'x', ident, 'm'); //rotation
	transmats[i][2] = ident; //translation
	colors[i] = [Math.random(), Math.random(), Math.random(), 1];
	keys[i] = [i/32, 0, 0, 1];
}

//Applying individual transformations
transmats[1][0] = Mscale(1.5, 1.5, 0.5, ident);
transmats[1][2] = Mtranslate(-0.4, 0, 0, ident, 'm');
transmats[2][0] = Mscale(.6, .6, 2, ident);
transmats[2][2] = Mtranslate(0.4, 0, 0, ident, 'm');

//creating light mesh
var lCurve =[
	[0, 0.1*Math.sin((7*Math.PI)/8), 0.1*Math.cos((7*Math.PI)/8)],
	[0, 0.1*Math.sin((6*Math.PI)/8), 0.1*Math.cos((6*Math.PI)/8)],
	[0, 0.1*Math.sin((5*Math.PI)/8), 0.1*Math.cos((5*Math.PI)/8)],
	[0, 0.1*Math.sin((4*Math.PI)/8), 0.1*Math.cos((4*Math.PI)/8)],
	[0, 0.1*Math.sin((3*Math.PI)/8), 0.1*Math.cos((3*Math.PI)/8)],
	[0, 0.1*Math.sin((2*Math.PI)/8), 0.1*Math.cos((2*Math.PI)/8)],
	[0, 0.1*Math.sin((1*Math.PI)/8), 0.1*Math.cos((1*Math.PI)/8)],
	];
var lSOR = createSOR(lCurve, 16, true);
var lTris = polygonize(7, 16, true);
var lnorms;
var lvnorms;
var ltrans = [];
ltrans[0] = [ident, ident, ident];
var lcol = [];
lcol[0] = [pointcol[0], pointcol[1], pointcol[2], 1];

console.log(lCurve);
console.log(lSOR);
console.log(getTriMesh(lSOR, lTris));




requestAnimationFrame(renderloop);


//Draw Canvas Mouse Functions-------------------------------------
//tracking mouse coordinates
canvas.addEventListener('mousemove', function(event){
	mX = event.offsetX;
	mY = event.offsetY;
});

//left click event - draws
canvas.addEventListener('click', function (event) {
	draw();
});

//right click event - draws and
canvas.addEventListener("contextmenu", (e) => {e.preventDefault()});
canvas.addEventListener('contextmenu', function (event) {
	draw();
	stillDrawing = false;
	console.log(ar);
});


//function for drawing points when left or right clicking,
//but only if user has not right clicked before
function draw(){
	if(stillDrawing){
		var nc = numClicks;
		if(numClicks == 0){
			c.beginPath();
			c.moveTo(mX, mY);
		}
		else{
			c.lineTo(mX, mY);
			c.stroke();
		}
		console.log(numClicks + " " + mX + " " + mY);
		numClicks += 1;

		ar[nc] = [];
		ar[nc][0] = numClicks;
		ar[nc][1] = 0;
		ar[nc][2] = mY - 240;
		ar[nc][3] = mX - 240;

		nc = numClicks;

	}
}

//Render Canvas Mouse Functions-------------------------------------
//Tracks mouse movement since last check and uses it to calculate transforms for selected instance
render.addEventListener('mousemove', function(event){
	//calculating mouse movement
	var nX = event.offsetX;
	var nY = event.offsetY;
	var dX = (nX - rmX)/(scale[0]/2);
	var dY = (nY - rmY)/(scale[1]/2);
	var movevec;

	if(selected > -1){
		if(lmHeld){//if holding left mouse, translate the selected instance
			movevec = MVdotprod(transpose(CamAzMat), MVdotprod(transpose(CamVerMat), [dX, -dY, 0, 1] ));
			transmats[selected][2] = Mtranslate(movevec[0], movevec[1], movevec[2], transmats[selected][2], "m");
			//transmats[selected][2] = Mtranslate(dX, -dY, 0, transmats[selected][2], "m");
			//transmats[selected][2] = MMdotprod(MMdotprod(CamVerMat, MMdotprod(CamAzMat, Mtranslate(dX, -dY, 0, ident, "m") )), transmats[selected][2]);
		}
		if(mmHeld){//if holding middle mouse, scale the selected instance
			transmats[selected][0] = Mscale(1.5 ** dX, 1.5 ** dX, 2**(-dY), transmats[selected][0], "m");
			console.log(scalemats[selected]);
		}
		if(rmHeld){//if holding right mouse, rotate the selected instance
			transmats[selected][1] = Mrotate(-2*dX, 'y', transmats[selected][1], "m");
			//console.log(MMdotprod(CamVerMat, Mrotate(-dX, 'y', ident, "m")));
			//console.log(MMdotprod(MMdotprod(CamVerMat, Mrotate(-dX, 'y', ident, "m")), transmats[selected][1]));
			//transmats[selected][1] = MMdotprod(MMdotprod(Mrotate(-dX, 'y', ident, "m"), CamVerMat), transmats[selected][1]);
			transmats[selected][1] = Mrotate(-2*dY, 'x', transmats[selected][1], "m");
		}
	}
	//update mouse coords
	rmX = nX;
	rmY = nY;
});

//Disable context menu
render.addEventListener("contextmenu", (e) => {e.preventDefault()});

//debug tool that logs the translation matrices of the selected SOR uppon right click
/*Irender.addEventListener('contextmenu', function (event) {
	console.log(scalemats[selected]);
	console.log(rotmats[selected]);
	console.log(transmats[selected]);
});*/

//Tracking left/middle/right mouse button held
render.addEventListener('mousedown', function (event) {
	//If left click, mark lmb as held and ping for instance selection
	if(event.which == 1){
		lmHeld = true;
		var reading = new Uint8Array(4);
		var layers = numClicks;
		rots = parseInt(document.getElementById("rot").value);
		ecaps = document.getElementById("endcaps").checked;
		detect(rVerts, numClicks, rots, ecaps, instances);
		console.log(CamAzMat);
		console.log(CamVerMat);
		
		
	}
	if(event.which == 2){
		mmHeld = true;
	}
	if(event.which == 3){
		rmHeld = true;
	}
});


render.addEventListener('mouseup', function (event) {
	if(event.which == 1){
		lmHeld = false;
	}
	if(event.which == 2){
		mmHeld = false;
	}
	if(event.which == 3){
		rmHeld = false;
	}
});

//Resets camera position and orientation
function camreset(){
	document.getElementById("hor").value = 0;
	document.getElementById("ver").value = 0;
	document.getElementById("pX").value = 0;
	document.getElementById("pY").value = 0;
}

function renderloop(){
	var PLight = document.getElementById("pointlight").checked;

	//preparing canvas for drawing
	lX = (document.getElementById("lightx").value - 9)/10;
	lY = (document.getElementById("lighty").value - 9)/10;

	r.clearColor(.80, .64, .96, 1.0);
	r.clear(r.COLOR_BUFFER_BIT);
	r.useProgram(program);
	r.clear(r.COLOR_BUFFER_BIT | r.DEPTH_BUFFER_BIT); //Clearing buffers
	
	FovTarg = document.getElementById("fov").value;
	Fov = interpolate(Fov, FovTarg, 1);

	CamAzTarg = document.getElementById("hor").value;
	CamAz = interpolate(CamAz, CamAzTarg, 1);
	CamAzMat = [
		[Math.cos((CamAz*Math.PI)/180), 0, -Math.sin((CamAz*Math.PI)/180), 0],
		[0, 1, 0, 0],
		[Math.sin((CamAz*Math.PI)/180), 0, Math.cos((CamAz*Math.PI)/180), 0],
		[0, 0, 0, 1]
	];

	CamVerTarg = document.getElementById("ver").value;
	CamVer = interpolate(CamVer, CamVerTarg, 1);
	CamVerMat = [
		[1, 0, 0, 0],
		[0, Math.cos((CamVer*Math.PI)/180), Math.sin((CamVer*Math.PI)/180), 0],
		[0, -Math.sin((CamVer*Math.PI)/180), Math.cos((CamVer*Math.PI)/180), 0],
		[0, 0, 0, 1]
	];

	CamXTarg = document.getElementById("pX").value;
	CamX = interpolate(CamX, CamXTarg, 1);
	CamYTarg = document.getElementById("pY").value;
	CamY = interpolate(CamY, CamYTarg, 1);

	if(SORGenerated){
		
		//th += Math.PI/360;
		var Ortho = r.getUniformLocation(program, 'u_Ortho');//Add specular lighting?
		//r.uniform1i(Ortho, (document.getElementById("ortho").checked ? 1 : 0));
		r.uniform1i(Ortho, 1);
		persp = !(document.getElementById("ortho").checked);
		rend(rVerts, triangles, numClicks, rots, ecaps, normals, vnormals, instances, transmats, colors, wFrame, 0);
		if(PLight){
			//persp = false;
			ltrans[0][2] = Mtranslate(lX, lY, -0.85, ident, "m");
			//console.log(ltrans[2]);
			r.uniform1i(Ortho, 1);
			rend(lSOR, lTris, 7, 16, true, lnorms, lvnorms, 1, ltrans, lcol, false, 1);
				
				
		}
	}
	
	requestAnimationFrame(renderloop);
}



//Creates/updates SOR, polygons, and normals according to polyline and current rotation and endcaps settings
//Called when user clicks "Draw Mesh"
function SORGen(){
	if(stillDrawing){
		console.error("Polyline incomplete, can't draw mesh");
		return(-1);
	}
	lnorms = getNormals(lSOR, lTris);
	lvnorms = getVNormals(lSOR, lnorms, lTris);
	console.log(lnorms);
	console.log(lvnorms);
	//Fetching segments of polyline (layers of SOR), selected amount of rotations, and whether endcaps are being drawn
	var layers = numClicks;
	rots = parseInt(document.getElementById("rot").value);
	ecaps = document.getElementById("endcaps").checked;
	wFrame = document.getElementById("wireframe").checked;

	//Parsing the points from the polyline to a set of normalized Y-Z coordinates
	for(let i = 0; i < layers; i++){
		verts[i] = [];
		for(let j = 0; j < 3; j++){
			verts[i][j] = (ar[i][j + 1])/((scale[j]/2));
		}
	}
	console.log(verts);
	rVerts = createSOR(verts, rots, ecaps); //Creating SOR from curve
	triangles = polygonize(layers, rots, ecaps);
	normals = getNormals(rVerts, triangles);
	normals = normalize(normals);
	vnormals = getVNormals(rVerts, normals, triangles);
	vnormals = normalize(vnormals);
	SORGenerated = true;

	console.log("Vertices of Polyline:");
	console.log(verts);
	console.log("Layers of SOR (vertcount in polyline):");
	console.log(layers);
	console.log("Vertices of SOR:");
	console.log(rVerts);
	console.log("Surface Normals:");
	console.log(normals);
	console.log("Vector Normals:");
	console.log(vnormals);
	//console.log(setPerspective(Fov, 1, -1, 1));
	//console.log(transf(setPerspective(Fov, 1, -1, 1), rVerts));
	console.log("Triangle mesh:");
	console.log(getTriMesh(rVerts, triangles));
}

//Currently just calls SORWirefame(), but is designed to allow for multiple instances and transformations of an SOR
function rend(SOR, tri, lnum, rot, caps, N, vN, inst, trans, color, wire, flat){
	
	//Local Vars
	var mesh;
	var mNum = 0;
	var tNorms;
	var npos;
	var tVNorms;
	var nvpos;
	var tVerts;
	var vpos;
	var lpos;
	var viewpos = Mtranslate(CamX/100, CamY/100, 0, MVdotprod(transpose(CamVerMat), MVdotprod(transpose(CamAzMat), [0, 0, -1, 1] )), "v");
	
	
	//Shader var settings-------------------------------------------------------------------------
	var LightColor = r.getUniformLocation(program, 'u_LightColor');//Passing point light location to shader
	r.uniform3fv(LightColor, new Float32Array([1,1,1]));
	var PointColor = r.getUniformLocation(program, 'u_PointColor');//Passing point light location to shader
	r.uniform3fv(PointColor, new Float32Array(pointcol));
	var LightDirection = r.getUniformLocation(program, 'u_LightDirection');//Passing point light location to shader
	r.uniform3fv(LightDirection, new Float32Array([1,1,-1]));
	var CamPos = r.getUniformLocation(program, 'u_CamPos');//Passing point light location to shader
	r.uniform4fv(CamPos, new Float32Array(viewpos));

	var u_Color = r.getUniformLocation(program, 'u_Color'); //Passing instance color
	
	var Ping = r.getUniformLocation(program, 'u_Ping');//Tell shader to render normally
	r.uniform1i(Ping, flat);
	var Dilight = r.getUniformLocation(program, 'u_Dilight');//Apply directional light?
	r.uniform1i(Dilight, (document.getElementById("dilight").checked ? 1 : 0));
	var Pointlight = r.getUniformLocation(program, 'u_Pointlight');//Apply point light?
	var PLight = document.getElementById("pointlight").checked;
	r.uniform1i(Pointlight, (PLight ? 1 : 0));
	var Ambient = r.getUniformLocation(program, 'u_Ambient');//Add ambient lighting?
	r.uniform1i(Ambient, (document.getElementById("ambient").checked ? 1 : 0));
	var Specular = r.getUniformLocation(program, 'u_Specular');//Add specular lighting?
	r.uniform1i(Specular, (document.getElementById("specular").checked ? 1 : 0));

	var shadeMode = r.getUniformLocation(program, 'u_shadeMode');//Telling shader what shading method to use
	var smode = document.getElementById("Shading").value;
	if(smode == "Flat"){
		r.uniform1i(shadeMode, 0);
		//console.log("0");
	}else if(smode == "Gouraud"){
		r.uniform1i(shadeMode, 1);
		//console.log("1");
	}else{
		r.uniform1i(shadeMode, 2);
		//console.log("2");
	}

	if(!document.getElementById("diffuse").checked){
		r.uniform1i(shadeMode, 3);
	}


	var Shininess = r.getUniformLocation(program, 'u_Shininess');//Passing point light location to shader
	r.uniform1f(Shininess, document.getElementById("shine").value);
	//console.log(document.getElementById("shine").value);

	var lX = (document.getElementById("lightx").value - 9)/10;
	var lY = (document.getElementById("lighty").value - 9)/10;
	var PointPos = r.getUniformLocation(program, 'u_PointPos');//Passing point light location to shader
	r.uniform4fv(PointPos, new Float32Array([lX,lY,-0.85,1]));

	yrot = [
		[Math.cos(th), 0, Math.sin(th), 0],
		[0, 1, 0, 0],
		[-Math.sin(th), 0, Math.cos(th), 0],
		[0, 0, 0, 1]
	];

	

	
	//Main loop for rendering each instance---------------------------
	for(let i = 0; i < inst; i++){
		//update color 
		r.uniform4fv(u_Color, new Float32Array(color[i]));
		
		//apply scale and rotation matrices to normals
		tNorms = transf(scalarInverse(trans[i][0]), N);
		tNorms = transf(trans[i][1], tNorms);
		//tNorms = transf(CamAzMat, tNorms);
		if(persp){
			//tNorms = transf(setPerspective(Fov, 1, -1, 1), tNorms);
			//tNorms = transf(Mtranslate(-1,-1, 1, ident, "m"), tNorms);
		}
		r.bindBuffer(r.ARRAY_BUFFER, normBuffer);
		
		//push normals to shader
		npos = r.getAttribLocation(program, 'a_Normal');
		r.vertexAttribPointer(npos, 3, r.FLOAT, false, 12, 0);
		r.enableVertexAttribArray(npos);
		r.bufferData(r.ARRAY_BUFFER, new Float32Array(linearize(tNorms)), r.STATIC_DRAW);

		//apply scale and rotation matrices to vector normals
		tVNorms = transf(scalarInverse(trans[i][0]), vN);
		tVNorms = transf(trans[i][1], tVNorms);
		//tVNorms = transf(CamAzMat, tVNorms);
		if(persp){
			//tVNorms = transf(setPerspective(Fov, 1, -1, 1), tVNorms);
			//tVNorms = transf(Mtranslate(-1,-1, 1, ident, "m"), tVNorms);
		}
		r.bindBuffer(r.ARRAY_BUFFER, vnormBuffer);
		
		//push vector normals to shader
		nvpos = r.getAttribLocation(program, 'a_vNormal');
		r.vertexAttribPointer(nvpos, 3, r.FLOAT, false, 12, 0);
		r.enableVertexAttribArray(nvpos);
		r.bufferData(r.ARRAY_BUFFER, new Float32Array(linearize(tVNorms)), r.STATIC_DRAW);

		//apply scale, rotation, and translation matrices to vertices
		tVerts = transf(trans[i][0], SOR);
		tVerts = transf(trans[i][1], tVerts);
		tVerts = transf(trans[i][2], tVerts);
		tVerts = transf(CamAzMat, tVerts);
		tVerts = transf(CamVerMat, tVerts);
		tVerts = transf(Mtranslate(-CamX/100, -CamY/100, 0, ident, "m"), tVerts);
		if(persp){
			tVerts = pProject(tVerts, (Fov*Math.PI)/180, 1);
			//console.log(tVerts);
		}
		r.bindBuffer(r.ARRAY_BUFFER, vertBuffer);
		
		//prepare vertex buffer
		vpos = r.getAttribLocation(program, 'a_position');
		r.vertexAttribPointer(vpos, 3, r.FLOAT, false, 12, 0);
		r.enableVertexAttribArray(vpos);

		//if wFrame enable, disable shading and draw as wireframe
		if(wire){
			r.uniform1i(Ping, 1);
			mesh = SORWireframe(tVerts, lnum, rot, caps);
			r.bufferData(r.ARRAY_BUFFER, new Float32Array(mesh), r.STATIC_DRAW);
			r.drawArrays(r.LINE_STRIP, 0, (mesh.length)/3);
		}

		//otherwise shade normally and render with tris
		else{
			mesh = getTriMesh(tVerts, tri);
			r.bufferData(r.ARRAY_BUFFER, new Float32Array(mesh), r.STATIC_DRAW);
			r.drawArrays(r.TRIANGLES, 0, (mesh.length)/3);
		}
		
		//Debug feature that draws normals as points
		/*mesh = linearize(tVNorms);
		r.bufferData(r.ARRAY_BUFFER, new Float32Array(mesh), r.STATIC_DRAW);
		r.drawArrays(r.POINTS, 0, (mesh.length)/3);
		mesh = linearize(tNorms);
		r.bufferData(r.ARRAY_BUFFER, new Float32Array(mesh), r.STATIC_DRAW);
		r.drawArrays(r.POINTS, 0, (mesh.length)/3);*/
	}

	/*if(PLight){
		r.uniform1i(Ping, 1);
		r.uniform4fv(u_Color, new Float32Array([1,0.8,0.2,1]));
		
		var lTrans = Mtranslate(lX, lY, -0.85, ident, "m");
		var lVerts = transf(lTrans, lSOR);
		//console.log(lVerts.length);

		r.bindBuffer(r.ARRAY_BUFFER, normBuffer);
		
		//push normals to shader
		npos = r.getAttribLocation(program, 'a_Normal');
		r.vertexAttribPointer(npos, 3, r.FLOAT, false, 12, 0);
		r.enableVertexAttribArray(npos);
		r.bufferData(r.ARRAY_BUFFER, new Float32Array(linearize(lnorms)), r.STATIC_DRAW);

		r.bindBuffer(r.ARRAY_BUFFER, vnormBuffer);
		
		//push vector normals to shader
		nvpos = r.getAttribLocation(program, 'a_vNormal');
		r.vertexAttribPointer(nvpos, 3, r.FLOAT, false, 12, 0);
		r.enableVertexAttribArray(nvpos);
		r.bufferData(r.ARRAY_BUFFER, new Float32Array(linearize(lvnorms)), r.STATIC_DRAW);

		r.bindBuffer(r.ARRAY_BUFFER, lBuffer);
		lpos = r.getAttribLocation(program, 'a_position');
		r.vertexAttribPointer(lpos, 3, r.FLOAT, false, 12, 0);
		r.enableVertexAttribArray(lpos);

		//mesh = getTriMesh(SOR, triangles);
		//mesh = getTriMesh(lVerts, lTris);
		//mesh = SORWireframe(lVerts, 7, 16, true);
		var fmesh = new Float32Array(getTriMesh(lVerts, lTris));
		//console.log(fmesh.length);
		r.bufferData(r.ARRAY_BUFFER, fmesh, r.STATIC_DRAW);
		r.drawArrays(r.TRIANGLES, 0, (fmesh.length)/3);
		r.uniform1i(Ping, 0);
	}*/
	
}


//Given a 2d matrix defining a 2d curve, gives a 2d matrix defining the vertex coordinates of a 3d SOR
function createSOR(curve, ro, caps) {
	var sorVerts = [];
	var o = 0;
	var lnum = curve.length;
	var thet = 0;
	var n = 0;
	//Adding rear cap vertex
	if(caps){ 
		o = 1; 
		sorVerts[0] = [];
		sorVerts[0][0] = 0;
		sorVerts[0][1] = 0;
		sorVerts[0][2] = curve[0][2];
		sorVerts[0][3] = 1;

	}

	//Rotating verts[] to get complete vertex array
	for(let i = 0; i < lnum; i++){
		for(let j = 0; j < ro; j++){
			n = j + (ro * i);
			thet = (2 * Math.PI) * (j / ro);
			sorVerts[n + o] = [];
			sorVerts[n + o][0] = curve[i][1] * Math.cos(thet);
			sorVerts[n + o][1] = curve[i][1] * Math.sin(thet);
			sorVerts[n + o][2] = curve[i][2];
			sorVerts[n + o][3] = 1;
		}
	}

	//Adding front cap vertex
	if(caps){
		var vc = sorVerts.length;
		sorVerts[vc] = [];
		sorVerts[vc][0] = 0;
		sorVerts[vc][1] = 0;
		sorVerts[vc][2] = curve[lnum-1][2];
		sorVerts[vc][3] = 1;
	}

	var ctext = writecoor(sorVerts);
	//console.log(ctext);
	const coor = new Blob([ctext], {type : 'plain/text'});
	var curl = URL.createObjectURL(coor);
	var clink = document.getElementById("cdl");
    clink.setAttribute("href", curl);

    var ptext = writepoly(lnum, ro, caps);
	//console.log(ptext);
	const poly = new Blob([ptext], {type : 'plain/text'});
	var purl = URL.createObjectURL(poly);
	var plink = document.getElementById("pdl");
    plink.setAttribute("href", purl);


	return(sorVerts);
}

//Given the rotation and layer count of a SOR, returns an matrix containing its constituent tris
function polygonize(lnum, ro, caps){
	var out = [];
	var vertct = lnum * ro;
	var tris = 0;
	var c;
	var o = 0;

	if(caps){//rear endcap
		o = 1;
		for(let j = 0; j < (ro - 1); j++){
			c = (j+o);
			out[tris] = [c, 0, (c + 1)];
			//out[tris][0] = c; 
			//out[tris][1] = 0;
			//out[tris][2] = (c+1);
			tris++;
		}
		out[tris] = [];
		out[tris][0] = ro; 
		out[tris][1] = 0;
		out[tris][2] = 1;
		tris++;
		
	}

	vertct += 2 * o;

	for(let i = 0; i < lnum; i++){
		if(i > 0){//"downward" tris
			out[tris] = [];
			out[tris][0] = ((i * ro) + o); 
			out[tris][1] = (((i + 1) * ro) + (o - 1));
			out[tris][2] = (((i - 1) * ro)+ o);
			tris++;
			//out += "tri" + tris + " " + ((i * ro) + 1 + o) + " " + (((i + 1) * ro) + o) + " " + (((i - 1) * ro)+ 1 + o) + "\n";
			for(let j = 1; j < ro; j++){
				c = (ro*i) + (j+o);
				out[tris] = [];
				out[tris][0] = c; 
				out[tris][1] = (c-1);
				out[tris][2] = (c-ro);
				tris++;
				//out += "tri" + tris + " " + c + " " + (c-1) + " " + (c-ro) + "\n";
			}
		}
		if(i < lnum-1){//"upward" tris
			for(let j = 0; j < (ro - 1); j++){
				c = (ro*i) + (j+o);
				out[tris] = [];
				out[tris][0] = c; 
				out[tris][1] = (c+1);
				out[tris][2] = (c+ro);
				tris++;
				//out += "tri" + tris + " " + c + " " + (c+1) + " " + (c+ro) + "\n";
			}
			out[tris] = [];
			out[tris][0] = (((i + 1) * ro) + (o - 1)); 
			out[tris][1] = (((i + 1) * ro) -(ro - 1) + (o - 1));
			out[tris][2] = (((i + 2) * ro) + (o - 1));
			tris++;
			//out += "tri" + tris + " " + (((i + 1) * ro) + o) + " " + (((i + 1) * ro) -(ro - 1) + o) + " " + (((i + 2) * ro) + o) + "\n";
		}
	}
	//console.log(out);
	if(caps){//front endcap
		out[tris] = [];
		out[tris][0] = (vertct - (ro + 1)); 
		out[tris][1] = (vertct - 1);
		out[tris][2] = (vertct - 2);
		tris++;
		//out += "tri" + tris + " " + (vertct - ro) + " " + vertct + " " + (vertct - 1) + "\n";
		for(let j = ro; j > 1; j--){
			c = (vertct - j);
			out[tris] = [];
			out[tris][0] = c; 
			out[tris][1] = vertct - 1;
			out[tris][2] = (c-1);
			tris++;
			
			//out += "tri" + tris + " " + c + " " + vertct + " " + (c-1) + "\n";
		}
	}

	//out = tris + "\n" + out;
	return(out);
}

function getNormals(ver, tris){
	var norm = [];
	var vA;
	var vB;
	for(let i = 0; i < tris.length; i++){
		vA = vectorsub(ver[tris[i][1]], ver[tris[i][0]]);
		vB = vectorsub(ver[tris[i][2]], ver[tris[i][1]]);

		
		
		for(let j = 0; j < 3; j++){
			norm[(i*3)+j] = [];
			norm[(i*3)+j][0] = (vA[1] * vB[2]) - (vA[2] * vB[1]);
			norm[(i*3)+j][1] = (vA[2] * vB[0]) - (vA[0] * vB[2]);
			norm[(i*3)+j][2] = (vA[0] * vB[1]) - (vA[1] * vB[0]);
			norm[(i*3)+j][3] = 0;

		}
		//console.log("Triangle " + tris[i]);
		/*console.log(ver[tris[i][0]]);
		console.log(ver[tris[i][1]]);
		console.log(ver[tris[i][2]]);

		console.log(vA);
		console.log(vB);
		console.log(norm[i]);*/
	}

	return(norm);
}

function getVNormals(ver, sNorms, tris){
	var vNorms = [];
	var sum;
	var num;
	var c;
	var locs;
	var debug = 0;
	for(let i = 0; i < ver.length; i++){
		sum = [0, 0, 0];
		num = 0;
		locs = [];
		for(let j = 0; j < tris.length; j++){
			for(let k = 0; k < 3; k++){
				if(tris[j][k] == i){
					sum[0] += sNorms[(j*3)+k][0];
					sum[1] += sNorms[(j*3)+k][1];
					sum[2] += sNorms[(j*3)+k][2];
					locs[num++] = (j*3)+k;
					if(debug > 0){
						console.log("found vertex " + i + " at tri "+j+" vertex "+k);
						console.log("coresponding snorm location: " + ((j*3)+k));
						console.log("found this vertex "+num+" times");
						console.log("sum is now "+sum);
					}
				}
			}
		}
		c = mag(sum);
		sum[0] = sum[0]/c;
		sum[1] = sum[1]/c;
		sum[2] = sum[2]/c;
		if(debug > 0){
			console.log("after division sum is now: "+sum);
		}
		for(let j = 0; j < locs.length; j++){
			vNorms[locs[j]] = sum;
		}
		debug--;
	}
	return(vNorms);

}

//Given SOR information, returns a 1D array that will produce a complete wireframe when passed to drawArrays(LINE_STRIP)
function SORWireframe(ver, lnum, ro, caps){
	//Main wireframe drawing loop. Adds entries from SOR coordinate matrix ver[] to 
	//2d array mesh[] in a sequence that will produce a complete wireframe when passed to drawArrays()
	var vertct = ver.length;
	var wf = [];
	var cur = 0; //Tracks the current vertex number
	var mNum = 0; //Tracks number of vertices added to mesh[]
	var o = 0; 
	for(let i = 0; i < lnum; i++){//for each "layer" (vertex in the polyline)
		
		if(i == 0 && caps){//If on the first layer and endcaps are enabled, draw the rear endcap
			o = 1;
			wf[(3*mNum)] = ver[0][0];
			wf[(3*mNum)+1] = ver[0][1];
			wf[(3*mNum)+2] = ver[0][2];
			mNum++;
			for(let j = 0; j < ro; j++){
				wf[(3*mNum)] = ver[cur + o][0];
				wf[(3*mNum)+1] = ver[cur + o][1];
				wf[(3*mNum)+2] = ver[cur + o][2];
				mNum++;
				cur++;
				wf[(3*mNum)] = ver[0][0];
				wf[(3*mNum)+1] = ver[0][1];
				wf[(3*mNum)+2] = ver[0][2];
				mNum++;
			}
			wf[(3*mNum)] = ver[1][0];
			wf[(3*mNum)+1] = ver[1][1];
			wf[(3*mNum)+2] = ver[1][2];
			mNum++;
			cur = 0;
		}

		for(let j = 0; j < ro; j++){//Draw a loop around current layer
			wf[(3*mNum)] = ver[cur + o][0];
			wf[(3*mNum)+1] = ver[cur + o][1];
			wf[(3*mNum)+2] = ver[cur + o][2];
			cur++;
			mNum++;
		}
		wf[(3*mNum)] = ver[(i*ro) + o][0];
		wf[(3*mNum)+1] = ver[(i*ro) + o][1];
		wf[(3*mNum)+2] = ver[(i*ro) + o][2];
		mNum++;

		if(i > 0){//if not on the first layer, stitch the current layer to the previous one
			cur-=ro;
			for(let j = 0; j < ro; j++){
				cur -= (ro-1);
				if(j == (ro-1)){
					cur -= ro;
				}
				wf[(3*mNum)] = ver[cur + o][0];
				wf[(3*mNum)+1] = ver[cur + o][1];
				wf[(3*mNum)+2] = ver[cur + o][2];
				mNum++;
				cur += ro;
				wf[(3*mNum)] = ver[cur + o][0];
				wf[(3*mNum)+1] = ver[cur + o][1];
				wf[(3*mNum)+2] = ver[cur + o][2];
				mNum++;
			}
			cur += ro;
		}


		if(i == (lnum-1) && caps){//If on the last layer and endcaps are enabled, draw the front endcap
			cur = vertct - ro;
			for(let j = 1; j < ro; j++){
				wf[(3*mNum)] = ver[vertct - 1][0];
				wf[(3*mNum)+1] = ver[vertct - 1][1];
				wf[(3*mNum)+2] = ver[vertct - 1][2];
				mNum++;
				wf[(3*mNum)] = ver[cur][0];
				wf[(3*mNum)+1] = ver[cur][1];
				wf[(3*mNum)+2] = ver[cur][2];
				mNum++;
				cur++;
				
			}
		}
	}
	//console.log(mNum);
	return(wf);
}

//Given vertex and polygon information, returns a 1D array that will produce a complete triangle mesh when passed to drawArrays(TRIANGLES)
function getTriMesh(ver, tris){
	var omesh = []
	var mNum = 0;
	for(let i = 0; i < tris.length; i++){
		for(let j = 0; j < 3; j++){
			for(let k = 0; k < 3; k++){
				omesh[mNum++] = ver[tris[i][j]][k]; 
			}
		}
	}
	return(omesh);
}

//Once an SOR is generated, writes its vertex coordinates to a downloadable file
function writecoor(ver){
	var vertct = ver.length;
	var out = "";
	out += vertct.toString() + "\n";

	for(let i = 0; i < vertct; i++){
		out += (i+1) + ", " + (scale[0]/2)*(ver[i][0]) + ", " + (scale[1]/2)*(ver[i][1]) + ", " + (scale[1]/2)*(ver[i][2]) + "\n";
	}
	return(out);
}

//Once an SOR is generated, writes its polygon information to a downloadable file
function writepoly(lnum, ro, caps){
	var vertct = lnum * ro;
	var tris = 0;
	var out = "";
	var c;
	var o = 0;
	if(caps){//rear endcap
		o = 1;
		for(let j = 1; j < ro; j++){
			tris++;
			c = (j+o);
			out += "tri" + tris + " " + c + " " + 1 + " " + (c+1) + "\n";
		}
		tris++;
		out += "tri" + tris + " " + ((ro) + o) + " " + 1 + " " + 2 + "\n";
	}
	vertct += 2 * o;
	for(let i = 0; i < lnum; i++){
		if(i > 0){//"downward" tris
			tris++;
			out += "tri" + tris + " " + ((i * ro) + 1 + o) + " " + (((i + 1) * ro) + o) + " " + (((i - 1) * ro)+ 1 + o) + "\n";
			for(let j = 2; j <= ro; j++){
				tris++;
				c = (ro*i) + (j+o);
				out += "tri" + tris + " " + c + " " + (c-1) + " " + (c-ro) + "\n";
			}
		}
		if(i < lnum-1){//"upward" tris
			for(let j = 1; j < ro; j++){
				tris++;
				c = (ro*i) + (j+o);
				out += "tri" + tris + " " + c + " " + (c+1) + " " + (c+ro) + "\n";
			}
			tris++;
			out += "tri" + tris + " " + (((i + 1) * ro) + o) + " " + (((i + 1) * ro) -(ro - 1) + o) + " " + (((i + 2) * ro) + o) + "\n";
		}
	}
	
	if(caps){//front endcap
		tris++;
		out += "tri" + tris + " " + (vertct - ro) + " " + vertct + " " + (vertct - 1) + "\n";
		for(let j = (ro - 1); j > 0; j--){
			tris++;
			c = (vertct - j);
			out += "tri" + tris + " " + c + " " + vertct + " " + (c-1) + "\n";
		}
	}

	out = tris + "\n" + out;
	console.log(out);
	console.log(polygonize(lnum, ro, caps));
	return(out);
}


//Turns a 2D array into a 1D array
function linearize(mat){
	var array = [];
	var ind = 0;
	for(let i = 0; i < mat.length; i++){
		for(let j = 0; j < 3; j++){
			array[ind++] = mat[i][j];
		}
	}
	return(array);
}

//Sets the length of all vectors in the matrix to 1
function normalize(mat){
	var omat = mat;
	var c;
	for(let i = 0; i < omat.length; i++){
		c = mag(omat[i]);
		omat[i][0] /= c;
		omat[i][1] /= c;
		omat[i][2] /= c;
		omat[i][3] = 0;
	}

	return(omat);

}

function mag(vec){
	c = (vec[0]**2) + (vec[1]**2) + (vec[2]**2);
	return(Math.sqrt(c));
}

//returns the vector dot product between a matrix and a vector
function MVdotprod(m1, v1){
	var a;
	var out = [];
	for(let i = 0; i < m1.length; i++){
		a = 0
		for(let j = 0; j < m1[i].length; j++){
			a += m1[i][j] * v1[j];
		}
		out[i] = a;
	}
	return(out);
}

//returns the dot product between a matrix and a matrix
function MMdotprod(m1, m2){
	var a;
	var out = [];
	for(let i = 0; i < m1.length; i++){
		out[i] = [];
		for(let j = 0; j < m2[0].length; j++){
			a = 0;
			for(let k = 0; k < m1[i].length; k++){
				a += m1[i][k] * m2[k][j];
			}
			out[i][j] = a;
		}
	}
	return(out);
}

function vectorsub(v1, v2) {
	var v3 = [];
	for(let i = 0; i < v1.length; i++){
		v3[i] = v1[i] -v2[i];
	}
	return(v3);
}

//Applies a transformation matrix to a set of vectors/points and then returns the new set
function transf(tr, ver){
	var tver = [];
	for(let i = 0; i < ver.length; i++){
		tver[i] = MVdotprod(tr, ver[i]);
	}
	return(tver);
}

function transpose(mat){
	var trans = [];
	for(let i = 0; i < mat[0].length; i++){
		trans[i] = [];
	}
	for(let i = 0; i < mat.length; i++){
		for(let j = 0; j < mat[0].length; j++){
			trans[j][i] = mat[i][j];
		}
	}
	return(trans);
}

//Takes advantage of the relative ease of computing the inverse of a scalar matrix to quickly compute the scalar matrix for normals
function scalarInverse(mat){
	var inv = [];
	for(let i = 0; i < mat.length; i++){
		inv[i] = [];
		for(let j = 0; j < mat[0].length; j++){
			if(mat[i][j] == 0){
				inv[i][j] = 0;
			}
			else{
				inv[i][j] = 1/mat[i][j];
			}
			
		}
	}
	return(inv);
}

//Given an input matrix or vector, returns the vector or matrix rotated along the specified axis by the specified amount
function Mrotate(thet, ax, inp, intype){
	var transM; 
	if(ax == 'x'){
		transM = [
			[1, 0, 0, 0],
			[0, Math.cos(thet), -Math.sin(thet), 0],
			[0, Math.sin(thet), Math.cos(thet), 0],
			[0, 0, 0, 1]
		];
	}
	else if(ax == 'y'){
		transM = [
			[Math.cos(thet), 0, Math.sin(thet), 0],
			[0, 1, 0, 0],
			[-Math.sin(thet), 0, Math.cos(thet), 0],
			[0, 0, 0, 1]
		];
	}
	else if(ax == 'z'){
		transM = [
			[Math.cos(thet), Math.sin(thet), 0, 0],
			[-Math.sin(thet), Math.cos(thet), 0, 0],
			[0, 0, 1, 0],
			[0, 0, 0, 1]
		];
	}
	else{
		console.error("please specify valid input type");
		return(-1);
	}

	if(intype == 'v'){
		return(MVdotprod(transM, inp));
	}
	else if(intype == 'm'){
		return(MMdotprod(transM, inp));
	}
	else{
		console.error("please specify valid input type");
		return(-1);
	}
}

//Given an input matrix or vector, returns the vector or matrix translated along the specified axes by the specified amount
function Mtranslate(tx, ty, tz, inp, intype){
	var transM = [
			[1, 0, 0, tx],
			[0, 1, 0, ty],
			[0, 0, 1, tz],
			[0, 0, 0, 1]
		]; 


	if(intype == 'v'){
		return(MVdotprod(transM, inp));
	}
	else if(intype == 'm'){
		return(MMdotprod(transM, inp));
	}
	else{
		console.error("please specify valid input type");
		return(-1);
	}
}

//Given an input matrix, returns the matrix scaled along the specified axes by the specified amount
function Mscale(tx, ty, tz, inp){
	var outM = [];
	for(let i = 0; i < inp.length; i++){
		outM[i] = Vscale(tx, ty, tz, inp[i]);
	}
	return(outM);
}

//Given an input vector, returns the vector scaled along the specified axes by the specified amount
function Vscale(tx, ty, tz, inp){
	return([inp[0]*tx, inp[1]*ty, inp[2]*tz, inp[3]]);
}

//Returns a perspective projection matrix
function setPerspective(fov, aspect, near, far){
	proj = [
		[-1/(aspect * Math.tan(fov/2)), 0, 0, 0],
		[0, -1/Math.tan(fov/2), 0, 0],
		[0, 0, -(far+near)/(far-near), -(2*far*near)/(near-far)],
		[0, 0, -1, 0]
	];
	return(proj);
}

//Given an array of vertices, apply a projection matrix and return it
function pProject(imat, fov, aspect){
	omat = imat;
	for(let i = 0; i < omat.length; i++){
		omat[i][2] = (omat[i][2] + 3)/2;
	}
	omat = transf(setPerspective(fov, aspect, 1, 2), omat);
	omat = OverW(omat);
	return(omat);
}

//given an array of vertices, divides the XYZ by W
function OverW(imat) {
	omat = imat;
	for(let i = 0; i < omat.length; i++){
		for(let j = 0; j < 3; j++){
			omat[i][j] = omat[i][j]/omat[i][3];
		}
	}
	//console.log(omat);
	return(omat);
}


//Moves a value towards a target value by a given step value and then returns it. Step must be >0
function interpolate(cur, targ, step){
	
	var out = parseFloat(cur);
	var disc = targ - cur;
	//console.log("Discriminator: " + disc);
	if(disc > step){
		//console.log("Discriminator greater than " + step + ", incrementing " + cur);
		out += parseFloat(step);
	}else if(disc < -step){
		//console.log("Discriminator less than -" + step + ", incrementing " + cur);
		out -= parseFloat(step);
	}else{
		//console.log("Abs discriminator less than " + step + ", setting to target");
		out = targ;
	}
	//console.log("Setting to " + out);
	return(out);
}

//Edited rend() function that renders each instance in it's 'key' color allowing for selection
function detect(SOR, lnum, rot, caps, inst){
	r.clear(r.COLOR_BUFFER_BIT | r.DEPTH_BUFFER_BIT);
	var mesh;
	var mNum = 0;
	var tNorms;
	var tNorms;
	var npos;
	var nvpos;
	var tVerts;
	var vpos;
	var u_Color = r.getUniformLocation(program, 'u_Color');
	var Ping = r.getUniformLocation(program, 'u_Ping');
	r.uniform1i(Ping, 1);
	var reading = new Uint8Array(4);
	yrot = [
		[Math.cos(th), 0, Math.sin(th), 0],
		[0, 1, 0, 0],
		[-Math.sin(th), 0, Math.cos(th), 0],
		[0, 0, 0, 1]
	];


	
	for(let i = 0; i < inst; i++){
		r.uniform4fv(u_Color, new Float32Array(keys[i]));
		
		//apply scale and rotation matrices to normals
		tNorms = transf(scalarInverse(transmats[i][0]), normals);
		tNorms = transf(transmats[i][1], tNorms);
		r.bindBuffer(r.ARRAY_BUFFER, normBuffer);
		
		//push normals to shader
		npos = r.getAttribLocation(program, 'a_Normal');
		r.vertexAttribPointer(npos, 3, r.FLOAT, false, 12, 0);
		r.enableVertexAttribArray(npos);
		r.bufferData(r.ARRAY_BUFFER, new Float32Array(linearize(tNorms)), r.STATIC_DRAW);

		//apply scale and rotation matrices to vector normals
		tVNorms = transf(scalarInverse(transmats[i][0]), vnormals);
		tVNorms = transf(transmats[i][1], tVNorms);
		r.bindBuffer(r.ARRAY_BUFFER, vnormBuffer);
		
		//push vector normals to shader
		nvpos = r.getAttribLocation(program, 'a_vNormal');
		r.vertexAttribPointer(nvpos, 3, r.FLOAT, false, 12, 0);
		r.enableVertexAttribArray(nvpos);
		r.bufferData(r.ARRAY_BUFFER, new Float32Array(linearize(tVNorms)), r.STATIC_DRAW);

		
		tVerts = transf(transmats[i][0], SOR);
		tVerts = transf(transmats[i][1], tVerts);
		tVerts = transf(transmats[i][2], tVerts);
		tVerts = transf(CamAzMat, tVerts);
		tVerts = transf(CamVerMat, tVerts);
		tVerts = transf(Mtranslate(-CamX/100, -CamY/100, 0, ident, "m"), tVerts);
		if(persp){
			tVerts = pProject(tVerts, (Fov*Math.PI)/180, 1);
			//console.log(tVerts);
		}
		r.bindBuffer(r.ARRAY_BUFFER, vertBuffer);
	
		vpos = r.getAttribLocation(program, 'a_position');
		r.vertexAttribPointer(vpos, 3, r.FLOAT, false, 12, 0);
		r.enableVertexAttribArray(vpos);

		
		mesh = getTriMesh(tVerts, triangles);
		r.bufferData(r.ARRAY_BUFFER, new Float32Array(mesh), r.STATIC_DRAW);
		r.drawArrays(r.TRIANGLES, 0, (mesh.length)/3);
		
		

		/*mesh = linearize(tNorms);
		r.bufferData(r.ARRAY_BUFFER, new Float32Array(mesh), r.STATIC_DRAW);
		r.drawArrays(r.POINTS, 0, (mesh.length)/3);*/
	}
	console.log("reading pixels");
	r.readPixels(rmX, scale[1]-rmY, 1, 1, r.RGBA, r.UNSIGNED_BYTE, reading);
	console.log(reading);
	select(reading);

	//rend(SOR, lnum, rot, caps, inst);
}

//Identifies the SOR under the mouse (if any) by checking for keycolors
function select(color){
	if(color[2] > 0){
		selected = -1;
		console.log("Deselected");
	}
	else{
		selected = Math.round(color[0]/8);
		console.log("Selected " + selected);
	}
}

function newInstance(){
	if(instances >= imax){
		console.error("Maximum number of instances generated");
		return(-1);
	}
	transmats[instances] = [];
	transmats[instances][0] = ident;
	transmats[instances][1] = Mrotate(-Math.PI/2, 'x', ident, 'm');
	transmats[instances][2] = ident;
	colors[instances] = [Math.random(), Math.random(), Math.random(), 1];
	keys[instances] = [instances/32, 0, 0, 1];
	instances++;

}

//Takes coordinates from polyline, produces SOR coordinates, and renders a wireframe mesh
//Intended for static renders, not used in current version

/*function drawMesh(){
	if(stillDrawing){
		console.error("Polyline incomplete, can't draw mesh");
		return(-1);
	}

	//Fetching segments of polyline (layers of SOR), selected amount of rotations, and whether endcaps are being drawn
	var layers = numClicks;
	rots = parseInt(document.getElementById("rot").value);
	ecaps = document.getElementById("endcaps").checked;
	

	//Parsing the points from the polyline to a set of normalized Y-Z coordinates
	for(let i = 0; i < layers; i++){
		verts[i] = [];
		for(let j = 0; j < 3; j++){
			verts[i][j] = (ar[i][j + 1])/((scale[j]/2));
		}
	}

	rVerts = createSOR(verts, rots, ecaps); //Creating SOR from curve
	
	console.log("Vertices of Polyline:");
	console.log(verts);
	console.log("Layers of SOR (vertcount in polyline):");
	console.log(layers);
	console.log("Vertices of SOR:");
	console.log(rVerts);

	//preparing canvas for drawing
	r.clearColor(.80, .64, .96, 1.0);
	r.clear(r.COLOR_BUFFER_BIT);
	r.useProgram(program);
	rend(rVerts, layers, rots, ecaps, 1); //rendering SOR coords as wireframe
}*/

