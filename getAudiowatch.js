var express = require('express');
var Sound = require('node-aplay');
var mqtt = require('mqtt');
var bodyParser = require('body-parser');
const { execSync, exec, spawn } = require('child_process');

const formidable = require('express-formidable');
var client = mqtt.connect('mqtt://localhost:1883');
client.on('connect', function () {
    var app = express();
    app.use(formidable());
    app.use(bodyParser.urlencoded({ extended: false }));

    app.post('/audiodata', function (req, res, next) {
        // req.file is the `avatar` file
        // req.body will hold the text fields, if there were any
        console.log('Received a request');
        // console.log(req.fields);
        // console.log(req.files);
        console.log(req.connection.localPort);
        console.log(req.connection.remotePort);
        // console.log(new File(req.files));
        // console.log(req.files.path);
        console.log(req.files.audio_data.path);
        client.publish('browser/start','Start now');
        execSync('cp ' + req.files.audio_data.path + ' /home/watch1/play.wav');
        let music = new Sound('/home/watch1/play.wav');
        music.play();
        music.on('complete',()=>{
            exec('rm /home/watch1/play.wav');
        });
        res.send('Thanks');
    });

    app.listen(5555, () => {
        console.log('Started the server');
    });
});










// async function main() {
//     // Imports the Google Cloud client library
//     const speech = require('@google-cloud/speech');
//     const fs = require('fs');

//     // Creates a client
//     const client = new speech.SpeechClient();

//     // The name of the audio file to transcribe
//     const fileName = '/tmp/tmp3.flac';

//     // Reads a local audio file and converts it to base64
//     const file = fs.readFileSync(fileName);
//     const audioBytes = file.toString('base64');

//     // The audio file's encoding, sample rate in hertz, and BCP-47 language code
//     const audio = {
//       content: audioBytes,
//     };
//     const config = {
//         encoding: 'FLAC',
//       sampleRateHertz: 48000,
//       languageCode: 'en-US',
//     };
//     const request = {
//       audio: audio,
//       config: config,
//     };

//     // Detects speech in the audio file
//     const [response] = await client.recognize(request);
//     const transcription = response.results
//       .map(result => result.alternatives[0].transcript)
//       .join('\n');
//     console.log(`Transcription: ${transcription}`);
//   }
//   main().catch(console.error);