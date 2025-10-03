Array.prototype.clone = function() {
	return this.slice(0);
}

Array.prototype.random = function() {
	return this[Math.floor(Math.random()*this.length)];
}

var Face = OZ.Class();
Face.SIZE	= 100;
Face.LEFT	= 0;
Face.RIGHT	= 1;
Face.TOP	= 2;
Face.BOTTOM	= 3;
Face.FRONT	= 4;
Face.BACK	= 5;

Face.ROTATION = [
	[Face.TOP, Face.FRONT, Face.BOTTOM, Face.BACK].reverse(),
	[Face.LEFT, Face.BACK, Face.RIGHT, Face.FRONT].reverse(),
	[Face.LEFT, Face.BOTTOM, Face.RIGHT, Face.TOP].reverse()
];

Face.prototype.init = function(cube, type) {
	this._cube = cube;
	this._type = type;
	this._color = null;
	this._node = OZ.DOM.elm("div", {className:"face face"+type, width:Face.SIZE+"px", height:Face.SIZE+"px", position:"absolute", left:"0px", top:"0px"});
	OZ.CSS3.set(this._node, "box-sizing", "border-box");
	OZ.CSS3.set(this._node, "transform-style", "preserve-3d");
	OZ.CSS3.set(this._node, "backface-visibility", "hidden");

	switch (type) {
		case Face.LEFT:
			OZ.CSS3.set(this._node, "transform-origin", "100% 50%");
			OZ.CSS3.set(this._node, "transform", "translate3d(-"+Face.SIZE+"px, 0px, 0px) rotateY(-90deg)");
		break;
		case Face.RIGHT:
			OZ.CSS3.set(this._node, "transform-origin", "0% 50%");
			OZ.CSS3.set(this._node, "transform", "translate3d("+Face.SIZE+"px, 0px, 0px) rotateY(90deg)");
		break;
		case Face.TOP:
			OZ.CSS3.set(this._node, "transform-origin", "50% 100%");
			OZ.CSS3.set(this._node, "transform", "translate3d(0px, -"+Face.SIZE+"px, 0px) rotateX(90deg)");
		break;
		case Face.BOTTOM:
			OZ.CSS3.set(this._node, "transform-origin", "50% 0%");
			OZ.CSS3.set(this._node, "transform", "translate3d(0px, "+Face.SIZE+"px, 0px) rotateX(-90deg)");
		break;
		case Face.FRONT:
		break;
		case Face.BACK:
			OZ.CSS3.set(this._node, "transform", "translate3d(0px, 0px, -"+Face.SIZE+"px) rotateY(180deg)");
		break;
	}
}

Face.prototype.getCube = function() {
	return this._cube;
}

Face.prototype.getNode = function() {
	return this._node;
}

Face.prototype.getType = function() {
	return this._type;
}

Face.prototype.setColor = function(color) {
	if (this._color) { OZ.DOM.removeClass(this._node, "face-color-" + this._color); }
	this._color = color;
	OZ.DOM.addClass(this._node, "face-color-" + color);
    this._node.style.backgroundImage = ""; // Clear inline style
    this._node.style.backgroundColor = ""; // Clear inline style
}

Face.prototype.getColor = function() {
	return this._color;
}

var Cube = OZ.Class();
Cube.GAP = 4;
Cube.prototype.init = function(position) {
	this._rotation = null;
	this._position = position;
	this._node = OZ.DOM.elm("div", {className:"cube", position:"absolute", width:Face.SIZE+"px", height:Face.SIZE+"px"});
	this._faces = {};
	this._tmpFaces = {};
	this._lastRotationState = false;
	OZ.CSS3.set(this._node, "transform-style", "preserve-3d");

	this._update();
}

Cube.prototype.getFaces = function() {
	return this._faces;
}

Cube.prototype.setFace = function(type, color) {
	if (!(type in this._faces)) {
		var face = new Face(this, type);
		this._node.appendChild(face.getNode());
		this._faces[type] = face;
	}
	this._faces[type].setColor(color);
}

Cube.prototype.setRotation = function(rotation) {
	this._rotation = rotation;
	this._update();
}

Cube.prototype.complete = function() {
	for (var i=0;i<6;i++) {
		if (i in this._faces) { continue; }
		this.setFace(i, "inner");
	}
}

Cube.prototype.prepareColorChange = function(sourceCube, rotation) {
	this._tmpFaces = {};
	var sourceFaces = sourceCube.getFaces();
	for (var p in sourceFaces) { 
		var sourceType = parseInt(p);
		var targetType = this._rotateType(sourceType, rotation);
		this._tmpFaces[targetType] = sourceFaces[sourceType].getColor(); 
	}
}

Cube.prototype.commitColorChange = function() {
	// Update colors without clearing DOM
	for (var p in this._tmpFaces) {
		var type = parseInt(p);
		if (type in this._faces) {
			this._faces[type].setColor(this._tmpFaces[p]);
		} else {
			this.setFace(type, this._tmpFaces[p]);
		}
	}
	this._tmpFaces = {};

	this._rotation = null;
	this._update();
}

Cube.prototype._rotateType = function(type, rotation) {
	for (var i=0;i<3;i++) {
		if (!rotation[i]) { continue; }
		var faces = Face.ROTATION[i];
		var index = faces.indexOf(type);
		if (index == -1) { continue; } /* no rotation available */
		index = (index + rotation[i] + faces.length) % faces.length;
		return faces[index];
	}
	
	return type;
}

Cube.prototype._update = function() {
	var transform = "";
	transform += "translate3d("+(-Face.SIZE/2)+"px, "+(-Face.SIZE/2)+"px, "+(-Face.SIZE/2)+"px) ";
	if (this._rotation) { transform += this._rotation + " "; }

	var half = Math.floor(Rubik.SIZE/2) - (Rubik.SIZE % 2 === 0 ? 1/2 : 0);
	var x = this._position[0];
	var y = this._position[1];
	var z = -this._position[2];
	x -= half;
	y -= half;
	z += half + 1/2;
	transform += "translate3d("+(x*(Face.SIZE+Cube.GAP))+"px, "+(y*(Face.SIZE+Cube.GAP))+"px, "+(z*(Face.SIZE+Cube.GAP))+"px)";

	var hasRotation = !!this._rotation;
	if (this._lastRotationState !== hasRotation) {
		var prop = OZ.CSS3.getProperty("transform");
		var val = hasRotation ? prop + " 300ms" : "";
		OZ.CSS3.set(this._node, "transition", val);
		this._lastRotationState = hasRotation;
	}

	OZ.CSS3.set(this._node, "transform", transform);
}

Cube.prototype.getPosition = function() {
	return this._position;
}

Cube.prototype.getNode = function() {
	return this._node;
}

Cube.prototype.getFaces = function() {
	return this._faces;
}

var Rubik = OZ.Class();
Rubik.SIZE = 3;
Rubik.prototype.init = function() {
	this._cubes = [];
	this._faces = [];
	this._faceNodes = [];
	this._faceMap = new Map();
	this._interval = null;
	this._autorotatePaused = false;
	this._formulaQueue = [];
	this._isExecutingFormula = false;
	this._formulaInterval = null;

	// 打乱公式 - 12步打乱（10秒完成，800ms/步）
	this._scrambleFormula = [
		"R", "U", "R'", "F", "D", "F'",
		"L", "U'", "L'", "B", "D'", "B'"
	];

	this._rotation = Quaternion.fromRotation([1, 0, 0], -35).multiply(Quaternion.fromRotation([0, 1, 0], 45));
	this._autoRotationIncrement = Quaternion.fromRotation([1, 1, 0], 0.3);
	this._node = OZ.DOM.elm("div", {position:"absolute", left:"50%", top:"55%", width:"0px", height:"0px"});
	document.body.appendChild(this._node);

	// OZ.CSS3.set(document.body, "perspective", "460px");
	OZ.CSS3.set(this._node, "transform-style", "preserve-3d");

	this._build();
	this._update();

	this._autorotatePaused = false;
	this._autorotate();

	// 启动公式循环：打乱 -> 还原 -> 打乱 -> 还原...
	this._startFormulaLoop();
}

// 解析魔方公式并执行
Rubik.prototype._parseFormula = function(notation) {
	var isPrime = notation.indexOf("'") > -1;
	var face = notation.replace("'", "");
	var dir = isPrime ? -1 : 1;

	switch(face) {
		case "R": this._rotateX(dir, 2); break;
		case "L": this._rotateX(-dir, 0); break;
		case "U": this._rotateY(dir, 0); break;
		case "D": this._rotateY(-dir, 2); break;
		case "F": this._rotateZ(dir, 0); break;
		case "B": this._rotateZ(-dir, 2); break;
	}
}

// 反转公式（用于还原）
Rubik.prototype._reverseFormula = function(formula) {
	var reversed = [];
	for (var i = formula.length - 1; i >= 0; i--) {
		var move = formula[i];
		if (move.indexOf("'") > -1) {
			reversed.push(move.replace("'", ""));
		} else {
			reversed.push(move + "'");
		}
	}
	return reversed;
}

// 启动公式循环
Rubik.prototype._startFormulaLoop = function() {
	var self = this;

	// 默认是还原状态，等待1.5秒后开始打乱
	setTimeout(function() {
		self._scrambleAndSolveLoop();
	}, 1500);
}

// 打乱和还原循环
Rubik.prototype._scrambleAndSolveLoop = function() {
	var self = this;

	// 执行打乱（10秒）
	self._executeFormula(self._scrambleFormula, function() {
		// 打乱完成后，等待0.5秒，然后执行还原
		setTimeout(function() {
			var solveFormula = self._reverseFormula(self._scrambleFormula);

			// 执行还原（10秒）
			self._executeFormula(solveFormula, function() {
				// 还原完成后，等待1.5秒，然后重新打乱
				setTimeout(function() {
					self._scrambleAndSolveLoop();
				}, 1500);
			});
		}, 500);
	});
}

// 执行公式序列
Rubik.prototype._executeFormula = function(formula, callback) {
	var self = this;
	var index = 0;
	var stepDelay = 800; // 10秒内完成12步 = 800ms/步

	function executeNextMove() {
		if (index >= formula.length) {
			if (callback) callback();
			return;
		}

		self._parseFormula(formula[index]);
		index++;

		setTimeout(executeNextMove, stepDelay);
	}

	executeNextMove();
}

Rubik.prototype._autorotate = function() {
	if (this._autorotatePaused) { return; }
	this._rotation = this._rotation.multiply(this._autoRotationIncrement);
	this._update();
	window.requestAnimationFrame(this._autorotate.bind(this));
}


Rubik.prototype._update = function() {
	OZ.CSS3.set(this._node, "transform", "translateZ(" + (-Face.SIZE/2 - Face.SIZE) + "px) " + this._rotation.toRotation() + " translateZ("+(Face.SIZE/2)+"px)");
}

Rubik.prototype._rotateX = function(dir, layer) {
	var cubes = [];
	for (var i=0;i<Rubik.SIZE*Rubik.SIZE;i++) {
		cubes.push(this._cubes[layer + i*Rubik.SIZE]);
	}
	this._rotateCubes(cubes, [dir, 0, 0]);
}

Rubik.prototype._rotateY = function(dir, layer) {
	var cubes = [];
	for (var i=0;i<Rubik.SIZE;i++) {
		for (var j=0;j<Rubik.SIZE;j++) {
			cubes.push(this._cubes[j + layer*Rubik.SIZE + i*Rubik.SIZE*Rubik.SIZE]);
		}
	}
	this._rotateCubes(cubes, [0, -dir, 0]);
}

Rubik.prototype._rotateZ = function(dir, layer) {
	var cubes = [];
	var offset = layer * Rubik.SIZE * Rubik.SIZE;
	for (var i=0;i<Rubik.SIZE*Rubik.SIZE;i++) {
		cubes.push(this._cubes[offset+i]);
	}
	this._rotateCubes(cubes, [0, 0, dir]);
}

Rubik.prototype._rotateCubes = function(cubes, rotation) {
	var suffixes = ["X", "Y", ""];

	var prefix = OZ.CSS3.getPrefix("transition");
	if (prefix === null) {
		this._finalizeRotation(cubes, rotation);
	} else {
		var transitionEnded = false;
		var cb = function(e) {
			if (transitionEnded) { return; }
			transitionEnded = true;
			OZ.Event.remove(eventId);
			this._finalizeRotation(cubes, rotation);
		}
		var eventId = OZ.Event.add(cubes[0].getNode(), "webkitTransitionEnd transitionend MSTransitionEnd oTransitionEnd", cb.bind(this));

		var str = "";
		for (var i=0;i<3;i++) {
			if (!rotation[i]) { continue; }
			str = "rotate" + suffixes[i] + "(" + (90*rotation[i]) + "deg)";
		}
		for (var i=0;i<cubes.length;i++) { cubes[i].setRotation(str); }
	}

}

/**
 * Remap colors
 */
Rubik.prototype._finalizeRotation = function(cubes, rotation) {
	var direction = 0;
	for (var i=0;i<3;i++) {
		if (rotation[i]) { direction = rotation[i]; }
	}

	if (rotation[0]) { direction *= -1; } /* FIXME wtf */

	var half = Math.floor(Rubik.SIZE/2) - (Rubik.SIZE % 2 === 0 ? 1/2 : 0);

	for (var i=0;i<cubes.length;i++) {
		var x = i % Rubik.SIZE - half;
		var y = Math.floor(i / Rubik.SIZE) - half;

		var source = [y*direction + half, -x*direction + half];
		var sourceIndex = source[0] + Rubik.SIZE*source[1];

		cubes[i].prepareColorChange(cubes[sourceIndex], rotation);
	}

	for (var i=0;i<cubes.length;i++) { cubes[i].commitColorChange(); }
}

Rubik.prototype._build = function() {
	for (var z=0;z<Rubik.SIZE;z++) {
		for (var y=0;y<Rubik.SIZE;y++) {
			for (var x=0;x<Rubik.SIZE;x++) {
				var cube = new Cube([x, y, z]);
				this._cubes.push(cube);
				
				if (z == 0) { cube.setFace(Face.FRONT, "red"); }
				if (z == 2) { cube.setFace(Face.BACK, "orange"); }
				
				if (x == 0) { cube.setFace(Face.LEFT, "green"); }
				if (x == 2) { cube.setFace(Face.RIGHT, "blue"); }
				
				if (y == 0) { cube.setFace(Face.TOP, "white"); }
				if (y == 2) { cube.setFace(Face.BOTTOM, "yellow"); }
				
				cube.complete();
				
				this._node.appendChild(cube.getNode());
			}
		}
	}

}