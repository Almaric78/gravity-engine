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
        if(prefix.startsWith('r')) { float *= 180/Math.PI; } // conversion in degree for Rotation
        return prefix + ': ' + float.toLocaleString(undefined, { maximumFractionDigits: nbDigit }) + '<br/>';
    }
}


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
    console.log("lon:" + NumToFormat(controls.lon,2));
    console.log("lat:" + NumToFormat(controls.lat,2));
    console.log("phi:" + NumToFormat(controls.phi,2));
    console.log("theta:" + NumToFormat(controls.theta,2));
    //console.log(controls.target);
    console.groupEnd();
}