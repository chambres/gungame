var player1 = false;
var player2 = false;
var loadStatus = 0;
var player1Loaded = 0;
var player2Loaded = 0;
var randomTime;
var lastPeerId = null;
var peer = null; // Own peer object
var peerId = null;
var conn = null;
var recvId = document.getElementById("receiver-id");
var status = document.getElementById("status");
var gamepadIndex;
var ID;
var showingFire;


	
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); 
}
	
	
	
	/**
	 * Create the Peer object for our end of the connection.
	 *
	 * Sets up callbacks that handle any events related to our
	 * peer object.
	 */
	  function initialize() {
				// Create own peer object with connection to shared PeerJS server
				peer = new Peer(null, {
					debug: 2
				});

				peer.on('open', function (id) {
					// Workaround for peer.reconnect deleting previous id
					if (peer.id === null) {
						console.log('Received null id from peer open');
						peer.id = lastPeerId;
					} else {
						lastPeerId = peer.id;
					}

					console.log('ID: ' + peer.id);
					recvId.innerHTML = "ID: " + peer.id;
					ID = peer.id
					status.innerHTML = "Awaiting connection...";
				});
				peer.on('connection', function (c) {
					// Allow only a single connection
					if (conn && conn.open) {
						c.on('open', function() {
							c.send("Already connected to another client");
							setTimeout(function() { c.close(); }, 500);
						});
						return;
					}

					conn = c;
					console.log("Connected to: " + conn.peer);
					status.innerHTML = "Connected";

					ready();
					enableLoading();
				});
				peer.on('disconnected', function () {
					status.innerHTML = "Connection lost. Please reconnect";
					console.log('Connection lost. Please reconnect');

					// Workaround for peer.reconnect deleting previous id
					peer.id = lastPeerId;
					peer._lastServerId = lastPeerId;
					peer.reconnect();
				});
				peer.on('close', function() {
					conn = null;
					status.innerHTML = "Connection destroyed. Please refresh";
					console.log('Connection destroyed');
				});
				peer.on('error', function (err) {
					console.log(err);
					alert('' + err);
				});
			};

			/**
			 * Triggered once a connection has been achieved.
			 * Defines callbacks to handle incoming data and connection events.
			 */
			function signal(sigName) {
				if (conn && conn.open) {
					conn.send(sigName);
					console.log(sigName + " signal sent");
					
				} else {
					console.log('Connection is closed');
				}
			}
			
		

		
			
			function loadFunction(){
				document.getElementById("thisplayerbeforeLoading").style.display = 'none'; 
				document.getElementById("thisplayerloadingAnimation").style.display = 'block'; 
				checkLoad(1);
				thisPlayerAnimationEnd();
		
			}
			
		

			function ready() {			
				conn.on('data', function (data) {
					console.log("Data recieved");
					if (data == "Go"){
						go();
						}
					if (data == "player2loaded"){
						checkLoad(2)
						}
					if (data[0] == "trigger_pulled"){
						triggerPulled([data[1], 2])
					}
					if (data == "reset"){
						reset();
					}
					else{
						player2 = data;
					}
					
				});
				conn.on('close', function () {
					status.innerHTML = "Connection reset<br>Awaiting connection...";
					conn = null;
				});
			}
		
		function go(){
			alert("hi")
		}
		

	
	var thisLoadingAnimationsFuture;
	var otherLoadingAnimationsFuture;
	
	
	function otherPlayerAnimationEnd() 
	{  
		otherLoadingAnimationsFuture = window.setTimeout(function() {
			document.getElementById("otherplayerloadingAnimation").style.display = 'none';
			document.getElementById("otherplayerafterLoading").style.display = 'block';
		}, 3000);   
	}
	
	function thisPlayerAnimationEnd() 
	{  
		thisLoadingAnimationsFuture = window.setTimeout(function() {
			document.getElementById("thisplayerloadingAnimation").style.display = 'none';
			document.getElementById("thisplayerafterLoading").style.display = 'block';
		}, 3000);   
	}		

	function checkLoad(player){
		if(player == 1 && !player1Loaded){ 
			loadStatus++;
			player1Loaded = true;
			signal("hostloaded")
			document.getElementById("thisplayerbeforeLoading").style.display = 'none'; 
			document.getElementById("thisplayerloadingAnimation").style.display = 'block'; 
			thisPlayerAnimationEnd();
			}
		if(player == 2 && !player2Loaded){ 
			loadStatus++;
			player2Loaded = true; 
			document.getElementById("otherplayerbeforeLoading").style.display = 'none'; 
			document.getElementById("otherplayerloadingAnimation").style.display = 'block'; 
			otherPlayerAnimationEnd();
		}
		
		if (player1Loaded && player2Loaded){
			console.log("both have loaded")
			randomTime = startGame();
		}
	}

	function getTime(){
		var d = new Date().getTime();
		return d;
	}


	function startGame(){
		randomTime = getRandomInt(5, 15)*1000;
		randomTime = new Date().getTime()+randomTime
		console.log(randomTime);
		signal(["forwardDate", randomTime]); 
		future(randomTime)


		return randomTime;
	}
	
	function future(futureTime){
		enableGunTrigger();
		
		var myClasses = document.getElementsByClassName("text_inner2");

		for (var i = 0; i < myClasses.length; i++) {
			myClasses[i].innerHTML = "FIRE!";
		}
		
		document.getElementById("ui").style = "display: none;"
		

		function showFIRE(){
			console.log("FIRE")
			document.getElementById("ui").style = " position: relative; right: -200px; display: block;";
			status.innerHTML = "FIRE!";
			
		 
		}

		settime(futureTime-getTime());
		var showingFire = setTimeout(showFIRE, futureTime-getTime());
		
		
	}

	var allow = true;
	function enableLoading(){

		setInterval(() => {
		if(gamepadIndex !== undefined) {
			// a gamepad is connected and has an index
			const myGamepad = navigator.getGamepads()[gamepadIndex];
			if(myGamepad.buttons[6].pressed && allow){
				console.log("nice");
				allow = false;
				loadFunction();
			}
			
		}
		}, 100)
	}

	var allowReset = true;
	function enableReset(){

		setInterval(() => {
		if(gamepadIndex !== undefined) {
			// a gamepad is connected and has an index
			const myGamepad = navigator.getGamepads()[gamepadIndex];
			if(myGamepad.buttons[4].pressed && allowReset){
				allowReset = false;
				reset();
			}
			
		}
		}, 100)
	}

	function settime(timeToWait){
		console.log("hi: " + timeToWait);
		var drum = document.getElementById('drumroll');
		var go = document.getElementById('GO');
		drum.currentTime=0;
		go.currentTime=0;
		drum.play();

		

		setTimeout(function(){ go.play();  }, timeToWait);

		
		setTimeout(function(){drum.pause()}, timeToWait)

	}

	
	function enableGunTrigger(){
		// now print the axes on the connected gamepad, for example:
		console.log(gamepadIndex);
		setInterval(() => {
			if(gamepadIndex !== undefined) {
				// a gamepad is connected and has an index
				const myGamepad = navigator.getGamepads()[gamepadIndex];
				if (myGamepad.axes[2] == -1){ triggerPulled([getTime(), 1]); } 
			}
		}, 100)
		
	}
	
	function winner(winningplayer){
		var myClasses = document.getElementsByClassName("text_inner2");
		var w = "something broke";
		if (winningplayer == 2){ w = "YOU LOST"; }
		if (winningplayer == 1){ w = "YOU WON"; }
		for (var i = 0; i < myClasses.length; i++) {
			myClasses[i].innerHTML = w;
		}
		document.getElementById("ui").style = " position: relative; right: -150px; display: block;";
		enableReset();
	}

	function triggerPulled(time){
		if (time[0] > randomTime){
			signal(["winner", time[1]]);
			winner(time[1])

		}
		if(time[0] < randomTime){
			signal(["winner", time[1] + " shot early"]);
			if(time[1] == 1){ winner(2); signal(["winner", 2])} 
			if(time[1] == 2){ winner(1); signal(["winner", 1])}
		}
	}
	
	function reset(){
		clearInterval(showingFire);
		clearInterval(thisLoadingAnimationsFuture); 
		clearInterval(otherLoadingAnimationsFuture); 
		allow = true;
		allowReset = true;
		player1 = false;
		player2 = false;
		loadStatus = 0;
		player1Loaded = 0;
		player2Loaded = 0;
		randomTime = null;

		var img = document.getElementById("otherplayerloadingAnimation"); //resetting gif playback
		var imageUrl = img.src;
		img.src = "";
		img.src = imageUrl;
		var img = document.getElementById("thisplayerloadingAnimation");
		var imageUrl = img.src;
		img.src = "";
		img.src = imageUrl;

		document.getElementById("ui").style.display = 'none';
		
		document.getElementById("thisplayerbeforeLoading").style.display = 'block';
		document.getElementById("thisplayerloadingAnimation").style.display = 'none';
		document.getElementById("thisplayerafterLoading").style.display = 'none';

		document.getElementById("otherplayerbeforeLoading").style.display = 'block';
		document.getElementById("otherplayerloadingAnimation").style.display = 'none';
		document.getElementById("otherplayerafterLoading").style.display = 'none';
		
	}
		
		
		
	window.addEventListener("gamepadconnected", function(e) {
		gamepadIndex = e.gamepad.index;
		document.getElementById("ui").style.display = 'none';
		document.getElementById("game").style.display = 'block';
		document.getElementById("gunSprites").style.display = "block";
		document.getElementById("gunSprites").style.display = "flex";

		
		
	});
	
	function copyID(){
	   const elem = document.createElement('textarea');
	   elem.value = ID;
	   document.body.appendChild(elem);
	   elem.select();
	   document.execCommand('copy');
	   document.body.removeChild(elem);
}


initialize();