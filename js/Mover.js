
// MOVER CLASS

function Mover(m, vel, loc, id, suffix, mesh, radius, colorHex) {
    this.location = loc,
        this.velocity = vel,
        this.acceleration = new THREE.Vector3(0.0, 0.0, 0.0),
        this.mass = m,
        this.c = 0xffffff,
        this.alive = true;
		
	if(!radius)
		radius = 100.0
    this.geometry = new THREE.SphereGeometry(radius, SPHERE_SIDES, SPHERE_SIDES);

    this.id = id;
    if (!suffix) suffix = "";
	
	if(suffix)
		this.name = id + ':' + suffix;
	else 
		this.name = id

    this.vertices = []; // PATH OF MOVEMENT

    this.line = new THREE.Line(); // line to display movement

	if(colorHex)
		this.color = new THREE.Color(colorHex);
	else {
		this.color = this.line.material.color; // ?? no init Color ?? 
		this.color.setHSL( Math.random() , 1, 0.5);
	}

    //this.line = THREE.Line(this.lineGeometry, lineMaterial);

    this.basicMaterial = new THREE.MeshPhongMaterial({
        ambient: 0x111111,
        color: this.color,
        specular: this.color,
        shininess: 10
    });

    this.selectionLight = new THREE.PointLight(this.color, .1);
    this.selectionLight.position.copy(this.location);
	
	// MESH 
	if(!mesh)
		this.mesh = new THREE.Mesh(this.geometry, this.basicMaterial);
	else this.mesh = mesh; 
    
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

    // Dynamic LABEL 
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
	
    this.attract = function (m) { // m => other Mover object
        // console.log(this.id +' est en mouvement p/r à ' + m.id);
        var force = new THREE.Vector3().subVectors(this.location, m.location); // Calculate direction of force
        var d = force.length(); // Distance between objects
		if(options.NAME=="EARTH_MOON"){
			d = d * options.DISTANCE_FACTOR;
		}
        if (d < 0) d *= -1;
        //d = constrain(d,5.0,25.0);                        
		// Limiting the distance to eliminate "extreme" results for very close or very far objects
        force = force.normalize(); // Normalize vector (distance doesn't matter here, we just want this vector for direction)
        var strength = -(options.G * this.mass * m.mass) / (d * d); // Calculate gravitional force magnitude
        force = force.multiplyScalar(strength); // Get force vector --> magnitude * direction
        //console.log("distance", d, "strength", strength);
        //console.log("force",force);
        //console.log(force.x);
		if(biggest && m==biggest)
			this.biggestForce = strength; // ME TODO 
		//this.forceBy = m.id; 
        this.applyForce(force);
        //return m;
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
	
    this.updateMeshPositionInTrail = function () {

        this.vertices.push(this.mesh.position.clone());
        //this.lineGeometry.verticesNeedUpdate = true;

    };

    this.eat = function (m) { // m => other Mover object
        var newMass = this.mass + m.mass;

        console.log(this.name + ' EAT ' + m.name + ' > newMass=' + NumToFormat(newMass, 0))

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
        m.killedBy = this.name;

        if (m.selected) this.selected = true;

        this.nbEat+=m.nbEat;
        this.nbEat+=1; 
        this.htmlButton.label.data = this.name + ':x' + this.nbEat;

        m.kill();
    };

    this.kill = function () {
        console.log(this.name + ' was killed by ' + this.killedBy + '- mass:' + NumToFormat(this.mass) )
        this.alive = false;
        this.selectionLight.intensity = 0.7; //ME
        scene.remove(this.mesh);

        // HTML BUTTON
        //this.htmlButton.label.data += 'k'
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
        console.log(this.name + ' reborn - mass: ' + this.mass.toFixed(2));
        this.alive = true;
        scene.add(this.mesh);

        this.htmlButton.label.data += 'r'
        this.htmlButton.style.backgroundColor =  '#' + this.color.getHexString();
        this.htmlButton.style.color = 'black'
    };

    this.display = function () {
        if (isMoverSelected) {
            if (this.selected) {
                //this.selectionLight.intensity = 1;
                this.htmlButton.style.border = "thick solid #FF0000";
                if(options.SHOW_LABELS)
                    this.text.updatePosition();
                else
                    this.text.hide();
            } else {
                //this.selectionLight.intensity = 1; // ME
                this.htmlButton.style.border = "";
                this.text.hide();
            }
        } else {
            //this.selectionLight.intensity = 1; //MME 2 * this.mass / total_mass;
            this.htmlButton.style.border = "";
            if(options.SHOW_LABELS)
                this.text.updatePosition();
            else
                this.text.hide();

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
			if(options.NAME=="GENERAL"){
				this.scale = Math.pow((this.mass * options.MASS_FACTOR / (4 * Math.PI)), 1 / 3);
				this.mesh.scale.x = this.scale;
				this.mesh.scale.y = this.scale;
				this.mesh.scale.z = this.scale;
			}

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
                    this.text.hide();
                }
            }
            //this.selectionLight.intensity = 0.5; // ME ! a remettre à Zéro !
        }

    };
	
	// TRAILS 

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
	
	this.getRadius = function () {
		return this.mesh.geometry.boundingSphere.radius;
	}
	
	// DISTANCE

    this.distanceToCenter = function () {
        return this.mesh.position.distanceTo(new THREE.Vector3(0, 0, 0));
    }
	
	this.distanceTo = function (vector3) {
        return this.mesh.position.distanceTo(vector3);
    }

    this.zoomToCam = function () {
        camera.position.set(this.mesh.position);
    }
	
	// COLORS 

    this.getHexColor = function(){
        return '#' + this.mesh.material.color.getHexString();
    }

    this.setColor = function(color, intensity){
        this.color = color;
        this.mesh.material.color = this.color;
        this.line.material.color = this.color;
        this.text.element.style.color = '#' + this.color.getHexString();
        this.htmlButton.style.backgroundColor = '#' + this.color.getHexString();

        if(intensity)
            this.selectionLight.intensity = intensity;
    }

    this.resetColor = function(str, intensity){
        if(str)
            color = new THREE.Color(str);
        else{
            str = randomLightColor();
            console.log(str);
            color = new THREE.Color(str);
        }
        this.setColor(color, intensity);
    }

    this.lightColor = function(percent) {
        color = this.color.getHexString();
        newColor = darkenColor(color, percent);
        this.resetColor(newColor)
    }

    this.newColor = function(){
        this.color.setHSL( Math.random() , 1, 0.7);
        console.log(this.color);
        this.setColor(this.color);
    }
}


// TRAIL LINES ---------------

function updateTrails(m) {
	
    if (isMoverSelected) {
        if (m.selected) {
			//console.log(m); 

            if (options.TRAILS_DISPLAY) {
                m.showTrails();
            } else {
                //m.showTrails();
                m.hideTrails();
            }
            this.selectionLight.intensity = 1; // ME ??
            //this.directionalLight.intensity = 0.5;
            selectionLight.position = m.location;

            // ?? 
			/*
            selectedMaterial.emissive = m.line.material.color;
            selectionLight.color = m.line.material.color;
            m.mesh.material = selectedMaterial;
			*/
        } else {
            //m.mesh.material = m.basicMaterial; //TODO
            m.hideTrails();
            //            if (displayTrails)
            //                m.showTrails();
            //            elsebasicm
            //                m.hideTrails();
        }
    } else {
        //m.mesh.material = m.basicMaterial; //TODO
        if (options.TRAILS_DISPLAY) {
            if(m.alive || options.SHOW_DIED){
                m.showTrails();
            } else m.hideTrails(); 
        } else {
            m.hideTrails();
        }
    }
}


// CLICK on GUI SELECTION BUTTON
function addClickButtonEvent(name) {

    $(document).ready(function () {
        $('#' + name).click(function () {

            var id = this.id;

            //console.log(this.id)
            //console.log(this);

            // if (id === parseInt(id, 10))
            //     console.log("int")

            mover = movers[this.id]

            SelectMeshMover(mover.mesh, 'b');

        });
    });
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
        } else {
            this.element.style.display = 'none'; // HIDE
        }
      },

      get2DCoords: function(position, camera) {
        var vector = position.project(camera);
        vector.x = (vector.x + 1)/2 * window.innerWidth;
        vector.y = -(vector.y - 1)/2 * window.innerHeight;
        return vector;
      },

      hide: function() {
        this.element.style.display = 'none'; // HIDE
      }
    };
  }
