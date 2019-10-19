let recognizer;

function predictWord() {
    // Array of words that the recognizer is trained to recognize.
    const audioBlob = new Blob(audioChunks);
                        const audioUrl = URL.createObjectURL(audioBlob);
                        const audio = new Audio(audioUrl);
                        console.log('Stopped recording');
                        audio.play();
    const words = recognizer.wordLabels();
    alert('Just before listening');
    alert(words);
    recognizer.listen(({ scores }) => {
        alert('Listening');
        // Turn scores into a list of (score,word) pairs.
        var init = new Date();
        scores = Array.from(scores).map((s, i) => ({ score: s, word: words[i] }));
        // Find the most probable word.
        scores.sort((s1, s2) => s2.score - s1.score);
        alert(scores[0].word);
        alert(new Date() - init);
    }, { probabilityThreshold: 0.75 });
}

function app() {
    recognizer = speechCommands.create('BROWSER_FFT');
    new Promise((resolve, reject) => {
        resolve(recognizer.ensureModelLoaded());
    }).then(() => {
        predictWord();
        alert('Called predictWord');
    });

}

app();

// var client = new Paho.MQTT.Client('192.168.1.2', 3000, "web_" + parseInt(Math.random() * 100, 10));
// client.onConnectionLost = onConnectionLost;
// client.onMessageArrived = onMessageArrived;

// // connect the client
// client.connect({ onSuccess: onConnect });
// var m_battery = {};
// var m_cpu = {};

// // called when the client connects
// function onConnect() {
//     // Once a connection has been made, make a subscription and send a message.
//     console.log("onConnect");
//     client.subscribe("watch1/start");
//     client.subscribe("watch1/kill");
//     var message = new Paho.MQTT.Message("Watch ready!");
//     message.destinationName = "watch1/connect";
//     client.send(message);
// }

// // called when the client loses its connection
// function onConnectionLost(responseObject) {
//     if (responseObject.errorCode !== 0) {
//         console.log("onConnectionLost:" + responseObject.errorMessage);
//     }
// }

// // called when a message arrives
// function onMessageArrived(message) {
//     console.log('Message Received' + message);
//     if (message.destinationName == 'watch1/start') {
//         console.log('Received message to start..');
//         var msg = JSON.parse(message.payloadString);
//         FREQUENCY = msg.frequency;
//         if (msg.test_type == 'baseline') {
//             alert('Baseline Run!');
//             setInterval(function () {
//                 tizen.systeminfo.getPropertyValue('BATTERY', function (battery) {
//                     //                        		  console.log(properties);
//                     tizen.systeminfo.getPropertyValue('CPU', function (cpu) {
//                         init = new Date();
//                         time = new Date().getTime();
//                         m_battery = Object.assign(battery);
//                         m_cpu = Object.assign(cpu);
//                         var message = new Paho.MQTT.Message(JSON.stringify({
//                             hrm: heartRateData,
//                             time: time,
//                             battery: battery,
//                             cpuLoad: cpu,
//                             totalMemory: tizen.systeminfo.getTotalMemory(),
//                             av_Mem: tizen.systeminfo.getAvailableMemory()
//                         }));
//                         message.destinationName = "watch1/finaldata";
//                         client.send(message);
//                         console.log('Message sent');
//                     });

//                 });

//             }, FREQUENCY);
//         }

//     }
// }
