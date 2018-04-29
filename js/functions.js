// HTTP_GET_VARS

var HTTP_GET_VARS=new Array();
var strGET=document.location.search.substr(1,document.location.search.length);
if(strGET!='')
{
   gArr=strGET.split('&');
   for(i=0;i<gArr.length;++i)
   {
       v='';vArr=gArr[i].split('=');
       if(vArr.length>1){v=vArr[1];}
       HTTP_GET_VARS[unescape(vArr[0])]=unescape(v);
	   // See decodeURI() instead of unescape() 
   }
}

function GET(v)
{
   if(!HTTP_GET_VARS[v]){return null;}
   return HTTP_GET_VARS[v];
}

// MIN / MAX / Random 

function constrain(value, min, max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}

// COLOR

function darkenColor(color, percent) {
    var f = parseInt(color.slice(1), 16),
        t = percent < 0 ? 0 : 255,
        p = percent < 0 ? percent * -1 : percent,
        R = f >> 16,
        G = f >> 8 & 0x00FF,
        B = f & 0x0000FF;
    return (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
}

function randomLightColor() {
    color = "hsl(" + Math.random() * 360 + ", 100%, 75%)";
    return color;
}


// FORMAT NUMBER / VECTOR for LOG 
const BRLINE = '<br/>';
function format2Decimales(x) {
    return '  ' + Number(x).toFixed(2);
}

function format2Vector(v, nbDigit, prefix) {
    if (!nbDigit) nbDigit = 0;
    if (!prefix) prefix = "";
    return NumToFormat(v.x, nbDigit, prefix + 'X')
        + NumToFormat(v.y, nbDigit, prefix + 'Y')
        + NumToFormat(v.z, nbDigit, prefix + 'Z');
}

function NumToFormat(float, nbDigit, prefix) {
    if (!float) float = 'NULL';
    if (!nbDigit) nbDigit = 0;
	if(float>1e6 || float <-1e6)
		if (!prefix)
			return float.toExponential(5);
		else
			return prefix + ':' + float.toExponential(5) + BRLINE;
	else
		if (!prefix)
			return ' ' + float.toLocaleString(undefined, { maximumFractionDigits: nbDigit });
		else {
			if (prefix.startsWith('r')) { float *= 180 / Math.PI; } // conversion in degree for Rotation Angle
			return prefix + ': ' + float.toLocaleString(undefined, { maximumFractionDigits: nbDigit }) + BRLINE;
		}
}

// LIST ALL 

function ListAll() {
	console.log("MOVERS_SIZE:"+movers.length)
	console.log("SCENE_CHILDREN:"+scene.children.length)
    for (var i = movers.length - 1; i >= 0; i--) {
        var m = movers[i];
            console.log(m.name + '  mass:' + NumToFormat(m.mass, 0) + ' d:' + NumToFormat(m.distanceToCenter(), 0) + '  ' + m.alive)//
	}	
}

function ListAlive() {
    for (var i = movers.length - 1; i >= 0; i--) {
        var m = movers[i];

        if (m.alive) {
            let isBIG;
            if (m.biggest) isBIG = 'BIG'
            else isBIG = '';
            console.log(m.name + '  mass:' + NumToFormat(m.mass, 0) + ' d:' + NumToFormat(m.distanceToCenter(), 0) + '  ' + isBIG)//
            // console.log(m);
        }
    }
}

function RebornAllDied() {
    for (var i = movers.length - 1; i >= 0; i--) {
        var m = movers[i];

        if (!m.alive) {
            m.reborn();
        }
    }
}

// FOR SELECTION

// IHM :

var isMoverSelected = false;

function SelectMeshMover(clickedObj, str) {
    console.log(str + " > selected idMesh:" + clickedObj.id, clickedObj.name); 
    //$select_infos.html( clickedObj.id );	
	//console.log(clickedObj);
	
    var mover = clickedObj.mover;
	if(mover){
		
		selection = mover; 
		
		if (!mover.selected)
			ClearSelection();
	
		mover.selected = !mover.selected;

		isMoverSelected = mover.selected;
		if(isMoverSelected)
			console.log('selection '+mover.name)

		document.getElementById("mySelect").disabled = false;   
		document.getElementById("cbFPS").disabled = false;
	
	} else {
		ClearSelection();
		isMoverSelected = false;
	}
}

function ClearSelection() {
    for (var i = movers.length - 1; i >= 0; i--) {
        var m = movers[i];
        if (m.selected) {
            m.selected = false;
        }
    }
}

function setSelection(thelist, theinput) {
    // theinput = document.getElementById(theinput);  
    var idx = thelist.selectedIndex;
    //console.log(idx);
    var content = thelist.options[idx].innerHTML;
    functionName = thelist.options[idx].value;
    // theinput.value = content;	
    //alert(content);

    // call the function by name value 
    setTimeout(functionName + '()', 0);

    // RESET the Select on first item
    //​document.getElementById('mySelect').value = '0';​​​​​​​​​​
    $('#mySelect').val('0');
}

function inverseSelectionStatus() {
    if (!selection)
        return;
    if (selection.alive)
        return selection.kill();
    else
        return selection.reborn()
}

function inverseDirection() {
    if (selection)
        selection.velocity.multiplyScalar(-1);
}

function newColor() {
    if (selection)
        selection.newColor();
}

function lookCenter(string) {
    console.log(string);
    document.getElementById('cbFPS').checked = false;
    camera.lookAt(new THREE.Vector3(0, 0, 0));
}

function selectBiggest() {
    if (biggest)
        SelectMeshMover(biggest.mesh)
}

function changeMass() {
    if (selection) {
		var svg_pause_status = pause;
        pause = true;
        var initialMass = parseFloat(selection.mass, 10);
        var newMass = prompt("Please enter the new mass:", initialMass);
        newMass = parseFloat(newMass);
        if (!newMass)
            newMass = initialMass;
        console.log("New mass:" + newMass + " on selection id:" + selection.id)
        selection.mass = newMass;
		pause = svg_pause_status;
    }
}

// For Free FPS CAM 

// Activate FPS Control for Selection 
function onCbFPSCam() {
	if(selection && document.getElementById('cbFPS').checked) {
        //if(!(controls instanceof (THREE.FirstPersonControls))) {
        SwitchControl(2);
        //controls.enabled = false;
        document.getElementById('cbZoom').disabled = false;
        //} else console.log('orbit');
    } else document.getElementById('cbZoom').disabled = true;

/*
    direction = camera.getWorldDirection().clone();

    angleX = direction.angleTo(new THREE.Vector3(1, 0, 0))
    console.log("angleX:" + angleX); // direction.normalize())
    controls.lon = - angleX * 180 / Math.PI;
*/
}

function onCbOrbitCam(){
	if(selection) {
		SwitchControl(1);
		document.getElementById('cbZoom').disabled = false;
	}
}


// CAMERAS -- CONTROLS 

var camera2FPS

var control2FPS;

var clock = new THREE.Clock();

/* = new THREE.FirstPersonControls(camera);
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

//cameraPerspectiveHelper.visible = true;

function SwitchControl(k) {

    console.log("SwitchControl(" + k + ")");

    direction = camera.getWorldDirection().clone();
    camRotation = camera.rotation.clone();
    console.log(direction);

	if (k == 1) {

		//controlOrbit.enableKeys = false;
        controls = controlOrbit; // new THREE.OrbitControls(camera, renderer.domElement);
        controls.zoomSpeed = 100
        console.log("OrbitControls");
        //controls.enabled = false;
		
    } else if (k == 2) {

        console.log("FirstPersonControls");
        if (!control2FPS) {
            camera2FPS = camera.clone()
            scene.add(camera2FPS);

            control2FPS = new THREE.FirstPersonControls(camera2FPS, renderer.domElement);
            control2FPS.movementSpeed = 1000 * 5;
            control2FPS.lookSpeed = 0.1;
            //control2FPS.enabled = false;
        }
        /*	
            angleX = direction.angleTo (new THREE.Vector3(1,0,0))
            console.log("angleX:" + angleX); // direction.normalize())
            controls.lon = - angleX * 180 / Math.PI;
        */

        controls = control2FPS;
        camera = camera2FPS;

        //camera.lookAt(direction);

        camera.rotation.copy(camera2FPS.rotation)

        //camera.rotation.set(svgCamera.rotation.x, svgCamera.rotation.y, svgCamera.rotation.z);
		/*
		camera.rotation.x = svgCamera.rotation.x;
		camera.rotation.y = svgCamera.rotation.y;
		camera.rotation.z = svgCamera.rotation.z;
		*/
        controls.enabled = true;

    } else {
        // TODO 
        console.log("ArrowHelper");
    }
}

function setCamera(initCam) {
    for (var i = 0; i < movers.length; i = i + 1) {
        updateTrails(movers[i]);
    }
    camera.position.x = initCam.radius * Math.sin(initCam.theta * Math.PI / 360) * Math.cos(initCam.phi * Math.PI / 360);
    camera.position.y = initCam.radius * Math.sin(initCam.phi * Math.PI / 360);
    camera.position.z = initCam.radius * Math.cos(initCam.theta * Math.PI / 360) * Math.cos(initCam.phi * Math.PI / 360);
    // ressemble à https://github.com/mrdoob/three.js/issues/974 
    //        et à https://github.com/mrdoob/three.js/issues/783   **
    //			   https://github.com/mrdoob/three.js/issues/1468

    // https://github.com/mrdoob/three.js/issues/983  **   pb entre FPS et dat.gui.js

    camera.lookAt(new THREE.Vector3(0, 0, 0));
    camera.updateMatrix();
}

// ADD HELPER

function AddArrowHelper(direction) {
	console.log("AddArrowHelper")
    // ArrowHelper
    // var origin = new THREE.Vector3( 0, 0, 0 );
    var length = 1000;
    var hex = 0xff0000;

    // X RED 
    var arrowHelper = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), camera.position, length, hex);
    scene.add(arrowHelper);

    // Y GREEN
    var arrowHelper2 = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), camera.position, length, new THREE.Color('green'));
    scene.add(arrowHelper2);

    // Z BLUE
    var arrowHelper2 = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), camera.position, length, new THREE.Color('blue'));
    scene.add(arrowHelper2);

    // FRONT YELLOW
    var arrowHelper = new THREE.ArrowHelper(direction, camera.position, length, 0xffff00);
    scene.add(arrowHelper);

    // BACK PINK
    var arrowHelper2 = new THREE.ArrowHelper(direction.multiplyScalar(-1), camera.position, length, new THREE.Color('pink'));
    scene.add(arrowHelper2);
}

// LOG CAM 

function LogFPS() {
    if (!(controls instanceof (THREE.FirstPersonControls))) {
        console.log("No FPS !");
        return;
    }
    console.group();
    console.log("lon:" + NumToFormat(controls.lon, 2));
    console.log("lat:" + NumToFormat(controls.lat, 2));
    console.log("phi:" + NumToFormat(controls.phi, 2));
    console.log("theta:" + NumToFormat(controls.theta, 2));
    //console.log(controls.target);
    console.groupEnd();
}

function LogCam() {
	var msg = format2Vector(camera.position) + format2Vector(camera.rotation, 2, 'r')
    + 'Distance to Center:' + NumToFormat(camera.position.distanceTo(new THREE.Vector3(0, 0, 0)));
	var strControlName='';
	if(controls){
        if (controls instanceof (THREE.OrbitControls))
            strControlName = "OrbitControls"
        else if (controls instanceof (THREE.FirstPersonControls)) {
            strControlName = "FirstPersonControls"
		}
		strControlName += ':' + controls.enabled;
	}
	return msg + '<br/>' + strControlName;
}

function LogFPCam() {
	return ""; 
    if ((controls instanceof (THREE.FirstPersonControls))) {
        message = "<br/>";
        //message += "status:" + controls.enabled + "<br/>";
        message += "lon:" + NumToFormat(controls.lon, 2) + "<br/>";
        message += "lat:" + NumToFormat(controls.lat, 2) + "<br/>";
        message += "phi:" + NumToFormat(controls.phi, 2) + "<br/>";
        message += "theta:" + NumToFormat(controls.theta, 2) + "<br/>";
        message += format2Vector(controls.target, 0, 't');
        return message;
    } else 
        return ""; 
}

function LogSelection() {
	// selection info/debug
	if (selection) {
		var selectionMsg = '<br/> id/name:  ' + selection.name;
	
		if (selection.alive)
			selectionMsg += ' Alive';
		else
			selectionMsg += ' Killed by ' + selection.killedBy;
	
		// position
		selectionMsg += '<br/>' + format2Vector(selection.mesh.position);
		selectionMsg += 'Mass: ' + NumToFormat(selection.mass);
		selectionMsg += '<br/>Vertices: ' + NumToFormat(selection.vertices.length);
		selectionMsg += '<br/>Velocity: ' + NumToFormat(selection.velocity.length(), 2);
		
		selectionMsg += '<br/>Radius/Scale: ' + NumToFormat(selection.getRadius(), 3);
		if(options.NAME=="GENERAL")
			selectionMsg += ' X ' + NumToFormat(selection.mesh.scale.length(), 2)

		selectionMsg += '<br/>Biggest Force on: ' + NumToFormat(selection.biggestForce, 3); // '' + selection.forceBy; 
		
		selectionMsg += '<br/>DistanceToCamera: ' + NumToFormat(selection.distanceTo(camera.position));
		selectionMsg += '<br/>DistanceToCenter: ' + NumToFormat(selection.distanceToCenter());
		return selectionMsg;
	} else return ""; 
}


// MOVERS : ADD / REMOVE 

//var movers = []; 

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

function AddBigMoverToCenter () {
	var mass = options.BIG_STAR_MASS;

	var vel = new THREE.Vector3(0,0,0);
	var loc = new THREE.Vector3(0,0,0);
	
	name = movers.length + 'Big'
	big = new Mover(mass, vel, loc, movers.length, 'Big');
	//big.mesh.material.transparent = true;
	//big.mesh.material.opacity = 0.8
	
	big.addToMovers();

	//movers.push(big);
	//addClickButtonEvent(name)
	
	return big; 
}

function AddSpecialMoverFromMesh(mass, mesh, name, vel, colorHex) {
	
	if(!mass)
		mass = options.SPECIFIC_MASS;

	if(!vel)
		vel = new THREE.Vector3(0, 0, 0);
    
	if(!mesh)
		loc = new THREE.Vector3(0, 0, 0);
	else loc = mesh.position;
	
	if(!name)
		name = 's';

    //name = movers.length + 'Big'
    big = new Mover(mass, vel, loc, movers.length, name, mesh, null, colorHex);
    //big.mesh.material.transparent = true;
    //big.mesh.material.opacity = 0.9
	big.selected = false; 

    big.addToMovers();
	
	return big; 
}

// Same function with options JSON parameters (for future..) 
// https://www.markhansen.co.nz/javascript-optional-parameters/ 
function AddSpecialMoverFromMesh2(mass, mesh, name, options) {
	
	var options = options || {};
    var colorHex = options.colorHex || null;
	var vel = options.vel || new THREE.Vector3(0, 0, 0);
	console.log(options);
	
	if(!mass)
		mass = options.SPECIFIC_MASS;
    
	if(!mesh)
		loc = new THREE.Vector3(0, 0, 0);
	else loc = mesh.position;
	
	if(!name)
		name = 's';

    //name = movers.length + 'Big'
    big = new Mover(mass, vel, loc, movers.length, name, mesh, null, colorHex);
    //big.mesh.material.transparent = true;
    //big.mesh.material.opacity = 0.9
	big.selected = false; 

    big.addToMovers();
	
	return big; 
}


// REMOVE MOVERS 

function RemoveMover(mover, i){
	scene.remove(mover.mesh);
	scene.remove(mover.selectionLight);
	scene.remove(mover.line);

	if(!mover.alive)
		scene.remove(mover.impactCube);

	console.log('Remove:', i, mover.name);
	IHMButtons.removeChild(mover.htmlButton);
	document.body.removeChild(mover.text.element);
}

function removeDynamicMovers() {
	console.log("Initial MOVERS:"+movers.length)
	console.log("SCENE_CHILDREN:"+scene.children.length)
	var j = 0;
	for (var i = movers.length - 1; i >= 3; i = i - 1) {
		RemoveMover(movers[i], i);
		
		var index = movers.indexOf(movers[i]);
		console.log(index, movers[i].name)
		if (index > -1) {
		  movers.splice(index, 1);
		}
		
		//var mpop = movers.pop();
		//console.log(mpop.name);
		j++;
	}
	console.log("nb movers pop:"+j)
	console.log("MOVERS_SIZE:"+movers.length)
	console.log("SCENE_CHILDREN:"+scene.children.length)
}

// MOUSE EVENT ---

var onMouseDown = false;

window.onmousemove = function (e) {

    if (onMouseDown) onMouseDown.moved = true;

    var vector = new THREE.Vector3(
        +(e.clientX / window.innerWidth) * 2 - 1,
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
		
	var iMobile=0;

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

			/*
                if (intersects.length > 0) { // SELECTION

                    var clickedObj = (intersects[0].object);

                    // console.log(intersects[0]);

                    SelectMeshMover(clickedObj, 'c2')

                }
                else { // ADD NEW BALL MOVER
			*/
					iMobile++;

                    var vel = raycaster.ray.direction.clone().multiplyScalar(parseFloat(options.START_SPEED));
                    var loc = raycaster.ray.origin.clone();
					
					if(options.NAME=="EARTH_MOON") {
						var mass = options.SPECIFIC_MASS;
						var radius = options.RADIUS;
					} else { 
						var mass = random(options.MIN_MASS, options.MAX_MASS);
						var radius = 100.0;
					}
					
                    var newObject = new Mover(mass, vel, loc, movers.length, 'm'+iMobile, null, radius);
                    console.log("c2 > add " + newObject.id + " mass:" + newObject.mass.toFixed(0));
                    newObject.addToMovers();

                    lastOne = newObject;

            //    } // add ball block 
                break;
        } // switch 
    }
	
    // Desactivate Context Menu on Right Clic 
	document.oncontextmenu = new Function("return false");

    window.onmouseup = function (e) {
        if (e.target.tagName === "CANVAS") {
            if (!onMouseDown.moved) {
                var vector = new THREE.Vector3(
                    +(e.clientX / window.innerWidth) * 2 - 1,
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


window.onresize = function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};


// KEYBOARD  --- 

console.time();

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

    var vector = new THREE.Vector3(); // for Three.js > 80 ?? 
    direction = camera.getWorldDirection(vector).clone();

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
            if(!controls.lon){
                angleX = direction.angleTo (new THREE.Vector3(1,0,0))
                console.log("angleX:" + angleX); // direction.normalize())
                controls.lon = - angleX * 180 / Math.PI;
            }

            if(!controls.lat){
                angleY = direction.angleTo(new THREE.Vector3(0, 1, 0))
                console.log("angleY:" + NumToFormat(angleY,2)); // direction.normalize())
                controls.lat = - angleY * 180 / Math.PI;
            }
*/

            controls.target.copy(direction);

            //LogFPS();
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

    } else if (e.which === 49 && window.event.shiftKey) { // 1 OrbitControls
        controls = controlOrbit
        console.log("controlOrbit")

    } else if (e.which === 50 && window.event.shiftKey) { // 2  FPS
        //controls = control2FPS
        //console.log("FPS")

        SwitchControl(2);
        AddArrowHelper(direction)
        //LogFPS();

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

    } else if (e.which === 51 && window.event.shiftKey) { // 3 LOG ?
        AddArrowHelper(direction)
        //LogFPS();
    }
}