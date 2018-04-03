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


// FORMAT NUMBER / VECTOR

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

// LIST

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