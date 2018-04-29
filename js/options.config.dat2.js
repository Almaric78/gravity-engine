
// LOAD / SAVE CONFIG

function InitGUIFromOptions(options){

	var optionsSvgName = options.NAME_SVG ? options.NAME_SVG : "options_EM" ;

	// Force Reset Config ? 
	var httpReset = GET('R');
	if(httpReset){
		console.log("Force Reset Initial Config:" + httpReset);
		console.log("Initial Config :", options);
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
		console.log("Initial Config :", options);
	}

	options.SAVECONFIG = function () {
		// SVG CONFIG OPTIONS
		localStorage.setItem(optionsSvgName, JSON.stringify(options));
		console.log("Saved Config:" + optionsSvgName);
	}

	// ---

	options.RESET = function () {
		reset();
	}

	options.RESET_MOON_S = function () {
		reinitMoonS();
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
	f.add(options, 'G', 0, options.G*10).name('Gravity');

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
	f.add(options, 'START_SPEED', 1e-100, options.START_SPEED * 10);
	f.add(options, 'REMOVE_DYNAMICS').name('Remove dynamic balls');


	f = gui.addFolder('Start');
	f.open();

	var fSpeedE = f.add(options, 'MOON_SPEED', 1e-100, 20.0);
	fSpeedE.onFinishChange(function (value) {
		//reset();
	});

	//var moveSpeed = 5;
	gui.fSpeedMS = f.add(options, 'MoveSpeed', 1, options.MoveSpeed * 10);
	gui.fSpeedMS.onFinishChange(function (value) {
		//console.log(value);
		gui.moveSpeed = Math.floor(options.MoveSpeed);
		console.log("MoveSpeed: " + value);
	});

	//f.add(options, 'AddBigStar').name('Add Big Star');
	f.add(options, 'SAVECONFIG').name('SaveTheConf');
	f.add(options, 'RESET').name('RESET ALL');
	f.add(options, 'RESET_CAM'); // .name('RESET ALL');
	f.add(options, 'RESET_MOON_S').name('New Simul Moon');


	// GitHub ICON 
	var github = gui.add({ fun : function () { window.open('https://github.com/Almaric78/gravity-engine'); } }, 'fun').name('Github');
	github.__li.className = 'cr function bigFont';
	github.__li.style.borderLeft = '3px solid #8C8C8C';
	var githubIcon = document.createElement('span');
	github.domElement.parentElement.appendChild(githubIcon);
	githubIcon.className = 'icon github';
		
	/*
		var twitter = gui.add({ fun : function () { window.open('https://twitter.com/..'); } }, 'fun').name('Twitter');
		twitter.__li.className = 'cr function bigFont';
		twitter.__li.style.borderLeft = '3px solid #8C8C8C';
		var twitterIcon = document.createElement('span');
		twitter.domElement.parentElement.appendChild(twitterIcon);
		twitterIcon.className = 'icon twitter';
	*/

	//console.log(gui);
	//gui.close();

	return gui;

}


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