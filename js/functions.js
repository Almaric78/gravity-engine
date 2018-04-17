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
    if (!prefix)
        return ' ' + float.toLocaleString(undefined, { maximumFractionDigits: nbDigit });
    else {
        if (prefix.startsWith('r')) { float *= 180 / Math.PI; } // conversion in degree for Rotation
        return prefix + ': ' + float.toLocaleString(undefined, { maximumFractionDigits: nbDigit }) + '<br/>';
    }
}

// LIST ALL 

function ListAlive() {
    for (var i = movers.length - 1; i >= 0; i--) {
        var m = movers[i];

        if (m.alive) {
            let isBIG;
            if (m.biggest) isBIG = 'BIG'
            else isBIG = '';
            console.log(m.id + '  m:' + NumToFormat(m.mass, 0) + ' d:' + NumToFormat(m.distanceToCenter(), 0) + '  ' + isBIG)//
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

// SELECTION :

var isMoverSelected = false;

function SelectMeshMover(clickedObj, str) {
    console.log(str + " > selected idMesh:" + clickedObj.id); //, clickedObj); // + '  mass=' + clickedObj.mover.mass.toFixed());
    selection = mover = clickedObj.mover;
    //$select_infos.html( clickedObj.id );  // largest_pos.toFixed(2)
	
	//console.log(clickedObj);
	
	if(mover){

		if (!mover.selected)
			ClearSelection();

		mover.selected = !mover.selected;

		isMoverSelected = mover.selected;

		document.getElementById("mySelect").disabled = false;   
		document.getElementById("cbFPS").disabled = false;
	
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

function lookSun(string) {
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
        pause = true;
        var initialMass = parseInt(selection.mass, 10);
        var newMass = prompt("Please enter the new mass:", initialMass);
        newMass = parseFloat(newMass);
        if (!newMass)
            newMass = initialMass;
        console.log("New mass:" + newMass + " on selection id:" + selection.id)
        selection.mass = newMass;
    }
}

// For Free FPS CAM 

// Activate FPS Control for Selection 
function onCbFPSCam() {
    if (document.getElementById('cbFPS').checked) {
        //if(!(controls instanceof (THREE.FirstPersonControls))) {
        SwitchControl(2);
        controls.enabled = false;
        document.getElementById('cbZoom').disabled = false;
        //} else console.log('orbit');
    } else document.getElementById('cbZoom').disabled = true;

   // camera.lookAt(mover.mesh.position);
/*
    direction = camera.getWorldDirection().clone();

    angleX = direction.angleTo(new THREE.Vector3(1, 0, 0))
    console.log("angleX:" + angleX); // direction.normalize())
    controls.lon = - angleX * 180 / Math.PI;
*/
}


// CAMERAS -- CONTROLS 

var camera2FPS

var control2FPS; 

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

// ADD HELPER

function AddArrowHelper(direction) {
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

function LogFPCam() {
    if ((controls instanceof (THREE.FirstPersonControls))) {
        message = "<br/>";
        message += "status:" + controls.enabled + "<br/>";
        message += "lon:" + NumToFormat(controls.lon, 2) + "<br/>";
        message += "lat:" + NumToFormat(controls.lat, 2) + "<br/>";
        message += "phi:" + NumToFormat(controls.phi, 2) + "<br/>";
        message += "theta:" + NumToFormat(controls.theta, 2) + "<br/>";
        message += format2Vector(controls.target, 0, 't');
        return message;
    } else 
        return ""; 
}


// GENERATION 

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

function AddBigMoverToCenter(mass, mesh, name) {
	
	if(!mass)
		mass = options.BIG_STAR_MASS;

    var vel = new THREE.Vector3(0, 0, 0);
    var loc = new THREE.Vector3(0, 0, 0);
	
	if(!name)
		name = 'Big'

    //name = movers.length + 'Big'
    big = new Mover(mass, vel, loc, movers.length, name, mesh);
    //big.mesh.material.transparent = true;
    //big.mesh.material.opacity = 0.9
	big.selected = false; 

    big.addToMovers();
	
	return big; 
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

                    var mass = random(options.MIN_MASS, options.MAX_MASS);

                    var vel = raycaster.ray.direction.clone().multiplyScalar(parseFloat(options.START_SPEED));
                    var loc = raycaster.ray.origin.clone();

                    var newObject = new Mover(mass, vel, loc, movers.length, 'm');
                    console.log("c2 > add " + newObject.id + " mass:" + newObject.mass.toFixed(0));
                    newObject.addToMovers();


                    lastOne = newObject;

            //    } // add ball block 
                break;
        } // switch 
    }

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

    } else if (e.which === 49) { // 1 OrbitControls
        controls = controlOrbit
        console.log("O")

    } else if (e.which === 50) { // 2  FPS
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

    } else if (e.which === 51) { // 3 LOG ?
        AddArrowHelper(direction)
        //LogFPS();
    }
}