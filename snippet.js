 var client = new Paho.MQTT.Client('192.168.0.100', 3000, "web_" + parseInt(Math.random() * 100, 10));
            client.onConnectionLost = onConnectionLost;
            client.onMessageArrived = onMessageArrived;

            // connect the client
            client.connect({onSuccess:onConnect});
            var m_battery = {};
            var m_cpu = {};

            // called when the client connects
            function onConnect() {
              // Once a connection has been made, make a subscription and send a message.
              console.log("onConnect");
              client.subscribe("watch1/ack");
              setInterval(function(){
            	  tizen.systeminfo.getPropertyValue('BATTERY',function(battery){
//            		  console.log(properties);
            		  tizen.systeminfo.getPropertyValue('CPU',function(cpu){
            			  init = new Date();
            			  time = new Date().getTime();
            			  m_battery = Object.assign(battery);
            			  m_cpu = Object.assign(cpu);
            			  var message = new Paho.MQTT.Message(JSON.stringify({
            				  hrm:heartRateData,
            				  time:time,
            				  battery:battery,
            				  cpuLoad:cpu,
            				  totalMemory:tizen.systeminfo.getTotalMemory(),
            				  av_Mem:tizen.systeminfo.getAvailableMemory()
            				  }));
                          message.destinationName = "watch1/watchdata";
                          client.send(message);
                          console.log('Message sent');
            		  });
            		  
            	  });            	  
            	  
            	  
              },FREQUENCY);              
              
            }

            // called when the client loses its connection
            function onConnectionLost(responseObject) {
              if (responseObject.errorCode !== 0) {
                console.log("onConnectionLost:"+responseObject.errorMessage);
              }
            }

            // called when a message arrives
            function onMessageArrived(message) {
              var finaldate = new Date() - init;
              console.log("FINAL DATE:"+finaldate);
              console.log("Message from server:"+message.payloadString);
              var message = new Paho.MQTT.Message(JSON.stringify({
				  hrm:heartRateData,
				  time:time,
				  battery:m_battery,
				  cpuLoad:m_cpu,
				  totalMemory:tizen.systeminfo.getTotalMemory(),
				  av_Mem:tizen.systeminfo.getAvailableMemory(),
				  roundtrip_time: finaldate
				  }));
              message.destinationName = "watch1/finaldata";
              client.send(message);
              console.log('Message sent');
            }
        }