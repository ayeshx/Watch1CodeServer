// Notice there is no 'import' statement. 'tf' is available on the index-page
// because of the script tag above.

// Define a model for linear regression.
const model = tf.sequential();
model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
///model.summary();

// Prepare the model for training: Specify the loss and the optimizer.
model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });

// Generate some synthetic data for training.
var time = new Date();
console.log(time);
const xs = tf.tensor2d([1, 2, 3, 4], [4, 1]);
const ys = tf.tensor2d([1, 3, 5, 7], [4, 1]);

// Train the model using the data.
model.fit(xs, ys, { epochs: 250 }).then(() => {
    // Use the model to do inference on a data point the model hasn't seen before:
    // Open the browser devtools to see the output
    var final = new Date() - time;
    alert('Prediction1 ' + model.predict(tf.tensor2d([1], [1, 1])).toString());
    new Promise((resolve, reject) => {
        resolve(model.save('localstorage://my-model'));
    }).then((saved) => {
        console.log('First promise resolved');
        console.log(saved);
        new Promise((resolve, reject) => {
            resolve(tf.loadLayersModel('http://192.168.0.136:4580/model.json'));
        }).then((loadedModel) => {
            console.log('Second promise resolved');
            console.log(loadedModel);
            alert('Model has been loaded');
            alert('Prediction2 ' + loadedModel.predict(tf.tensor2d([1], [1, 1])).toString());
            //loadedModel.predict(tf.tensor2d([1], [1, 1])).print();
            //loadedModel.summary();
        });

    });


    console.log(final);
});