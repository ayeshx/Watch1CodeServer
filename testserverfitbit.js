var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://localhost:1883');
const { execSync } = require('child_process');
var mess = "";
 
client.on('connect', function () {
  client.subscribe('watch2/finaldata');
  console.log('Server connected to broker..');
  execSync('cd ../test1; npx fitbit-build; npx fitbit', { stdio: 'inherit' });
  console.log('Done with ' + mess);
});
 
client.on('message', function (topic, message) {
  console.log(message.toString());
  mess = message.toString();
});

// execSync('npx fitbit');
// execSync('build');
// execSync('install');

