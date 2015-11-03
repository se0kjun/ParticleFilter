function init() {
	var blkCanvas = document.getElementById('block');
	var pCanvas = document.getElementById('player');
	var particleCanvas = document.getElementById('particle');

	var bCtx = blkCanvas.getContext('2d');
	var pCtx = pCanvas.getContext('2d');
	var particleCtx = particleCanvas.getContext('2d');

	var object_collision = [
		[1, 2, 3, 4],
		[1, 2, 3, 4],
	];

	// draw_manager = new function() {
	// 	this.particle_list = [];

	// 	this.start = function() {
	// 	}
	// 	this.draw = function() {
	// 	}
	// 	this.clear = function() {
	// 		bCtx.clearRect(0, 0, blkCanvas.width, blkCanvas.height);
	// 	}
	// }

	particle_manager = new function() {
		this.particle_list = [];

		this.start = function() {
			for (var i = 0; i < 200; i++) {
				var p = new particle(Math.random() * 640, Math.random() * 640);
				this.particle_list.push(p);
			};
		}
		this.draw = function() {
			this.particle_list.forEach(function(elem) {
				elem.draw();
			});
		}
		this.clear = function() {
			particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
		}
	}

	robot = new function() {
		this.x = 0;
		this.y = 0;
		this.speed = 2;
		this.move_flag = false;
		this.move_status;

		this.draw = function() {
			this.clear();
			this.move();

			pCtx.beginPath();
			pCtx.rect(this.x, this.y, 2, 2);
			pCtx.fillStyle = 'black';
			pCtx.fill();
			pCtx.lineWidth = 3;
			pCtx.shadowColor = '#00ff00';
			pCtx.shadowBlur = 40;
			pCtx.strokeStyle = 'black';
			pCtx.stroke();
		}

		this.clear = function() {
			pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
		}

		this.move = function() {
			// if(this.x < pCanvas.width && this.y < pCanvas.height && this.x >= 0 && this.y >= 0 && this.move_flag) {
			if(this.move_flag) {
				if(this.move_status == "left") {
					this.x -= this.speed;
				}
				else if(this.move_status == "right") {
					this.x += this.speed;
				}
				else if(this.move_status == "up") {
					this.y -= this.speed;
				}
				else if(this.move_status == "down") {
					this.y += this.speed;
				}
			}
			// }
		}
	}

	var particle = function(x, y) {
		this.x = x;
		this.y = y;
	};

	particle.prototype = {
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
		clear: function() {
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
}

document.addEventListener("DOMContentLoaded", init);