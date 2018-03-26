var options = {
    framerate: 60,
    G: 10,
    START_SPEED: 10,
    MOVER_COUNT: 32,
    TRAILS_DISPLAY: true,
    SHOW_DIED: false,
    SHOW_LABELS: true, 
    TRAILS_LENGTH: 1000,
    MIN_MASS: .01,
    MAX_MASS: 1000,
    DENSITY: 0.1,
    MoveSpeed: 500,
};

// LOAD CONFIG 
if (localStorage && localStorage.getItem("options")){
    optionsSVG = JSON.parse(localStorage.getItem("options"));
    for (var key in optionsSVG) {
        console.log(key, optionsSVG[key]);
        options.key = optionsSVG.key;
        options[key] = optionsSVG[key];
      }
}

options.AddBigStar = function () {
    AddBigMoverToCenter();
}

options.RESET = function () {
    reset();
}

options.SAVECONFIG = function () {
    // SVG CONFIG OPTIONS
    localStorage.setItem("options", JSON.stringify(options));
}

// dat GUI
var gui = new dat.GUI();
var f = gui.addFolder('Environment');
f.open();
//f.add(options, 'framerate', 1, 120);
f.add(options, 'G', 1, 1000);

var fMoverCountE = f.add(options, 'MOVER_COUNT', 1, 128);
fMoverCountE.onFinishChange(function (value) {
    // Fires when a controller loses focus.
    //reset();
});

f = gui.addFolder('Trails & Labels');
f.open();
f.add(options, 'TRAILS_DISPLAY');
f.add(options, 'TRAILS_LENGTH', 0, 10000);

f.add(options, 'SHOW_DIED');
f.add(options, 'SHOW_LABELS');

f = gui.addFolder('Masses');
f.open();

var fMinMassChangeE = f.add(options, 'MIN_MASS', .00001, 10000.0);
fMinMassChangeE.onFinishChange(function (value) {
    if(options.MAX_MASS<options.MIN_MASS){
        options.MAX_MASS = value;
        fMaxMassChangeE.updateDisplay();
    }
    //reset();
});

var fMaxMassChangeE = f.add(options, 'MAX_MASS', .00001, 10000.0);
fMaxMassChangeE.onFinishChange(function (value) {
    //reset();
});

f = gui.addFolder('Start');
f.open();

var fDensityE = f.add(options, 'DENSITY', 1e-100, 1.0);
fDensityE.onFinishChange(function (value) {
    //reset();
});

var fSpeedE = f.add(options, 'START_SPEED', 1e-100, 100.0);
fSpeedE.onFinishChange(function (value) {
    //reset();
});

var moveSpeed = 100;
f.add(options, 'MoveSpeed', 1, 1000).onFinishChange(function (value) {
    //console.log(value);
    moveSpeed = Math.floor(options.MoveSpeed);
    console.log(moveSpeed);
});

f.add(options, 'AddBigStar');
f.add(options, 'RESET');
f.add(options, 'SAVECONFIG');

console.log(gui);

//var HTTP_GET_VARS=new Array();
//var strGET=document.location.search.substr(1,document.location.search.length);
//if(strGET!='')
//{
//    gArr=strGET.split('&');
//    for(i=0;i<gArr.length;++i)
//    {
//        v='';vArr=gArr[i].split('=');
//        if(vArr.length>1){v=vArr[1];}
//        HTTP_GET_VARS[unescape(vArr[0])]=unescape(v);
//    }
//}
//
//function GET(v)
//{
//    if(!HTTP_GET_VARS[v]){return 'undefined';}
//    return HTTP_GET_VARS[v];
//}
//




//var G = 100;

//var MOVER_COUNT = 32;

//var MOVER_MASS_MIN = .0000001;
//var MOVER_MASS_MAX = 100;

///* GET parameters for configuration: */
//var GET_G = parseFloat(GET("G"));
//if (GET_G > 0) {
//    G = GET_G;
//}
//var GET_mover_count = parseInt(GET("count"));
//if (GET_mover_count) {
//    MOVER_COUNT = GET_mover_count;
//}
//var GET_min=parseFloat(GET("min"));
//if (GET_min > 0) {
//    MOVER_MASS_MIN = GET_min;
//}
//var GET_max=parseFloat(GET("max"));
//if (GET_max > 0) {
//    MOVER_MASS_MAX = GET_max;
//}

//var FPS = 60;
var MASS_FACTOR = .01; // for display of size

var SPHERE_SIDES = 12;
//var TRAILS_LENGTH = 100;

var zoom = 1.0;
var translate = new THREE.Vector3();

var movers = [];
//var container =  false; // ME
//var textlabels = [];

var now;
var then = Date.now();
var renderInterval = 1000 / parseInt(options.framerate);
var renderDelta;

var clock = new THREE.Clock();

var scene = new THREE.Scene({
    castShadow: true
});

// CAMERA 

var cameraOrtho = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100000000.0);
//var cameraFPS   = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100000000.0);

var camera = cameraOrtho
var renderer = new THREE.WebGLRenderer({
    preserveDrawingBuffer: true
});
//var projector = new THREE.Projector();

var isMoverSelected = false;

var onMouseDown = false;
var theta = 20,
    phi = 10;
var currentRadius = 5*2000.0;

isShowCamPerspectiveHelper = false;
if(isShowCamPerspectiveHelper){
    cameraPerspectiveHelper = new THREE.CameraHelper(camera);
    scene.add(cameraPerspectiveHelper);
}

setCamera();
function setCamera() {
    for (var i = 0; i < movers.length; i = i + 1) {
        updateTrails(movers[i]);
    }
    camera.position.x = currentRadius * Math.sin(theta * Math.PI / 360) * Math.cos(phi * Math.PI / 360);
    camera.position.y = currentRadius * Math.sin(phi * Math.PI / 360);
    camera.position.z = currentRadius * Math.cos(theta * Math.PI / 360) * Math.cos(phi * Math.PI / 360);
    // ressemble à https://github.com/mrdoob/three.js/issues/974 
    //        et à https://github.com/mrdoob/three.js/issues/783   **
    //			   https://github.com/mrdoob/three.js/issues/1468

    // https://github.com/mrdoob/three.js/issues/983  **   pb entre FPS et dat.gui.js

    camera.lookAt(new THREE.Vector3(0, 0, 0));
    camera.updateMatrix();
}

var controlOrbit = new THREE.OrbitControls(camera, renderer.domElement);
controlOrbit.zoomSpeed = 100

var control2FPS; /* = new THREE.FirstPersonControls(camera);
	control2FPS.movementSpeed = 1000*5;
	control2FPS.lookSpeed = 0.1;
	//control2FPS.lon = -90 // in degree // See : https://stackoverflow.com/questions/20905101/three-js-firstperson-control-start-orientation
	https://stackoverflow.com/questions/30206243/how-to-switch-three-js-camera-controls-from-first-person-to-orbit-and-back
			http://jsbin.com/jekebo/2/edit?html,js,output
			http://jsbin.com/ronovazeca/edit?js,output 
	https://stackoverflow.com/questions/11304998/switch-threejs-controls-from-trackball-to-flycontrols-and-vice-versa 
	
https://stackoverflow.com/questions/16506693/cannot-set-lookat-position-for-camera-with-firstpersoncontrols-js/49343940#49343940
	Avec ma Réponse sur lon = angle..
	
*/
var controls = controlOrbit;

var direction;
var camera2FPS

//cameraPerspectiveHelper.visible = true;

function SwitchControl(k) {

    console.log("SwitchControl(" + k + ")");

    direction = camera.getWorldDirection().clone();
    camRotation = camera.rotation.clone();
    console.log(direction);


    if (k == 2) {

        console.log("FirstPersonControls");
        if (!control2FPS) {
            camera2FPS = camera.clone()
            scene.add(camera2FPS);

            control2FPS = new THREE.FirstPersonControls(camera2FPS, renderer.domElement);
            control2FPS.movementSpeed = 1000 * 5;
            control2FPS.lookSpeed = 0.1;
            control2FPS.enabled = false;
        }
        /*	
            angleX = direction.angleTo (new THREE.Vector3(1,0,0))
            console.log("angleX:" + angleX); // direction.normalize())
            controls.lon = - angleX * 180 / Math.PI;
        */

        controls = control2FPS;
        camera = camera2FPS;

        camera.lookAt(direction);

        camera.rotation.copy(camera2FPS.rotation)

        //camera.rotation.set(svgCamera.rotation.x, svgCamera.rotation.y, svgCamera.rotation.z);
		/*
		camera.rotation.x = svgCamera.rotation.x;
		camera.rotation.y = svgCamera.rotation.y;
		camera.rotation.z = svgCamera.rotation.z;
		*/
        controls.enabled = true;

        //camera.lookAt(direction);
    } else if (k == 1) {

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.zoomSpeed = 100
        console.log("OrbitControls");
        controls.enabled = false;


    } else {
        // TODO 
        console.log("ArrowHelper");
    }
}

//
//f = gui.addFolder('Blobs');
//f.open();

// END dat GUI

// -----------


var lineMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff
});

scene.castShadow = true;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.autoClearColor = true;
//renderer.shadowMapEnabled=true;
document.body.appendChild(renderer.domElement);
//var geometry = new THREE.SphereGeometry(1.0,8,8);
//cube = new THREE.Mesh(geometry, material);
//scene.add(cube);
var cube;

// SELECTED VAR
var biggest
var selection
var lastOne


// MATERIAL 

var basicMaterial = new THREE.MeshLambertMaterial({
    ambient: 0x111111,
    diffuse: 0x555555,
    specular: 0xffffff,
    shininess: 50
});

var selectedMaterial = new THREE.MeshLambertMaterial({
    ambient: 0xaaaaaa,
    diffuse: 0xdddddd,
    specular: 0xffffff,
    shininess: 50,
    emissive: 0x000000
});

// LIGHT

// add subtle ambient lighting
// directional lighting
var directionalLight = new THREE.DirectionalLight(0x666666);
directionalLight.position.set(1000, 1000, 1000);
directionalLight.castShadow = true;
//scene.add(directionalLight);

var selectionLight = new THREE.PointLight(0xff0000, 0);
selectionLight.castShadow = true;
//scene.add(selectionLight);

/*var redLight = new THREE.DirectionalLight(0xaa0000);
 redLight.position.set(1, 0, 1);
 scene.add(redLight);

 var blueLight = new THREE.DirectionalLight(0x0000aa);
 blueLight.position.set(1,1, 0);
 scene.add(blueLight);

 var greenLight = new THREE.DirectionalLight(0x00aa00);
 greenLight.position.set(0, 1, 1);
 scene.add(greenLight);*/

 // FRAMERATE

var $real_framerate = $("#real_framerate");
var $framerate = $("#framerate");
$framerate.bind("change keyup mouseup", function () {
    var v = parseInt(this.value);
    if (v > 0) {
        //options.framerate = v;
        renderInterval = 1000 / parseInt(options.framerate);
    }
}).change();
//
//var $trails_length = $("#trails_length");
////TRAILS_LENGTH = parseInt($trails_length.val());
//$trails_length.bind("change",function(e) {
//   //TRAILS_LENGTH = parseInt(this.value);
//   $(this).parent().find("span").html(TRAILS_LENGTH);
//   render();
//   return false;
//}).change();

//var $activate_trails = $("#activate_trails");
//$activate_trails.bind("change",function() {
//   displayTrails = $(this).is(":checked");
//    return false;
//});
//

// JSQUERY

var $movers_alive_count = $("#movers_alive_count");
var $total_mass = $("#total_mass");
var $maximum_mass = $("#maximum_mass");
var $largest_pos = $("#largest_pos");
var $select_infos = $("#select_infos");
var $camera_info = $("#camera_info");
//var speedometer = document.getElementById('speedometer');
var IHMButtons = document.getElementById('IHMButtons');
var tracker;


var displayMass = false;
//var displayTrails = $activate_trails.is(":checked");;
reset();

var pause = false;

// ADD SKYBOX ---
/*
		sbVertexShader = [
			"varying vec3 vWorldPosition;",
			"void main() {",
			"  vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",
			"  vWorldPosition = worldPosition.xyz;",
			"  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
			"}",
			].join("\n");

		sbFragmentShader = [
			"uniform vec3 topColor;",
			"uniform vec3 bottomColor;",
			"uniform float offset;",
			"uniform float exponent;",
			"varying vec3 vWorldPosition;",
			"void main() {",
			"  float h = normalize( vWorldPosition + offset ).y;",
			"  gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( h, exponent ), 0.0 ) ), 1.0 );",
			"}",
			].join("\n");

		var iSBrsize = 1500;
		var uniforms = {
		  topColor: {type: "c", value: new THREE.Color(0x0077ff)}, bottomColor: {type: "c", value: new THREE.Color(0xffffff)},
		  offset: {type: "f", value: iSBrsize}, exponent: {type: "f", value: 1.5}
		}

		var skyGeo = new THREE.SphereGeometry(iSBrsize, 32, 32);
		skyMat = new THREE.ShaderMaterial({vertexShader: sbVertexShader, fragmentShader: sbFragmentShader, uniforms: uniforms, side: THREE.DoubleSide, fog: false});
		skyMesh = new THREE.Mesh(skyGeo, skyMat);
		//scene.add(skyMesh);

		// --- 
*/

// ADD 100 WHITE Box
/*	
	    geometry = new THREE.CubeGeometry( 20, 20, 20, 1, 1, 1 );
		
		for (var i = 0; i < 400; i++) {
		  var b = new THREE.Mesh(
			//new THREE.BoxGeometry(1, 1, 1),
			geometry,
			//new THREE.MeshBasicMaterial({ color: "#EEEDDD" })
			new THREE.MeshBasicMaterial( { color: 0xFFFFFF * Math.random(), wireframe: true } )
		  );

		  b.position.x = -300 + Math.random() * 600;
		  b.position.y = -300 + Math.random() * 600;
		  b.position.z = -300 + Math.random() * 600;
		  
          b.position.multiplyScalar( 5 );
		  
		  //b.scale.multiplyScalar(20);

		  scene.add(b);
		}

	// BIG CUBE 
	var geometry = new THREE.BoxGeometry( 1000, 1000, 1000 );
	var material = new THREE.MeshLambertMaterial( {color: 0x00ff00, wireframe: false } );
	var BigCube = new THREE.Mesh( geometry, material );
	BigCube.scale.multiplyScalar(5);
	scene.add( BigCube );
*/

// AXIS HELPERS

var axesHelper = new THREE.AxisHelper(5000*10);
scene.add(axesHelper);


// DRAW RENDER 

function draw() {
    requestAnimationFrame(draw);
    now = Date.now();
    renderDelta = now - then;
    if (renderDelta > renderInterval) {
        then = now - (renderDelta % renderInterval);
        render();
    }
}
draw();

var lastTimeCalled = new Date();
var countFramesPerSecond = 0;
var total_mass = 0;

// RENDER

//var moveSpeed = 100;
function render() {
    if(isShowCamPerspectiveHelper){
        cameraPerspectiveHelper.update();
        cameraPerspectiveHelper.visible = true;
    }

    // DEPLACEMENT 
    var vector = new THREE.Vector3();
    var direction = camera.getWorldDirection(vector);
    if (holdUp) {
        camera.position.add(vector.multiplyScalar(moveSpeed));
    } else if (holdDown) {
        camera.position.sub(direction.multiplyScalar(moveSpeed));
    }
    /*
    if(holdLeft){
        camera.rotation.y += 1/100;
    } else if(holdRight){
        camera.rotation.y -= 1/100;
    }
    */

    // TIMER
    var timeNow = new Date();
    if (lastTimeCalled && timeNow.getMilliseconds() < lastTimeCalled.getMilliseconds()) {
        $real_framerate.html(countFramesPerSecond);
        countFramesPerSecond = 1;
    } else {
        countFramesPerSecond += 1;
    }

    var movers_alive_count = 0;
    total_mass = 0;
    var maximum_mass = 0.00;

    if (biggest)
        largest_pos = 'd: ' + NumToFormat(biggest.location.distanceTo(camera.position)) + ' id:' + biggest.id;
    else
        largest_pos = 0


    if (movers && movers.length) {
        if (!pause) {

            for (var i = movers.length - 1; i >= 0; i--) {
                var m = movers[i];

                if (m.alive) {
                    movers_alive_count++;
                    total_mass += m.mass;
                    if (m.mass > maximum_mass) {
                        maximum_mass = m.mass;

                        biggest = m;

                        m.biggest = true;

                    } else if (m.biggest) { m.biggest = false; }


                    for (var j = movers.length - 1; j >= 0; j--) {
                        var a = movers[j];
                        if (movers[i].alive && movers[j].alive && i != j) {
                            var distance = m.location.distanceTo(a.location);

                            var radiusM = Math.pow((m.mass / MASS_FACTOR / MASS_FACTOR / 4 * Math.PI), 1 / 3) / 3;
                            var radiusA = Math.pow((a.mass / MASS_FACTOR / MASS_FACTOR / 4 * Math.PI), 1 / 3) / 3;

                            if (distance < radiusM + radiusA) {
                                // merge objects
                                if (a.mass > m.mass)
                                    a.eat(m);
                                else
                                    m.eat(a);
                            } else {
                                a.attract(m);
                            }
                        }
                    }
                }
            }
        }
        /*
            if(!tracker) {
                tracker = document.createElement('div');
                IHMButtons.appendChild(tracker)
            } else {
                IHMButtons.removeChild(tracker)
                tracker = document.createElement('div');
                IHMButtons.appendChild(tracker)
            }
        */
        // DISPLAY
        for (var i = movers.length - 1; i >= 0; i--) {
            var m = movers[i];
            if (m.alive) {
                if (!pause) {
                    m.update();
                }
            }
            m.display(displayMass); // ME déplacé ici 
            updateTrails(m);
        }
/*
        if(textlabels && !pause){
            // UPDATE LABELS
            for(var i=0; i<textlabels.length; i++) {
                textlabels[i].updatePosition();
            }
        }
*/
        // Fix FPS CAM if Enabled 
        if (isMoverSelected && document.getElementById('cbFPS').checked) {
            camera.lookAt(selection.mesh.position);

            if(!pause && document.getElementById('cbZoom').checked){
                if(selection.mesh.position.distanceTo(camera.position)>7000){
                    direction2 = direction.clone().multiplyScalar(moveSpeed);
                    //console.log(direction2.length());
                    camera.position.x += direction2.x;
                    camera.position.y += direction2.y;
                    camera.position.z += direction2.z;
                } else {
                    document.getElementById("cbZoom").checked = false;
                }
            }
        }

        // INFOS PANEL

        $movers_alive_count.html(movers_alive_count + ' / ' + movers.length);
        var rapportMasse = maximum_mass / total_mass * 100;
        $maximum_mass.html(NumToFormat(maximum_mass));
        $total_mass.html(NumToFormat(total_mass) + ' = ' + NumToFormat(rapportMasse) + '%' );

        $largest_pos.html(largest_pos);
        $largest_pos.css('color', "#" + biggest.mesh.material.color.getHexString());

        // camera 
        $camera_info.html('<br/>' + format2Vector(camera.position) + format2Vector(camera.rotation, 2, 'r') );

        //speedometer.innerHTML = 'XX'; // format2Vector(camera.position)

        // selection info/debug
        if (selection) {
            var selectionMsg = '<br/> id:' + selection.id;

            if (selection.alive)
                selectionMsg += ' alive';
            else
                selectionMsg += ' Killed by ' + selection.killedBy;

            selectionMsg += '<br/>' + format2Vector(selection.mesh.position);
            selectionMsg += 'Dcam: ' + NumToFormat(selection.location.distanceTo(camera.position));
            selectionMsg += '<br/>Mass: ' + NumToFormat(selection.mass);
           
            if (selection.biggest)
                selectionMsg += ' BIGGEST';

            selectionMsg += '<br/>Velocity: ' + NumToFormat(selection.velocity.length(),2);
            
            $select_infos.html(selectionMsg);
            $select_infos.css('color', "#" + selection.mesh.material.color.getHexString());
        }
    }

    // RENDERER
    controls.update(clock.getDelta());
    renderer.render(scene, camera);

    lastTimeCalled = new Date();

}


// MOUSE EVENT

window.onmousemove = function (e) {

    if (onMouseDown) onMouseDown.moved = true;

    var vector = new THREE.Vector3(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1, 0.5);
    //projector.unprojectVector( vector, camera );

    vector.unproject(camera);

    var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

    var intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        $("body").css("cursor", "pointer");
        /*	
            if (window.event.ctrlKey) {
                    var clickedObj = (intersects[0].object);
                    SelectMeshMover(clickedObj, 'ctlr');
                }
        */
    } else {
        $("body").css("cursor", "default");
    }

}


// MOUSE EVENT DOWN / UP

initMouseEvent();
function initMouseEvent() {

    //window.onmousedown = MyMouseDown
    window.addEventListener('mousedown', MyMouseDown, true);

    function MyMouseDown(e) {
        if (e.target.tagName === "CANVAS") {
            onMouseDown = {
                moved: false
            };
        }

        switch (e.button) {
            case 2: // Secondary button ("right")

                //console.log("click2");

                var vector = new THREE.Vector3(
                    (e.clientX / window.innerWidth) * 2 - 1,
                    -(e.clientY / window.innerHeight) * 2 + 1, 0.5);

                vector.unproject(camera);

                var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

                var intersects = raycaster.intersectObjects(scene.children);

                if (intersects.length > 0) { // SELECTION

                    var clickedObj = (intersects[0].object);

                    // console.log(intersects[0]);

                    SelectMeshMover(clickedObj, 'c2')

                }
                else { // ADD NEW BALL MOVER

                    var mass = random(options.MIN_MASS, options.MAX_MASS);

                    var vel = raycaster.ray.direction.clone().multiplyScalar(parseFloat(options.START_SPEED));
                    var loc = raycaster.ray.origin.clone();

                    var newObject = new Mover(mass, vel, loc, movers.length, 'm');
                    console.log("c2 > add " + newObject.id + " mass:" + newObject.mass.toFixed(0));
                    newObject.addToMovers();


                    lastOne = newObject;

                } // add ball 
                break;
        } // switch 
    }

    window.onmouseup = function (e) {
        if (e.target.tagName === "CANVAS") {
            if (!onMouseDown.moved) {
                var vector = new THREE.Vector3(
                    (e.clientX / window.innerWidth) * 2 - 1,
                    -(e.clientY / window.innerHeight) * 2 + 1, 0.5);

                vector.unproject(camera);

                var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

                var intersects = raycaster.intersectObjects(scene.children);

                if (intersects.length > 0) {

                    var clickedObj = (intersects[0].object);

                    SelectMeshMover(clickedObj, 'c1')

                    /*
    
                    isMoverSelected = false;
    
                    for (var i = 0; i < movers.length; i = i + 1) {
                        let mover = movers[i];
                        if (mover.mesh == clickedObj) {
                            mover.selected = !mover.selected;
    
                            isMoverSelected = mover.selected;
                        	
                            var selectionMsg = i + ' id:' + mover.id + '  mass:' + NumToFormat(mover.mass);
    
                            //console.log("click1");
                            console.log("c1 > SELECTED " + selectionMsg);
                            //console.log(movers[i]);
                        	
                            $select_infos.html( selectionMsg );
                        	
                            selection = mover; 
                        	
                        /*
                            var distanceToObject = camera.distanceTo( movers[i].position );
                            camera.position.add( distanceToObject.multiplyScalar(0.5) );
                            camera.lookAt(movers[i].position);
                        *
                        } else {
                            movers[i].selected = false;
                        }
                    }*/

                } else {
                    isMoverSelected = false;
                }
            }
        }
        onMouseDown = false;
    }
}

// SELECTION :

function SelectMeshMover(clickedObj, str) {
    console.log(str + " > selected idM:" + clickedObj.id); //, clickedObj); // + '  mass=' + clickedObj.mover.mass.toFixed());
    selection = mover = clickedObj.mover;
    //$select_infos.html( clickedObj.id );  // largest_pos.toFixed(2)

    if (!mover.selected)
        ClearSelection();

    mover.selected = !mover.selected;

    isMoverSelected = mover.selected;
}

function ClearSelection() {
    for (var i = movers.length - 1; i >= 0; i--) {
        var m = movers[i];
        if (m.selected) {
            m.selected = false;
        }
    }
}

window.onresize = function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};

console.time();

// KEYBOARD 

var holdLeft = false,
    holdRight = false,
    holdUp = false,
    holdDown = false;

window.onkeyup = function (e) {
    if (e.which == 37) {
        holdLeft = false;
    } else if (e.which == 38) {
        holdUp = false;
    } else if (e.which == 39) {
        holdRight = false;
    } else if (e.which == 40) {
        holdDown = false;
    }
}
    
window.onkeydown = function (e) {
    var charTMP = String.fromCharCode(e.which);
    console.count("key:" + charTMP + ':' + e.which);

    direction = camera.getWorldDirection().clone();

    // ECHAP
    if (e.which == 27) {
        //isCameraLookAt = !isCameraLookAt

        // AddArrowHelper(direction);

        var strControlName = "";
        if (controls instanceof (THREE.OrbitControls))
            strControlName = "OrbitControls"
        else if (controls instanceof (THREE.FirstPersonControls)) {
            strControlName = "FirstPersonControls"
            /*	
                angleX = direction.angleTo (new THREE.Vector3(1,0,0))
                console.log("angleX:" + angleX); // direction.normalize())
                controls.lon = - angleX * 180 / Math.PI;
            */
            LogFPS();
        }

        controls.enabled = !controls.enabled

        console.log(strControlName + " state: " + controls.enabled)
    }

    else if (e.which == 37) {
        holdLeft = true;
    } else if (e.which == 38) {
        holdUp = true;
    } else if (e.which == 39) {
        holdRight = true;
    } else if (e.which == 40) {
        holdDown = true;
        //    } else if (e.which === 82) {
        //        reset();
    } else if (e.which === 84) { // [T]rails
        $activate_trails.prop("checked", !$activate_trails.prop("checked")).change();

    } else if (e.which === 32) { // SPACE
        pause = !pause;
        e.preventDefault();
        if (pause) console.timeEnd()
        else console.time();
        return false;

    } else if (e.which === 49) { // 1 OrbitControls
        controls = controlOrbit
        console.log("O")

    } else if (e.which === 50) { // 2  FPS
        //controls = control2FPS
        //console.log("FPS")

        SwitchControl(2);
        AddArrowHelper(direction)
        LogFPS();

        console.log(direction)

        angleX = direction.angleTo(new THREE.Vector3(1, 0, 0))
        console.log("angleX:" + NumToFormat(angleX,2)); // direction.normalize())
        controls.lon = - angleX * 180 / Math.PI;

        angleY = direction.angleTo(new THREE.Vector3(0, 1, 0))
        console.log("angleY:" + NumToFormat(angleY,2)); // direction.normalize())
        //controls.lat = - angleY * 180 / Math.PI;

        // https://stackoverflow.com/questions/12500874/three-js-first-person-controls
        // this.phi = (90 - this.lat) * Math.PI / 180;
        // this.theta = this.lon * Math.PI / 180;

        //camera.lookAt(new THREE.Vector3(0, 0, 0));

        //controls.enabled = false;

        controls.update(clock.getDelta());
        renderer.render(scene, camera);

    } else if (e.which === 51) { // 3 LOG ?
        AddArrowHelper(direction)
        LogFPS();
    }
}


function reset() {
    console.log("RESET !")
    if (movers) {
        for (var i = 0; i < movers.length; i = i + 1) {
            scene.remove(movers[i].mesh);
            scene.remove(movers[i].selectionLight);
            scene.remove(movers[i].line);

            if(!movers[i].alive)
                scene.remove(movers[i].impactCube);

            console.log('Remove:', i, movers[i].id);
            IHMButtons.removeChild(movers[i].htmlButton);
            document.body.removeChild(movers[i].text.element);
        }
    }
    movers = [];
    translate.x = 0.0;
    translate.y = 0.0;
    translate.z = 0.0;

    // generate N movers with random mass (N = MOVER_COUNT)
    for (var i = 0; i < parseInt(options.MOVER_COUNT); i = i + 1) {
        AddRandomMover(i);
    }

    // SVG LAST CONFIG OPTIONS
    // localStorage.setItem("options", JSON.stringify(options));
}

function AddRandomMover(id) {
    var mass = random(options.MIN_MASS, options.MAX_MASS);

    var max_distance = parseFloat(1000 / options.DENSITY);
    var max_speed = parseFloat(options.START_SPEED);

    var vel = new THREE.Vector3(
        random(-max_speed, max_speed),
        random(-max_speed, max_speed),
        random(-max_speed, max_speed));

    var loc = new THREE.Vector3(
        random(-max_distance, max_distance),
        random(-max_distance, max_distance),
        random(-max_distance, max_distance));

    //movers.push(new Mover(mass, vel, loc, id));
    //addClickButtonEvent(id);

    var newMover = new Mover(mass, vel, loc, id);
    newMover.addToMovers();
}

function AddBigMoverToCenter() {
    var mass = 100000;

    var vel = new THREE.Vector3(0, 0, 0);
    var loc = new THREE.Vector3(0, 0, 0);

    name = movers.length + 'Big'
    big = new Mover(mass, vel, loc, movers.length, 'Big');
    big.mesh.material.transparent = true;
    big.mesh.material.opacity = 0.8

    big.addToMovers();

}


//Set htmlButtons = new Set();
var htmlButtons = [];

// CLICK on GUI SELECTION BUTTON
function addClickButtonEvent(name) {

    $(document).ready(function () {
        $('#' + name).click(function () {

            var id = this.id;

            console.log(this.id)
            //console.log(this);

            if (id === parseInt(id, 10))
                console.log("int")

            mover = movers[this.id]

            SelectMeshMover(mover.mesh, 'b');

            if (document.getElementById('cbFPS').checked) {
                //if(!(controls instanceof (THREE.FirstPersonControls))) {
                SwitchControl(2);
                controls.enabled = false;
                //} else console.log('orbit');
            }

            camera.lookAt(mover.mesh.position);
/*
            direction = camera.getWorldDirection().clone();

            angleX = direction.angleTo(new THREE.Vector3(1, 0, 0))
            console.log("angleX:" + angleX); // direction.normalize())
            controls.lon = - angleX * 180 / Math.PI;
*/
        });
    });
}

function inverseSelectionStatus() {
   if(!selection)
    return;
    if(selection.alive)
        return selection.kill();
    else 
        return selection.reborn()
}

function inverseDirection() {
    if(selection)
        selection.velocity.multiplyScalar(-1);
}

function lookSun(string) {
    console.log(string);
    document.getElementById('cbFPS').checked = false; 
    camera.lookAt(new THREE.Vector3(0, 0, 0));
}


function createTextLabel() {
    var div = document.createElement('div');
    div.className = 'text-label';
    div.style.position = 'absolute';
    div.style.width = 100;
    div.style.height = 100;
    div.innerHTML = "hi there!";
    div.style.top = -1000;
    div.style.left = -1000;
    
    var _this = this;
    
    return {
      element: div,
      parent: false,
      position: new THREE.Vector3(0,0,0),
      setHTML: function(html) {
        this.element.innerHTML = html;
      },
      setParent: function(threejsobj) {
        this.parent = threejsobj;
      },

      updatePosition: function() {
        if(parent) {
          this.position.copy(this.parent.position);
        }
        
        var coords2d = this.get2DCoords(this.position, _this.camera);
        if(coords2d.x < window.innerWidth -30 && coords2d.y < window.innerHeight - 20){
            this.element.style.left = coords2d.x + 'px';
            this.element.style.top = coords2d.y + 'px';
            this.element.style.display = ''; // SHOW IT
        }
      },

      get2DCoords: function(position, camera) {
        var vector = position.project(camera);
        vector.x = (vector.x + 1)/2 * window.innerWidth;
        vector.y = -(vector.y - 1)/2 * window.innerHeight;
        return vector;
      }
    };
  }




// MOVER CLASS

function Mover(m, vel, loc, id, suffix) {
    this.location = loc,
        this.velocity = vel,
        this.acceleration = new THREE.Vector3(0.0, 0.0, 0.0),
        this.mass = m,
        this.c = 0xffffff,
        this.alive = true;
    this.geometry = new THREE.SphereGeometry(100.0, SPHERE_SIDES, SPHERE_SIDES);
    this.id = id;
    if (!suffix) suffix = "";
    this.name = id + suffix;

    this.vertices = []; // PATH OF MOVEMENT

    this.line = new THREE.Line(); // line to display movement

    this.color = this.line.material.color;
    //this.line = THREE.Line(this.lineGeometry, lineMaterial);

    this.basicMaterial = new THREE.MeshPhongMaterial({
        ambient: 0x111111,
        color: this.color,
        specular: this.color,
        shininess: 10
    });

    this.selectionLight = new THREE.PointLight(this.color, .1);
    this.selectionLight.position.copy(this.location);
    this.mesh = new THREE.Mesh(this.geometry, this.basicMaterial);
    this.mesh.castShadow = false;
    this.mesh.receiveShadow = true;

    // ME for SELECTED
    this.mesh.mover = this;
    this.biggest = false;

    this.position = this.location;

    this.index = movers.length;
    this.selected = false;

    scene.add(this.mesh);
    scene.add(this.selectionLight);
    //scene.add(this.line);
    //c = color( constrain(vel.mag()*100,0,255),
    //    constrain(255-vel.mag()*20,0,255),
    //    constrain(255-vel.mag()*50,0,255));

    // BUTTON IHM 
    this.htmlButton = document.createElement("BUTTON")
    this.htmlButton.style.backgroundColor = '#' + this.color.getHexString();

    this.htmlButton.label = t = document.createTextNode(this.name);
    this.htmlButton.appendChild(t);

    IHMButtons.appendChild(this.htmlButton)

    //this.htmlButton.mover = this; 	
    //this.htmlButton.onclick = console.log(this.id);
    this.htmlButton.id = this.id;
    this.nbEat=0;

    // LABEL 
    this.text = createTextLabel();
    this.text.setHTML(this.id);
    this.text.setParent(this.mesh);
    this.text.element.style.color = '#' + this.color.getHexString();


    this.addToMovers = function () {
        movers.push(this);
        addClickButtonEvent(this.id);

        //textlabels.push(this.text);
        document.body.appendChild(this.text.element);

      //container.appendChild(this.text.element);
      //container.appendChild(renderer.domElement);

    };

    this.applyForce = function (force) {
        if (!this.mass) this.mass = 1.0;
        var f = force.divideScalar(this.mass);
        this.acceleration.add(f);
    };

    this.update = function () {

        this.velocity.add(this.acceleration);
        this.location.add(this.velocity);
        this.acceleration.multiplyScalar(0);

        this.selectionLight.position.copy(this.location);
        this.mesh.position.copy(this.location);
        //this.lineGeometry.

        if (this.vertices.length > 10000) this.vertices.splice(0, 1);

        this.vertices.push(this.location.clone());
        //this.lineGeometry.verticesNeedUpdate = true;

    };

    this.eat = function (m) { // m => other Mover object
        var newMass = this.mass + m.mass;

        console.log(this.id + ' EAT ' + m.id + ' > newMass=' + NumToFormat(newMass, 0))

        var newLocation = new THREE.Vector3(
            (this.location.x * this.mass + m.location.x * m.mass) / newMass,
            (this.location.y * this.mass + m.location.y * m.mass) / newMass,
            (this.location.z * this.mass + m.location.z * m.mass) / newMass);

        var newVelocity = new THREE.Vector3(
            (this.velocity.x * this.mass + m.velocity.x * m.mass) / newMass,
            (this.velocity.y * this.mass + m.velocity.y * m.mass) / newMass,
            (this.velocity.z * this.mass + m.velocity.z * m.mass) / newMass);

        this.location = newLocation;
        this.velocity = newVelocity;
        this.mass = newMass;
        m.killedBy = this.id;

        if (m.selected) this.selected = true;

        this.nbEat+=1; 
        this.htmlButton.label.data = this.id + 'x' + this.nbEat;

        m.kill();
    };

    this.kill = function () {
        console.log(this.id + ' was killed - mass: ' + NumToFormat(this.mass) )
        this.alive = false;
        this.selectionLight.intensity = 0.7; //ME
        scene.remove(this.mesh);

        // HTML BUTTON
        this.htmlButton.label.data += 'k'
        this.htmlButton.style.backgroundColor = 'black'
        this.htmlButton.style.color = '#' + this.color.getHexString();

        // IMPACT CUBE
        var geometry = new THREE.BoxGeometry(20, 20, 20);
        var material = new THREE.MeshLambertMaterial({ color: this.color, wireframe: true });
        this.impactCube = new THREE.Mesh(geometry, material);
        this.impactCube.scale.multiplyScalar(this.scale * 5);
        this.impactCube.position.copy(this.mesh.position);
        this.impactCube.mover = this;
        scene.add(this.impactCube);
    };

    this.reborn = function () {
        console.log(this.id + ' reborn - mass: ' + this.mass.toFixed(2));
        this.alive = true;
        scene.add(this.mesh);

        this.htmlButton.label.data += 'r'
        this.htmlButton.style.backgroundColor = 'white'
    };

    this.attract = function (m) { // m => other Mover object
        // console.log(this.id +' est en mouvement p/r à ' + m.id);
        var force = new THREE.Vector3().subVectors(this.location, m.location); // Calculate direction of force
        var d = force.length(); // Distance between objects
        if (d < 0) d *= -1;
        //d = constrain(d,5.0,25.0);                        // Limiting the distance to eliminate "extreme" results for very close or very far objects
        force = force.normalize(); // Normalize vector (distance doesn't matter here, we just want this vector for direction)
        var strength = -(options.G * this.mass * m.mass) / (d * d); // Calculate gravitional force magnitude
        force = force.multiplyScalar(strength); // Get force vector --> magnitude * direction
        //console.log("distance", d, "strength", strength);
        //console.log("force",force);
        //console.log(force.x);
        this.applyForce(force);
        //return m;
    };

    this.display = function () {
        if (isMoverSelected) {
            if (this.selected) {
                this.selectionLight.intensity = 1;
                this.htmlButton.style.border = "thick solid #FF0000";
                if(options.SHOW_LABELS)
                    this.text.updatePosition();
                else
                    this.text.element.style.display = 'none'
            } else {
                this.selectionLight.intensity = 1; // ME
                this.htmlButton.style.border = "";
                this.text.element.style.display = 'none'
            }
        } else {
            this.selectionLight.intensity = 1; //MME 2 * this.mass / total_mass;
            this.htmlButton.style.border = "";
            if(options.SHOW_LABELS)
                this.text.updatePosition();
            else
                this.text.element.style.display = 'none' 

            /*
                var emissiveColor = this.color.getHex().toString(16);
                //emissiveColor = Math.random() * 0xffffff; 
                //emissiveColor = darkenColor(emissiveColor, -1 + this.mass / total_mass);
                //emissiveColor = emissiveColor;
                this.basicMaterial.emissive.setHex(parseInt(emissiveColor, 16));
            */
            //console.log(emissiveColor, this.basicMaterial.emissive.getHex().toString(16));
        }

        if (this.alive) {
            this.scale = Math.pow((this.mass * MASS_FACTOR / (4 * Math.PI)), 1 / 3);
            this.mesh.scale.x = this.scale;
            this.mesh.scale.y = this.scale;
            this.mesh.scale.z = this.scale;

            this.htmlButton.style.display='inline';

            //this.line = new THREE.Line(this.lineGeometry,lineMaterial);

        } else {
            if (this.selected) {
                this.impactCube.material.wireframe = false;
                this.htmlButton.style.display='inline';
            } else {
                this.impactCube.material.wireframe = true;
                if(options.SHOW_DIED){
                    this.htmlButton.style.display='inline';
                }else{
                    this.htmlButton.style.display='none';
                    this.text.element.style.display = 'none';
                }
            }
            //this.selectionLight.intensity = 0.5; // ME ! a remettre à Zéro !
        }

    };

    this.showTrails = function () {
        if (!this.lineDrawn) {
            this.lineDrawn = true;
            scene.add(this.line);
        } else if (this.lineDrawn === true) {
            scene.remove(this.line);
            var newLineGeometry = new THREE.Geometry();
            newLineGeometry.vertices = this.vertices.slice();

            newLineGeometry.verticesNeedUpdate = true;
            if (!pause && !this.alive) {
                //this.vertices.shift();  // ME !!
            }
            while (newLineGeometry.vertices.length > parseInt(options.TRAILS_LENGTH)) {
                newLineGeometry.vertices.shift();
            }
            this.line = new THREE.Line(newLineGeometry, this.line.material);
            scene.add(this.line);
            if(this.impactCube){
                scene.add(this.impactCube);
            }
        }
    }
    this.hideTrails = function () {
        if (this.lineDrawn) {
            scene.remove(this.line);
            scene.remove(this.impactCube);
            this.lineDrawn = false;
        }
    }

    this.distanceToCenter = function () {
        return this.mesh.position.distanceTo(new THREE.Vector3(0, 0, 0));
    }

    this.zoomToCam = function () {
        camera.position.set(this.mesh.position);
    }

    this.Select = function () {
        console.log(this);
        selection = this;
    }
}


// TRAIL LINES ---------------

function updateTrails(m) {
    if (isMoverSelected) {
        if (m.selected) {
            if (options.TRAILS_DISPLAY) {
                m.showTrails();
            } else {
                //m.showTrails();
                m.hideTrails();
            }
            this.selectionLight.intensity = 1; // ME
            //this.directionalLight.intensity = 0.5;
            selectionLight.position = m.location;

            // ?? 
			/*
            selectedMaterial.emissive = m.line.material.color;
            selectionLight.color = m.line.material.color;
            m.mesh.material = selectedMaterial;
			*/
        } else {
            m.mesh.material = m.basicMaterial;
            m.hideTrails();
            //            if (displayTrails)
            //                m.showTrails();
            //            elsebasicm
            //                m.hideTrails();
        }
    } else {
        m.mesh.material = m.basicMaterial;
        if (options.TRAILS_DISPLAY) {
            if(m.alive || options.SHOW_DIED){
                m.showTrails();
            } else m.hideTrails(); 
        } else {
            m.hideTrails();
        }
    }
}

