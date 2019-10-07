/*  ----------------------------------------------------------
						BLUETOOTH FUNCTIONS
	---------------------------------------------------------- */

    if (window.hyper && window.hyper.log) { console.log = hyper.log }

    document.addEventListener(
        'deviceready',
        function() { 
            //console.log('Initialized.');
            //evothings.scriptsLoaded(app.initialize); },
            app.initialize();
        }, 
        false);

    var app = {}

    app.SERVICE_UUID='0000ffe0-0000-1000-8000-00805f9b34fb';
    app.CHARACTERISTIC_UUID='0000ffe1-0000-1000-8000-00805f9b34fb';
    
    app.initialize = function()
    {
        app.disconnect();
        console.log('Initialized.');
        app.connected = false;
        app.null = false; 
        app.connect();
    }

    app.connect = function()
    {
        console.log('Attempting to connect to bluetooth module');
        app.disconnect();
        
        evothings.easyble.startScan(scanSuccess, scanFailure,  {serviceUUIDS : [app.SERVICE_UUID] }, { allowDuplicates: false });
        
        //evothings.easyble.stopScan();
    }

    app.disconnect = function(errorMessage)
    {
        if(errorMessage)
        {
            navigator.notification.alert(errorMessage, function () {});
        }
        app.connected = false;
        app.device = null;

        evothings.easyble.stopScan();
        evothings.easyble.closeConnectedDevices();
    }

    app.receivedData = function(data)
    {
        if (app.connected)
        {
            var data = new Uint8Array(data);

            console.log("Received data!: " + data[0]);
            if (data[0] == 0x00)
            {   
                console.log("LED maximum brightness.");
                navigator.notification.vibrate(2500);
            }

        }
        else
        {
            app.disconnect('Disconnected');

            console.log('Error - No device connected');
        }
    }

    app.sendData = function(data)
    {

        if (app.connected && app.device != null)
        {
            data = new Uint8Array(data);
            console.log("device " + app.device.name);
            app.device.writeCharacteristic(
                app.CHARACTERISTIC_UUID,
                data,
                function () 
                { 
                    console.log('Succeed to send message.' + data); 
                },
                function (errorCode) 
                { 
                    console.log('Failed to send data. ' + errorCode);
                    app.disconnect('Failed to send data');
                });
        }
        else 
        {
            app.disconnect('Disconnected');
            console.log('Error- No device connected');
        }
    }

/*  ----------------------------------------------------------
						ACCELEROMTER FUNCTIONS
	---------------------------------------------------------- */
    var watchID_accel;
    
    app.startAccel = function()
    {
        console.log("Start tracking acceleration.");
        watchID_accel = navigator.accelerometer.watchAcceleration(sendAcceleration, console.log('Failed to get acceleration'), { frequency: 1000});
    }

    app.stopAccel = function()
    {
        if (watchID_accel)
        {
            navigator.accelerometer.clearWatch(watchID_accel);
            watchID_accel = null;
            this.sendData([0x00]);
        }
    }

    sendAcceleration = function (acceleration)
    {

        app.sendData([Math.abs(acceleration.y)]);
        $('#reading').text(acceleration.y);
    }


/*  ----------------------------------------------------------
						CALLBACK FUNCTIONS
    ---------------------------------------------------------- */
    
    function scanSuccess(device)
    {
        if (device.name != null)
        {
            console.log(
                'Found: ' + device.name + ', ' + 
                device.address + ', ' + device.rssi);
            device.connect(connectSuccess, connectFailure);
            evothings.easyble.stopScan();
            console.log("STOOOOOOOOOOOOOOOP!");
        }
        
    }

    function scanFailure(errorCode)
    {
        app.disconnect('Failed to scan for device.');
        console.log('Error ' + errorCode);
    }
    
    function connectSuccess(device)
    {
        device.readServices(serviceSuccess, serviceFailure, [app.SERVICE_UUID]);
    }
    
    function connectFailure()
    {
        app.connected = false; 
        console.log('Failed to connect to device.');
    }

    function serviceSuccess(device)
    {
        app.connected = true;
        app.device = device;
        console.log('Service success! ' + device.name);
        device.enableNotification(
            app.SERVICE_UUID,
            app.CHARACTERISTIC_UUID,
            app.receivedData,
            function(errorCode) {
                console.log('BLE enableNotification error: ' + errorCode); 
            },
            { writeConfigDescriptor: false });
        app.sendData([0x10]);
    }

    function serviceFailure(errorCode)
    {
        console.log('Service failure');
         //TODO: disconnect and show an error message to the user
        app.disconnect('Disconnected');

         //TODO: write debug information to console
        console.log('Error reading services: ' + errorCode);
    }