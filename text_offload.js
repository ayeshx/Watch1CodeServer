//require('@tensorflow/tfjs-node');
const toxicity = require('@tensorflow-models/toxicity');
var mqtt = require('mqtt');
var input_word, output_word, model;

var client = mqtt.connect('mqtt://localhost:1883');
client.on('connect', function () {
    const threshold = 0.9;

    toxicity.load(threshold).then(modell => {

        model = modell;
        console.log('Model Loaded');
        client.subscribe('watch1/textdata');
    });

});

client.on('message', function (topic, message) {
    if (topic == 'watch1/textdata') {
        var msg = JSON.parse(message);
        console.log(msg.input_word);
        input_word = msg.input_word;
        model.classify(input_word).then(predictions => {
            for (var i = 0; i < predictions.length; i++) {
                if (predictions[i].results[0].match == true) {
                    output_word = predictions[i].label;
                    break;
                }
            }
            client.publish('textdata/inferred', JSON.stringify({ output_word: output_word }), { qos: 2 });
            console.log('Inferred data sent back');
        });

    }
});
