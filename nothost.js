
var lastPeerId = null;
var peer = null; // own peer object
var conn = null;
var recvIdInput = document.getElementById("receiver-id");
var status = document.getElementById("status");
var message = document.getElementById("message");

var connectButton = document.getElementById("connect-button");
var showingFire;

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
    });
    peer.on('connection', function (c) {
        // Disallow incoming connections
        c.on('open', function() {
            c.send("Sender does not accept incoming connections");
            setTimeout(function() { c.close(); }, 500);
        });
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
 * Create the connection between the two Peers.
 *
 * Sets up callbacks that handle any events related to the
 * connection and data received on it.
 */
function join() {
    // Close old connection
    if (conn) {
        conn.close();
    }

    // Create connection to destination peer specified in the input field
    conn = peer.connect(recvIdInput.value, {
        reliable: true
    });

    conn.on('open', function () {
        document.getElementById("status").innerHTML = "Connected to: " + conn.peer;
        console.log("Connected to: " + conn.peer);
        enableLoading();

        // Check URL params for comamnds that should be sent immediately
        var command = getUrlParam("command");
        if (command)
            conn.send(command);
    });
    // Handle incoming data (messages only since this is the signal sender)
    conn.on('data', function (data) {
        if(data[0] == "forwardDate"){
            console.log(data[1]);
            future(data[1]);
        }

        if(data == "reset"){
            reset();
        }
        if(data[0] == "winner"){
            winner(data[1]);
        }
        

    });
    conn.on('close', function () {
        status.innerHTML = "Connection closed";
    });
};

/**
 * Get first "GET style" parameter from href.
 * This enables delivering an initial command upon page load.
 *
 * Would have been easier to use location.hash.
 */
function getUrlParam(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null)
        return null;
    else
        return results[1];
};

/**
 * Send a signal via the peer connection and add it to the log.
 * This will only occur if the connection is still alive.
 */
    function signal(sigName) {
    if (conn && conn.open) {
        conn.send(sigName);
        console.log(sigName + " signal sent");
        
    } else {
        console.log('Connection is closed');
    }
}

// Start peer connection on click
connectButton.addEventListener('click', join);

function loadFunction(){
    document.getElementById("thisplayerbeforeLoading").style.display = 'none'; 
    document.getElementById("thisplayerloadingAnimation").style.display = 'block'; 
    signal("player2loaded");
    thisPlayerAnimationEnd();
    loadButton.style.visibility = 'hidden';	
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


        
function getTime(){
    var d = new Date().getTime();
    return d;
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


var allow = true;
function enableLoading(){
    setInterval(() => {
    if(gamepadIndex !== undefined) {
        // a gamepad is connected and has an index
        const myGamepad = navigator.getGamepads()[gamepadIndex];
        if(myGamepad.buttons[6].pressed && allow){
            console.log("nice")
            loadFunction();
            allow = false;
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


function enableGunTrigger(){
    // now print the axes on the connected gamepad, for example:
    console.log(gamepadIndex);
    setInterval(() => {
        if(gamepadIndex !== undefined) {
            // a gamepad is connected and has an index
            const myGamepad = navigator.getGamepads()[gamepadIndex];
            if (myGamepad.axes[2] == -1){ signal(["trigger_pulled", getTime()]);} 
        }
    }, 100)
    
}

function winner(winningplayer){
    var myClasses = document.getElementsByClassName("text_inner2");
    if (winningplayer == 1){ w = "YOU LOST"; }
    if (winningplayer == 2){ w = "YOU WON"; }
    for (var i = 0; i < myClasses.length; i++) {
        myClasses[i].innerHTML = w;
    }
    document.getElementById("ui").style = " position: relative; right: -150px; display: block;";
    enableReset();
}


function reset(){
    clearInterval(showingFire);

    clearInterval(thisLoadingAnimationsFuture); 
	clearInterval(otherLoadingAnimationsFuture); 
    
    var player1 = false;
    var player2 = false;
    var loadStatus = 0;
    var allow = true;
    var allowReset = true; 
    var player1Loaded = 0;
    var player2Loaded = 0;
    var randomTime = null;
    document.getElementById("loadButton").style.visibility = 'visible'; //or wtvr it is

    var img = document.getElementById("otherplayerloadingAnimation");
    var imageUrl = img.src;
    img.src = "";
    img.src = imageUrl;
    var img = document.getElementById("thisplayerloadingAnimation");
    var imageUrl = img.src;
    img.src = "";
    img.src = imageUrl;


    document.getElementById("ui").style.display = 'none';

    document.getElementById("thisplayerbeforeLoading").style.display = 'block'; //reseting animation
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
    initialize();

});

document.getElementById("receiver-id")
    .addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById("connect-button").click();
}
});
