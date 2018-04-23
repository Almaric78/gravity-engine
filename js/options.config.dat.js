var options = {
	NAME:"EARTH_MOON",  // name of Simulation 
	NAME_SVG: "EM1",
	version : 1,
    framerate: 60,
    G: 10, // 6.673 ^ -11 ?? 
	
    TRAILS_DISPLAY: true,
    SHOW_DIED: false,
    SHOW_LABELS: true, 
    TRAILS_LENGTH: 1000, // Max length of Trails 
	
	SPECIFIC_MASS : 500, 
    START_SPEED: 10,
	RADIUS:10, 
	
    MOON_SPEED: 12, // initial Moon speed 
	
    MoveSpeed: 50,  // for moving by keyBoard Up / Down keys

    MAX_DISTANCE: 300000,  // Max distance from center to update Movers 
	
	MASS_FACTOR     : 10, // ??
	DISTANCE_FACTOR : 10,
/*
	MASS_FACTOR   : 100000, // 1:10 Gigatonnes = 1:10*10^9 tons = 1:10*10^12 kg ?? 
	DISTANCE_FACTOR : 1000, // 1:1000 km = 1:10^6 meters
	RADIUS_FACTOR   : 1000, // for display of size ? not in use for the moment
*/
};

// LOAD / SAVE CONFIG

var optionsSvgName = "options_EM1";
// Force Reset Config ? 
var httpReset = GET('R');
if(httpReset){
	console.log("Force Reset Initial Config:" + httpReset);
}
// LOAD CONFIG 
else if (localStorage && localStorage.getItem(optionsSvgName)){
    optionsSVG = JSON.parse(localStorage.getItem(optionsSvgName));
	if(optionsSVG.NAME==options.NAME){
		console.log("LOAD CONFIG:" + optionsSvgName);
		for (var key in optionsSVG) {
			console.log(key, optionsSVG[key]);
			options.key = optionsSVG.key;
			options[key] = optionsSVG[key];
		}
	} else {
		console.log("BAD LOAD CONFIG:" + optionsSVG.NAME + " - EXPECTED:" + options.NAME + " > NO LOAD");
		console.log(options);
	}
} else {
	console.log("No Saved Config:" + optionsSvgName);
}
options.SAVECONFIG = function () {
    // SVG CONFIG OPTIONS
    localStorage.setItem(optionsSvgName, JSON.stringify(options));
	console.log("Saved Config:" + optionsSvgName);
}

options.RESET = function () {
    reset();
}


options.REMOVE_DYNAMICS = function () {
    removeDynamicMovers();
}

// dat GUI
var gui = new dat.GUI();
gui.remember(options);

var f = gui.addFolder('Environment');
f.open();
//f.add(options, 'framerate', 1, 120);
f.add(options, 'G', 1, 100).name('Gravity');

/*
	var fMoverCountE = f.add(options, 'MOVER_COUNT', 1, 128);
	fMoverCountE.onFinishChange(function (value) {
		// Fires when a controller loses focus.
		//reset();
	});
*/

f = gui.addFolder('Trails & Labels');
f.open();
f.add(options, 'TRAILS_DISPLAY');
f.add(options, 'TRAILS_LENGTH', 0, 10000);

f.add(options, 'SHOW_DIED');
f.add(options, 'SHOW_LABELS');

f = gui.addFolder('Mass and Radius for Dynamics (Right Clic)');
f.open();

f.add(options, 'SPECIFIC_MASS', .00001, 10000.0).name("MASS");
f.add(options, 'RADIUS', .001, 10.0);
f.add(options, 'START_SPEED', 1e-100, 20.0);
f.add(options, 'REMOVE_DYNAMICS').name('Remove dynamic balls');

f = gui.addFolder('Start');
f.open();


var fSpeedE = f.add(options, 'MOON_SPEED', 1e-100, 20.0);
fSpeedE.onFinishChange(function (value) {
    //reset();
});

var moveSpeed = 5;
var fSpeedMS = f.add(options, 'MoveSpeed', 1, 100);
fSpeedMS.onFinishChange(function (value) {
    //console.log(value);
    moveSpeed = Math.floor(options.MoveSpeed);
    console.log("MoveSpeed: " + moveSpeed);
});

//f.add(options, 'AddBigStar').name('Add Big Star');
f.add(options, 'SAVECONFIG').name('SaveTheConf');
f.add(options, 'RESET').name('RESET ALL');

// GitHub ICON 
var github = gui.add({ fun : function () { window.open('https://github.com/Almaric78/gravity-engine'); } }, 'fun').name('Github');
github.__li.className = 'cr function bigFont';
github.__li.style.borderLeft = '3px solid #8C8C8C';
var githubIcon = document.createElement('span');
github.domElement.parentElement.appendChild(githubIcon);
githubIcon.className = 'icon github';

/*
    var twitter = gui.add({ fun : function () { window.open('https://twitter.com/PavelDoGreat'); } }, 'fun').name('Twitter');
    twitter.__li.className = 'cr function bigFont';
    twitter.__li.style.borderLeft = '3px solid #8C8C8C';
    var twitterIcon = document.createElement('span');
    twitter.domElement.parentElement.appendChild(twitterIcon);
    twitterIcon.className = 'icon twitter';
*/

//console.log(gui);
//gui.close();


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

var SPHERE_SIDES = 12;
//var TRAILS_LENGTH = 100;

var zoom = 1.0;
var translate = new THREE.Vector3();

var movers = [];
//var container =  false; // ME
//var textlabels = [];


// JSQUERY GUI

var $movers_alive_count = $("#movers_alive_count");
var $total_mass = $("#total_mass");
var $maximum_mass = $("#maximum_mass");
var $largest_pos = $("#largest_pos");
var $select_infos = $("#select_infos");
var $camera_info = $("#camera_info");
var GeneralInfos = document.getElementById('GeneralInfos');
var IHMButtons = document.getElementById('IHMButtons');
var tracker;


// IHM BUTTON ALL 
// --------------
var htmlButtonALL = document.createElement("BUTTON")
//htmlButtonALL.style.backgroundColor = '#' + this.color.getHexString();

htmlButtonALL.label = t = document.createTextNode('ALL');
htmlButtonALL.label.data = 'ALL'; 
htmlButtonALL.appendChild(t);
IHMButtons.appendChild(htmlButtonALL);

// $(document).ready(function () {
//     $('#ALL').click(function () {
//         alert('ALL'); 
//     });
// });

htmlButtonALL.addEventListener ("click", function() {
    //alert("did something");
    ClearSelection();
    isMoverSelected = false; 
  });