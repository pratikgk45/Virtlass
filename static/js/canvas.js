var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;

var RADIUS = 80;

var RADIUS_SCALE = 1;
var RADIUS_SCALE_MIN = 1;
var RADIUS_SCALE_MAX = 1.5;

var QUANTITY = 60;

var canvas;
var context;
var particles;

var mouseX = SCREEN_WIDTH * 0.5;
var mouseY = SCREEN_HEIGHT * 0.5;
var mouseIsDown = false;

function init() {

  canvas = document.getElementById( 'world' );
  
  if (canvas && canvas.getContext) {
		context = canvas.getContext('2d');
		
		// Register event listeners
		window.addEventListener('mousemove', documentMouseMoveHandler, false);
		window.addEventListener('mousedown', documentMouseDownHandler, false);
		window.addEventListener('mouseup', documentMouseUpHandler, false);
		document.addEventListener('touchstart', documentTouchStartHandler, false);
		document.addEventListener('touchmove', documentTouchMoveHandler, false);
		window.addEventListener('resize', windowResizeHandler, false);
		
		createParticles();
		
		windowResizeHandler();
		
		setInterval( loop, 1000 / 60 );
	}
}

function createParticles() {
	particles = [];
	
	for (var i = 0; i < QUANTITY; i++) {
		var particle = {
			size: 1,
			position: { x: mouseX, y: mouseY },
			offset: { x: 0, y: 0 },
			shift: { x: mouseX, y: mouseY },
			speed: 0.01+Math.random()*0.04,
			targetSize: 1,
			fillColor: '#' + (Math.random() * 0x404040 + 0xaaaaaa | 0).toString(16),
			orbit: RADIUS*.5 + (RADIUS * .5 * Math.random())
		};
		
		particles.push( particle );
	}
}

function documentMouseMoveHandler(event) {
	mouseX = event.clientX - (window.innerWidth - SCREEN_WIDTH) * .5;
	mouseY = event.clientY - (window.innerHeight - SCREEN_HEIGHT) * .5;
}

function documentMouseDownHandler(event) {
	mouseIsDown = true;
}

function documentMouseUpHandler(event) {
	mouseIsDown = false;
}

function documentTouchStartHandler(event) {
	if(event.touches.length == 1) {
		event.preventDefault();

		mouseX = event.touches[0].pageX - (window.innerWidth - SCREEN_WIDTH) * .5;;
		mouseY = event.touches[0].pageY - (window.innerHeight - SCREEN_HEIGHT) * .5;
	}
}

function documentTouchMoveHandler(event) {
	if(event.touches.length == 1) {
		event.preventDefault();

		mouseX = event.touches[0].pageX - (window.innerWidth - SCREEN_WIDTH) * .5;;
		mouseY = event.touches[0].pageY - (window.innerHeight - SCREEN_HEIGHT) * .5;
	}
}

function windowResizeHandler() {
	SCREEN_WIDTH = window.innerWidth;
	SCREEN_HEIGHT = window.innerHeight;
	
	canvas.width = SCREEN_WIDTH;
	canvas.height = SCREEN_HEIGHT;
}

function loop() {
	
	if( mouseIsDown ) {
		RADIUS_SCALE += ( RADIUS_SCALE_MAX - RADIUS_SCALE ) * (0.02);
	}
	else {
		RADIUS_SCALE -= ( RADIUS_SCALE - RADIUS_SCALE_MIN ) * (0.02);
	}
	
	RADIUS_SCALE = Math.min( RADIUS_SCALE, RADIUS_SCALE_MAX );
	
	context.fillStyle = 'rgba(0,0,0,0.05)';
		 context.fillRect(0, 0, context.canvas.width, context.canvas.height);
	
	for (i = 0, len = particles.length; i < len; i++) {
		var particle = particles[i];
		
		var lp = { x: particle.position.x, y: particle.position.y };
		
		// Rotation
		particle.offset.x += particle.speed;
		particle.offset.y += particle.speed;
		
		// Follow mouse with some lag
		particle.shift.x += ( mouseX - particle.shift.x) * (particle.speed);
		particle.shift.y += ( mouseY - particle.shift.y) * (particle.speed);
		
		// Apply position
		particle.position.x = particle.shift.x + Math.cos(i + particle.offset.x) * (particle.orbit*RADIUS_SCALE);
		particle.position.y = particle.shift.y + Math.sin(i + particle.offset.y) * (particle.orbit*RADIUS_SCALE);
		
		// Limit to screen bounds
		particle.position.x = Math.max( Math.min( particle.position.x, SCREEN_WIDTH ), 0 );
		particle.position.y = Math.max( Math.min( particle.position.y, SCREEN_HEIGHT ), 0 );
		
		particle.size += ( particle.targetSize - particle.size ) * 0.05;
		
		if( Math.round( particle.size ) == Math.round( particle.targetSize ) ) {
			particle.targetSize = 2 + Math.random() * 7;
		}
		
		context.beginPath();
		context.fillStyle = particle.fillColor;
		context.strokeStyle = particle.fillColor;
		context.lineWidth = particle.size;
		context.moveTo(lp.x, lp.y);
		context.lineTo(particle.position.x, particle.position.y);
		context.stroke();
		context.arc(particle.position.x, particle.position.y, particle.size/2, 0, Math.PI*2, true);
		context.fill();
	}
}

var TxtRotate = function(el, toRotate, period) {
	this.toRotate = toRotate;
	this.el = el;
	this.loopNum = 0;
	this.period = parseInt(period, 10) || 2000;
	this.txt = '';
	this.tick();
	this.isDeleting = false;
};

TxtRotate.prototype.tick = function() {
	var i = this.loopNum % this.toRotate.length;
	var fullTxt = this.toRotate[i];

	if (this.isDeleting) {
		this.txt = fullTxt.substring(0, this.txt.length - 1);
	} else {
		this.txt = fullTxt.substring(0, this.txt.length + 1);
	}

	this.el.innerHTML = '<span class="wrap">'+this.txt+'</span>';

	var that = this;
	var delta = 100 - Math.random() * 100;

	if (this.isDeleting) { delta /= 2; }

	if (!this.isDeleting && this.txt === fullTxt) {
		delta = this.period;
		this.isDeleting = true;
	} else if (this.isDeleting && this.txt === '') {
		this.isDeleting = false;
		this.loopNum++;
		delta = 500;
	}

	setTimeout(function() {
		that.tick();
	}, delta);
};

function rotate(){
	var elements = document.getElementsByClassName('txt-rotate');
	for (var i=0; i<elements.length; i++) {
		var toRotate = elements[i].getAttribute('data-rotate');
		var period = elements[i].getAttribute('data-period');
		if(toRotate) {
		  	new TxtRotate(elements[i], JSON.parse(toRotate), period);
		}
	}
	
	// INJECT CSS
	var css = document.createElement("style");
	css.type = "text/css";
	css.innerHTML = ".txt-rotate > .wrap { border-right: 0.05em solid #7fff00; color: #7fff00; }";
	document.body.appendChild(css);
}

var cnt = 0;

function fade(){
	$(".prod_name").fadeIn(500).delay(1000);
	$(".prod_name").fadeOut(1000);
	if(cnt % 2)
		$(".prod_name").text("VIRTLASS");
	else
		$(".prod_name").text("ONLINE CLASSROOM PORTAL");
	cnt = (cnt + 1) % 2;

	setTimeout(function() {
		fade();
	}, 4000);
}

window.onload = function() {
	// init();
	cnt = 0;
	rotate();
	fade();
	$(".scramble_text").scramble(5000, 20, "all", true);
};