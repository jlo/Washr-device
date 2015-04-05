//@program

var greenS = new Skin({fill:"green"});
var redS = new Skin({fill:"red"});
var orangeS = new Skin({fill:"orange"});


washerTime = 0;
washerInUse = 0;
dryerTime = 0;
dryerInUse = 0;
paidForWasher = false;
paidForDryer = false;

deviceURL = "";

Handler.bind("/getCount", Behavior({
	onInvoke: function(handler, message){
		var allData = new Object();
		allData.washerTime = washerTime;
		allData.washerInUse = washerInUse;
		allData.dryerTime = dryerTime;
		message.responseText = JSON.stringify(allData);
		message.status = 200;
	}
}));

Handler.bind("/reset", Behavior({
	onInvoke: function(handler, message){
		var allData = new Object();
		addingMoreFood = true;
		message.responseText = JSON.stringify({addingMoreFood: true});
		message.status = 200;
	}
}));

Handler.bind("/gotAnalogResult", Object.create(Behavior.prototype, {
	onInvoke: { value:
		function(handler, message) {
			//Receives result and passes to main container.
            var result = message.requestObject;
            //result.y = 90;
            //trace("\nHAHAH " + result.y);
    		application.distribute( "onAnalogValueChanged", result );
		},
	},
}));

var sensor = new Line({left:0, right:0, top:0, bottom:0, width: 5, height: 5, skin: redS});
var MainContainer = Container.template(function($) {
	return { left: 0, right: 0, top: 0, bottom: 0, skin: new Skin({ fill: 'white',}),
	contents: [
		sensor,
		Label($, { left: 0, right: 0, style: new Style({ color: 'black', font: '20px', horizontal: 'null', vertical: 'null', }),
		behavior: Object.create((MainContainer.behaviors[0]).prototype), string: '', }),
], }});
MainContainer.behaviors = new Array(1);
MainContainer.behaviors[0] = Behavior.template({
	onAnalogValueChanged: function(content,result) {
    	/*washerTime = result.x.toFixed(2);
    	if (washerTime < 15) {
    		sensor.skin = redS;
			content.string = "Food is low..."
    		if (addingMoreFood) {
    			sensor.skin = orangeS;
    			content.string = "Adding more food..."
			}
		} else {
			addingMoreFood = false;
    		content.string = ""
    		sensor.skin = greenS;
		}
    	washerInUse = result.y.toFixed(2);
    	dryerTime = result.y;*/
	},
})
/* Create message for communication with hardware pins.
   analogSensor: name of pins object, will use later for calling 'analogSensor' methods.
   require: name of js or xml bll file.
   pins: initializes 'analogTemp' (matches 'analogTemp' object in the bll)
  	   	 with the given pin numbers. Pin types are set within the bll.	*/
application.invoke( new MessageWithObject( "pins:configure", {
    dryerpintwo: {
        require: "dryerpintwo",
        pins: {
            c: { pin: 41 },
			d: { pin: 42 }
        }
    },
    dryerpinone: {
        require: "dryerpinone",
        pins: {
            a: { pin: 43 },
			b: { pin: 44 }
        }
    },
	washerpintwo: {
        require: "washerpintwo",
        pins: {
            y: { pin: 45 }, 
			z: { pin: 46 }
        }
    },
	washerpinone: {
        require: "washerpinone",
        pins: {
            w: { pin: 47 }, 
			x: { pin: 48 }
        }
    }
}));

/* Use the initialized analogSensor object and repeatedly 
   call its read method with a given interval.  */
application.invoke( new MessageWithObject( "pins:/dryerpintwo/read?" + 
	serializeQuery( {
		repeat: "on",
		interval: 20,
		callback: "/gotAnalogResult"
})));

application.add( new MainContainer() );
var ApplicationBehavior = Behavior.template({
	onLaunch: function(application) {
		application.shared = true;
	},
	onQuit: function(application) {
		application.shared = false;
	},
})
application.behavior = new ApplicationBehavior();