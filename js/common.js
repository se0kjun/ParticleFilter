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
		[100, 0, 20, 150],
		[220, 0, 20, 90],
		[420, 0, 20, 200],
		[200, 200, 240, 20],
		[300, 100, 120, 20],
		[0, 300, 300, 20],
		[500, 100, 140, 20],
		[550, 200, 90, 20],
		[0, 400, 100, 20],
		[150, 400, 100, 20],
		[250, 400, 20, 240],
		[270, 400, 100, 20],
		[420, 400, 220, 20],
		[70, 470, 100, 100],
		[460, 270, 20, 130],
		[500, 500, 140, 20],
	];

	//util
	//convert degree to radian
	Math.radian = function(degree) {
		return degree * Math.PI / 180;
	}

	object_manager = new function() {
		//draw rectangles
		this.start = function() {
			for (var i = 0; i < object_collision.length; i++) {
				bCtx.beginPath();
				bCtx.rect(object_collision[i][0], object_collision[i][1], 
					object_collision[i][2], object_collision[i][3]);
				bCtx.fillStyle = 'green';
				bCtx.fill();
				bCtx.lineWidth = 1;
				bCtx.strokeStyle = 'green';
				bCtx.stroke();
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

		this.draw = function() {
			this.clear();
			this.move();

			pCtx.beginPath();
			pCtx.rect(this.x, this.y, 2, 2);
			pCtx.fillStyle = 'black';
			pCtx.fill();
			pCtx.lineWidth = 3;
			pCtx.strokeStyle = 'black';
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
			//unit angle
			var tmp = 360 / this.ray_count;
			
			//draw distance sensor
			for (var i = 0; i < this.ray_count; i++) {
				pCtx.beginPath();
				pCtx.moveTo(this.x, this.y);
				pCtx.lineTo((this.valid_area * Math.cos(Math.radian(tmp * i))) + this.x, 
					(this.valid_area * Math.sin(Math.radian(tmp * i))) + this.y);
				pCtx.stroke();
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