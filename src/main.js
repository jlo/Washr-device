//@program

var greenS = new Skin({fill:"green"});
var redS = new Skin({fill:"red"});
var orangeS = new Skin({fill:"orange"});


washerTimeOne = 0;
washerInUseOne = 0;
washerTimeTwo = 0;
washerInUseTwo = 0;
dryerTimeOne = 0;
dryerInUseOne = 0;
dryerTimeTwo = 0;
dryerInUseTwo = 0;

deviceURL = "";

Handler.bind("/getAllInfo", Behavior({
	onInvoke: function(handler, message){
		var allData = new Object();
		allData.washerTimeOne = washerTimeOne;
		allData.washerInUseOne = washerInUseOne;
		allData.washerTimeTwo = washerTimeTwo;
		allData.washerInUseTwo = washerInUseTwo;
		allData.dryerTimeOne = dryerTimeOne;
		allData.washerInUseOne = washerInUseOne;
		allData.dryerTimeTwo = dryerTimeTwo;
		allData.washerInUseTwo = washerInUseTwo;
		message.responseText = JSON.stringify(allData);
		message.status = 200;
	}
}));

Handler.bind("/gotResult", Object.create(Behavior.prototype, {
	onInvoke: { value:
		function(handler, message) {
			//Receives result and passes to main container.
            var result = message.requestObject;
            //result.y = 90;
            //trace("\nOne " + result.c);
            //trace("\nTwo " + result.w);
			application.distribute( "onPinsChanged", result );
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
	onPinsChanged: function(content,result) {
        if (typeof result.c !== 'undefined') {
			dryerTimeTwo = result.c;
			dryerInUseTwo = result.d;
		} else if (typeof result.a !== 'undefined') {
			dryerTimeOne = result.a;
			dryerInUseOne = result.b;
		} else if (typeof result.y !== 'undefined') {
			washerTimeTwo = result.y;
			washerInUseTwo = result.z;
		} else if (typeof result.w !== 'undefined') {
        	washerTimeOne = result.w;
			washerInUseOne = result.x;
		}
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
		callback: "/gotResult"
})));

application.invoke( new MessageWithObject( "pins:/dryerpinone/read?" + 
	serializeQuery( {
		repeat: "on",
		interval: 20,
		callback: "/gotResult"
})));


application.invoke( new MessageWithObject( "pins:/washerpintwo/read?" + 
	serializeQuery( {
		repeat: "on",
		interval: 20,
		callback: "/gotResult"
})));


application.invoke( new MessageWithObject( "pins:/washerpinone/read?" + 
	serializeQuery( {
		repeat: "on",
		interval: 20,
		callback: "/gotResult"
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