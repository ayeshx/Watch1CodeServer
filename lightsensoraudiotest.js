//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var client = new Paho.MQTT.Client('192.168.1.9', 3000, "watch_" + parseInt(Math.random() * 100, 10));
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

// connect the client
client.connect({onSuccess:onConnect});

function onConnect() {
    // Once a connection has been made, make a subscription and send a message.
    console.log("onConnect");
    client.subscribe("watch1/ack");
    client.subscribe("watch1/start");
    client.subscribe("watch1/kill");
    var message = new Paho.MQTT.Message("Watch ready!");
    message.destinationName = "watch1/connect";
    client.send(message);
  }


var gumStream; 						//stream from getUserMedia()
var recorder;
var rec						//Recorder.js object
var input; 							//MediaStreamAudioSourceNode we'll be recording

// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext; //audio context to help us record
var dataa;
function startRecording() {
    alert("recordButton clicked");
    var constraints = { audio: true, video: false }
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        alert("getUserMedia() success, stream created, initializing Recorder.js ...");
        audioContext = new AudioContext();
        gumStream = stream;
        input = audioContext.createMediaStreamSource(stream);
        rec = new Recorder(input, { numChannels: 1 });
        rec.record();
        alert("Recording started");

    });
}

function stopRecording() {
    alert("stopButton clicked");
    rec.stop();
    gumStream.getAudioTracks()[0].stop();
    rec.exportWAV(createDownloadLink);
}

function createDownloadLink(blob) {
    alert('In here now');
    //name of .wav file to use during upload and download (without extendion)
    var filename = new Date().toISOString();

    var fd = new FormData();
    fd.append("audio_data", blob, filename);
    alert('Just before ajax');
    var fd = new FormData();
    fd.append("audio_data", blob, filename);
    $.ajax({
        type: 'POST',
        url: 'http://192.168.1.9:5555/audiodata',
        data: fd,
        processData: false,
        contentType: false
    }).done(function (data) {
        alert(data);
    });
    alert('Sent message to server');
}
startRecording();
setTimeout(() => {
    stopRecording();
}, 10000);

function onMessageArrived(message){
    if(message.destinationName == 'watch1/start'){
        setInterval(()=>{
            startRecording();
            var message = new Paho.MQTT.Message("Recorder ready!");
            message.destinationName = "watch1/readytolisten";
            client.send(message);
            setTimeout(()=>{
                stopRecording();
            },11000);
        },25000);
    } else if(message.destinationName == 'watch1/c_audiodata'){
        var msg = JSON.parse(message);
        tizen.systeminfo.getPropertyValue('BATTERY', function (battery) {
            tizen.systeminfo.getPropertyValue('CPU', function (cpu) {
                var message = new Paho.MQTT.Message(JSON.stringify({
                    word: msg.word,
                    predic_time: msg.predic_time,
                    battery: battery,
                    cpuLoad: cpu,
                    totalMemory: tizen.systeminfo.getTotalMemory(),
                    av_Mem: tizen.systeminfo.getAvailableMemory()
                }));
                message.destinationName = "watch1/audiodata";
                client.send(message);
                console.log('Message sent');
            });

        });
    }
}