var Sound = require('node-aplay');
var mqtt = require('mqtt');
var poissonProcess = require('poisson-process');
var argv = require('minimist')(process.argv.slice(2));

var duration = argv.duration;
var file_no = 0, lock = 0;
let music, word;
var poisson = Number(argv.poisson) * 60000;

var client = mqtt.connect('mqtt://localhost:1883');
client.on('connect', function () {
    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }
    client.subscribe('watch1/readytolisten');
    client.subscribe('poisson/done');
    var p = poissonProcess.create(poisson, function callback() {
        if(lock == 0){
            file_no = getRandomInt(16);
            lock = 1;
            switch (file_no) {
                case 0: music = new Sound('/home/watch1/Documents/zero.wav'); word = "zero";
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
        }

        // setTimeout(()=>{
        //     music.play();
        // },2100);
        // setTimeout(()=>{
        //     music.play();
        // },4000);
        // music.on('complete', function () {
            // file_no++;
            // if (file_no >= 16) {
            //     file_no = 0;
            // }
        // });
    });
    // callback();
    p.start();
});
client.on('message', function (topic, message) {
    if(topic == 'poisson/done'){
        lock = 0;
        console.log('Can start again');
    }
    else if (topic == 'watch1/readytolisten') {
        console.log(message);
        // let music;
        // switch (file_no) {
        //     case 7: music = new Sound('/home/watch1/Documents/six.wav');
        //         break;
        //     case 8: music = new Sound('/home/watch1/Documents/seven.wav');
        //         break;
        //     case 9: music = new Sound('/home/watch1/Documents/eight.wav');
        //         break;
        //     case 10: music = new Sound('/home/watch1/Documents/nine.wav');
        //         break;
        //     case 11: music = new Sound('/home/watch1/Documents/one.wav');
        //         break;
        //     case 12: music = new Sound('/home/watch1/Documents/two.wav');
        //         break;
        //     case 13: music = new Sound('/home/watch1/Documents/three.wav');
        //         break;
        //     case 14: music = new Sound('/home/watch1/Documents/four.wav');
        //         break;
        //     case 15: music = new Sound('/home/watch1/Documents/five.wav');
        //         break;
        //     case 4: music = new Sound('/home/watch1/Documents/left.wav');
        //         break;
        //     case 5: music = new Sound('/home/watch1/Documents/right.wav');
        //         break;
        //     case 6: music = new Sound('/home/watch1/Documents/up.wav');
        //         break;
        //     case 0: music = new Sound('/home/watch1/Documents/down.wav');
        //         break;
        //     case 1: music = new Sound('/home/watch1/Documents/stop.wav');
        //         break;
        //     case 2: music = new Sound('/home/watch1/Documents/go.wav');
        //         break;
        //     case 3: music = new Sound('/home/watch1/Documents/zero.wav');
        //     break;
        // }
        music.play();
        setTimeout(()=>{
            music.play();
        },4000);
        // music.on('complete', function () {
            // file_no++;
            // if (file_no >= 16) {
            //     file_no = 0;
            // }
        // });
    }
});

setTimeout(() => {
    process.exit();
}, duration + 5500);
