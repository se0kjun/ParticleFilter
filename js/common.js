function init() {
	//load canvas elements
	var blkCanvas = document.getElementById('block');
	var pCanvas = document.getElementById('player');
	var particleCanvas = document.getElementById('particle');

	//load canvas context
	//object block context
	var bCtx = blkCanvas.getContext('2d');
	//player context
	var pCtx = pCanvas.getContext('2d');
	//particle context
	var particleCtx = particleCanvas.getContext('2d');

	//x, y, width, height
	//list of object rectangles
	var object_collision = [
		{'x':100, 'y':0, 'width':20, 'height':150, 'line':[], 'intersect_point': {'dist': 9999, 'x': 0, 'y': 0}},
		{'x': 220, 'y': 0, 'width':20, 'height':90, 'line':[], 'intersect_point': {'dist': 9999, 'x': 0, 'y': 0} },
		{'x': 420, 'y': 0, 'width':20, 'height':200, 'line':[], 'intersect_point': {'dist': 9999, 'x': 0, 'y': 0}},
		{'x': 200, 'y': 200, 'width':240, 'height':20, 'line':[], 'intersect_point': {'dist': 9999, 'x': 0, 'y': 0}},
		{'x': 300, 'y': 100, 'width':120, 'height':20, 'line':[], 'intersect_point': {'dist': 9999, 'x': 0, 'y': 0}},
		{'x': 0, 'y': 300, 'width':300, 'height':20, 'line':[], 'intersect_point': {'dist': 9999, 'x': 0, 'y': 0}},
		{'x': 500, 'y': 100, 'width':140, 'height':20, 'line':[], 'intersect_point': {'dist': 9999, 'x': 0, 'y': 0}},
		{'x': 550, 'y': 200, 'width':90, 'height': 20, 'line':[], 'intersect_point': {'dist': 9999, 'x': 0, 'y': 0}},
		{'x': 0, 'y': 400, 'width':100, 'height': 20, 'line':[], 'intersect_point': {'dist': 9999, 'x': 0, 'y': 0}},
		{'x': 150, 'y': 400, 'width':100, 'height': 20, 'line':[], 'intersect_point': {'dist': 9999, 'x': 0, 'y': 0}},
		{'x': 250, 'y': 400, 'width':20, 'height': 240, 'line':[], 'intersect_point': {'dist': 9999, 'x': 0, 'y': 0}},
		{'x': 270, 'y': 400, 'width':100, 'height': 20, 'line':[], 'intersect_point': {'dist': 9999, 'x': 0, 'y': 0}},
		{'x': 420, 'y': 400, 'width':220, 'height': 20, 'line':[], 'intersect_point': {'dist': 9999, 'x': 0, 'y': 0}},
		{'x': 70, 'y': 470, 'width':100, 'height': 100, 'line':[], 'intersect_point': {'dist': 9999, 'x': 0, 'y': 0}},
		{'x': 460, 'y': 270, 'width':20, 'height': 130, 'line':[], 'intersect_point': {'dist': 9999, 'x': 0, 'y': 0}},
		{'x': 500, 'y': 500, 'width':140, 'height': 20, 'line':[], 'intersect_point': {'dist': 9999, 'x': 0, 'y': 0}},
	];

	//util
	//convert degree to radian
	Math.radian = function(degree) {
		return degree * Math.PI / 180;
	}

	// y = object_collision[i].y A = 0 B = 
	// y = object_collision[i].y + height A = 0 B = 
	// x = object_collision[i].x A = 1
	// x = object_collision[i].x + width
	//(x,y), (x+width, y)
	//(x,y), (x, y+height)
	//(x+width, y), (x+width, y+height)
	//(x, y+height), (x+width, y+height)
	//Y = Ax + B
	//x(y2-y1) - y(x2-x1) = x1y2 - x2y1
	object_manager = new function() {
		//draw rectangles
		this.start = function() {
			for (var i = 0; i < object_collision.length; i++) {
				bCtx.beginPath();
				bCtx.rect(object_collision[i].x, object_collision[i].y, 
					object_collision[i].width, object_collision[i].height);
				bCtx.fillStyle = 'green';
				bCtx.fill();
				bCtx.lineWidth = 1;
				bCtx.strokeStyle = 'green';
				bCtx.stroke();
				var tmp = {};
				tmp.A = 0;
				tmp.B = object_collision[i].width;

			};
		}
	}

	particle_manager = new function() {
		this.particle_list = [];

		//initialize particles
		this.start = function() {
			for (var i = 0; i < 200; i++) {
				var p = new particle(Math.random() * 640, Math.random() * 640);
				this.particle_list.push(p);
			};
		}
		//draw particles
		this.draw = function() {
			this.particle_list.forEach(function(elem) {
				elem.draw();
			});
		}
		//clear context of particle
		this.clear = function() {
			particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
		}

		this.resample = function() {
		}
	}

	robot = new function() {
		this.x = 0;
		this.y = 0;
		this.valid_area = 100;
		this.ray_count = 8;
		this.speed = 2;
		this.move_flag = false;
		this.move_status;
		this.weight = 0;
		this.sensor_distance = [];

		this.draw = function() {
			var tmp = 360 / this.ray_count;
			this.clear();
			this.move();

			pCtx.beginPath();
			pCtx.stroke();

			pCtx.beginPath();
			pCtx.rect(this.x, this.y, 2, 2);
			pCtx.fillStyle = 'black';
			pCtx.fill();
			pCtx.lineWidth = 3;
			pCtx.strokeStyle = 'black';
			for (var i = 0; i < object_collision.length; i++) {
				pCtx.moveTo(this.x, this.y);
				if(object_collision[i].intersect_point.dist !== 9999) {
					pCtx.lineTo(object_collision[i].intersect_point.x, 
						object_collision[i].intersect_point.y);
				} else {
					pCtx.lineTo((this.valid_area * Math.cos(Math.radian(tmp * i))) + this.x,
						(this.valid_area * Math.sin(Math.radian(tmp * i))) + this.y);
				}
			};

			pCtx.stroke();
		}

		//reset player(robot) context
		this.clear = function() {
			pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
		}

		//user can move a robot using arrow keys
		this.move = function() {
			this.sensor();
			if(this.move_flag) {
				if(this.move_status == "left" && (this.x - this.speed) > 0) {
					this.x -= this.speed;
				}
				else if(this.move_status == "right" && (this.x + this.speed) < pCanvas.width) {
					this.x += this.speed;
				}
				else if(this.move_status == "up" && (this.y - this.speed) > 0) {
					this.y -= this.speed;
				}
				else if(this.move_status == "down" && (this.y + this.speed) < pCanvas.height) {
					this.y += this.speed;
				}
			}
		}

		this.sensor = function() {
			var self = this;
			//intersect rectangle list
			var intersect_rectangle = [];
			//unit angle
			var tmp = 360 / this.ray_count;

			var robot_left_top = {'x': this.x - this.valid_area, 'y': this.y - this.valid_area};
			var robot_bottom_right = {'x': this.x + this.valid_area, 'y': this.y + this.valid_area};

			//preprocessing
			object_collision.forEach(function(elem, idx) {
				if( (elem.x < robot_bottom_right.x && elem.y < robot_bottom_right.y) &&
					(elem.x + elem.width > robot_left_top.x && elem.y + elem.height > robot_left_top.y )) {
					elem.index = idx;
					intersect_rectangle.push(elem);
				}
			});
			
			//draw distance sensor
			for (var i = 0; i < this.ray_count; i++) {
				var end_x = (this.valid_area * Math.cos(Math.radian(tmp * i))) + this.x;
				var end_y = (this.valid_area * Math.sin(Math.radian(tmp * i))) + this.y;

				//this.x this.y end_x end_y
				//rectangle x, y, width, height
				//(x,y), (x+width, y), (x, y+height), (x+width, y+height)

				//(x,y), (x+width, y)
				//(x,y), (x, y+height)
				//(x+width, y), (x+width, y+height)
				//(x, y+height), (x+width, y+height)

				var A = end_y - this.y;
				var B = end_x - this.x;
				var C = this.x * end_y - end_x * this.y;

				// y = object_collision[i].y A = 0 B = 
				// y = object_collision[i].y + height A = 0 B = 
				// x = object_collision[i].x A = 1
				// x = object_collision[i].x + width

				//elem -> rectangle of object_collision
				intersect_rectangle.forEach(function(elem) {
					var distance;
					if( (C + B * elem.y)/A > elem.x && (C + B * elem.y)/A < elem.x + elem.width ) {
						if(object_collision[elem.index].intersect_point.dist !== undefined) {
							distance = Math.sqrt( Math.pow((self.x - ((C + B * elem.y)/A)), 2) + Math.pow((self.y - elem.y), 2) );
							console.log(distance);
							if(distance < object_collision[elem.index].intersect_point.dist) {
								console.log("jtet");
								object_collision[elem.index].intersect_point.dist = distance;
								object_collision[elem.index].intersect_point.x = (C + B * elem.y)/A;
								object_collision[elem.index].intersect_point.y = elem.y;
							}
						}
					} 
					else if( (C + B * (elem.y + elem.height))/A > elem.x &&
					 (C + B * (elem.y + elem.height))/A < elem.x + elem.width ) {
					 	if(object_collision[elem.index].intersect_point.dist !== undefined) {
					 		distance = Math.sqrt( Math.pow((self.x - ((C + B * (elem.y + elem.height))/A)), 2) + Math.pow((self.y - elem.y), 2) );
					 		console.log(distance);
					 		if(distance < object_collision[elem.index].intersect_point.dist) {
					 			console.log("jtet");
					 			object_collision[elem.index].intersect_point.dist = distance;
					 			object_collision[elem.index].intersect_point.x = (C + B * (elem.y + elem.height))/A;
					 			object_collision[elem.index].intersect_point.y = elem.y;
					 		}
					 	}
					} 
					else if( (A * elem.x - C)/B > elem.y && (A * elem.x - C)/B < elem.y + elem.height ) {
						if(object_collision[elem.index].intersect_point.dist !== undefined) {
							distance = Math.sqrt( Math.pow((self.x - elem.x), 2) + Math.pow((self.y - ((A * elem.x - C)/B)), 2) );
							if(distance < object_collision[elem.index].intersect_point.dist) {
								console.log("jtet");
								object_collision[elem.index].intersect_point.dist = distance;
								object_collision[elem.index].intersect_point.x = elem.x;
								object_collision[elem.index].intersect_point.y = (A * elem.x - C)/B;
							}
						}
					} 
					else if( (A * (elem.x + elem.width) - C)/B > elem.y &&
					(A * (elem.x + elem.width) - C)/B < elem.y + elem.height ) {
						if(object_collision[elem.index].intersect_point.dist !== undefined) {
							distance = Math.sqrt( Math.pow((self.x - elem.x), 2) + Math.pow((self.y - ((A * (elem.x + elem.width) - C)/B)), 2) );
							console.log(distance);
							if(distance < object_collision[elem.index].intersect_point.dist) {
								console.log("jtet");
								object_collision[elem.index].intersect_point.dist = distance;
								object_collision[elem.index].intersect_point.x = elem.x;
								object_collision[elem.index].intersect_point.y = (A * (elem.x + elem.width) - C)/B;
							}
						}
					}

				});
				//x(y2-y1) - y(x2-x1) = x1y2 - x2y1
				//Ax - By = C

				// pCtx.beginPath();
				// pCtx.moveTo(this.x, this.y);
				// pCtx.lineTo(end_x, end_y);
				// pCtx.stroke();
			};
		}
	}

	var particle = function(x, y) {
		this.x = x;
		this.y = y;
		this.weight = 0;
	};

	particle.prototype = {
		//draw particle
		draw: function() {
			particleCtx.beginPath();
			particleCtx.rect(Math.floor(this.x), Math.floor(this.y), 2, 2);
			particleCtx.fillStyle = 'red';
			particleCtx.fill();
			particleCtx.lineWidth = 1;
			particleCtx.strokeStyle = 'red';
			particleCtx.stroke();
		},
		move: function() {
		},
		probing: function() {
		},
		sensor: function() {
			//intersect rectangle list
			var intersect_rectangle = [];
			//unit angle
			var tmp = 360 / robot.ray_count;

			var robot_left_top = {'x': this.x - robot.valid_area, 'y': this.y - robot.valid_area};
			var robot_bottom_right = {'x': this.x + robot.valid_area, 'y': this.y + robot.valid_area};

			//preprocessing
			object_collision.forEach(function(elem) {
				if( (elem.x < robot_bottom_right.x && elem.y < robot_bottom_right.y) &&
					(elem.x + elem.width > robot_left_top.x && elem.y + elem.height > robot_left_top.y ))
					intersect_rectangle.push(elem);
			});

			//draw distance sensor
			for (var i = 0; i < this.ray_count; i++) {
				var end_x = (robot.valid_area * Math.cos(Math.radian(tmp * i))) + this.x;
				var end_y = (robot.valid_area * Math.sin(Math.radian(tmp * i))) + this.y;
			};
		}
	}

	KEY_CODE = {
		37: 'left',
		38: 'up',
		39: 'right',
		40: 'down',
	};

	$(document).keydown(function(e) {
		e.preventDefault();
		robot.move_flag = true;
		robot.move_status = KEY_CODE[e.which];
	});

	$(document).keyup(function(e) {
		e.preventDefault();
		robot.move_flag = false;
	});

	function animate() {
		requestAnimFrame(animate);
		particle_manager.draw();
		robot.draw();
	}

	function distance(x1, y1, x2, y2) {
		return pow
	}
	window.requestAnimFrame = (function(){
		return  window.requestAnimationFrame   || 
		    window.webkitRequestAnimationFrame || 
		    window.mozRequestAnimationFrame    || 
		    window.oRequestAnimationFrame      || 
		    window.msRequestAnimationFrame     || 
		    function(callback, element){
		    	window.setTimeout(callback, 1000 / 60);
		    };
	})();

	animate();
	particle_manager.start();
	object_manager.start();
}

document.addEventListener("DOMContentLoaded", init);