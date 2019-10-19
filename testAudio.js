var Sound = require('node-aplay');
var argv = require('minimist')(process.argv.slice(2));
var mqtt = require('mqtt');
var poissonProcess = require('poisson-process');
var client = mqtt.connect('mqtt://localhost:1883');
var lock = 0;
//all automation tasks will only happen on successful connection to a broker
client.on('connect', function () {
    var duration = argv.duration;
    var file_no = 0;
    client.subscribe('watch1/resume');
    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }
    var p = poissonProcess.create(60000, function callback() {
        var file_no = getRandomInt(16);
        if(lock == 0){
            lock = 1;
            let music, word;
            switch (file_no) {
                case 0: music = new Sound('/home/watch1/Documents/zero.wav');
                    word = "zero";
                    break;
                case 1: music = new Sound('/home/watch1/Documents/one.wav'); word = "one";
                    break;
                case 2: music = new Sound('/home/watch1/Documents/two.wav'); word = "two";
                    break;
                case 3: music = new Sound('/home/watch1/Documents/three.wav'); word = "three";
                    break;
                case 4: music = new Sound('/home/watch1/Documents/four.wav'); word = "four";
                    break;
                case 5: music = new Sound('/home/watch1/Documents/five.wav'); word = "five";
                    break;
                case 6: music = new Sound('/home/watch1/Documents/six.wav'); word = "six";
                    break;
                case 7: music = new Sound('/home/watch1/Documents/seven.wav'); word = "seven";
                    break;
                case 8: music = new Sound('/home/watch1/Documents/eight.wav'); word = "eight";
                    break;
                case 9: music = new Sound('/home/watch1/Documents/nine.wav'); word = "nine";
                    break;
                case 10: music = new Sound('/home/watch1/Documents/left.wav'); word = "left";
                    break;
                case 11: music = new Sound('/home/watch1/Documents/right.wav'); word = "right";
                    break;
                case 12: music = new Sound('/home/watch1/Documents/up.wav'); word = "up";
                    break;
                case 13: music = new Sound('/home/watch1/Documents/down.wav'); word = "down";
                    break;
                case 14: music = new Sound('/home/watch1/Documents/stop.wav'); word = "stop";
                    break;
                case 15: music = new Sound('/home/watch1/Documents/go.wav'); word = "go";
                    break;
            }
            client.publish('watch1/listen',JSON.stringify({word: word}));
            setTimeout(()=>{
                music.play();
                setTimeout(()=>{
                    music.play();
                },2500);
            },4500);
            // setTimeout(()=>{
            //     music.play();
            // },4000);
            // music.on('complete', function () {
                // file_no++;
                // if (file_no >= 16) {
                //     file_no = 0;
                // }
        }

        // });
    });
    // callback();
    p.start();
    console.log('Started the Interval');
    // setInterval(callback, 27000);
    setTimeout(() => {
        p.stop();
        process.exit();
    }, duration + 5500);
});
client.on('message',function(topic, message){
    if(topic == 'watch1/resume'){
        lock = 0;
    }
});


