/*
  ============= Imports and Declarations ==========================================================
*/
var argv = require('minimist')(process.argv.slice(2)); //for parsing command line arguments from testAutomator.js
var mqtt = require('mqtt');      
var adb_huawei_addr = '192.168.1.17';
var init_time = 0;

//driver for cassandraDB         
const cassandra = require('cassandra-driver');

//Wifi interface on your machine
var network_driver = 'wlp2s0';

//path to tcconfig profiles for network shaping, edit the json file for each profile to add your target IP 
var tcconfigprofiles = '/home/watch1/ayesh-server/Watch1CodeServer/tcconfigprofiles/';

//path to the pcaps file location with packet captures from tshark
var pcaps = '/home/watch1/ayesh-server/Watch1CodeServer/pcaps/';

var duration = argv.duration;
var poisson = argv.poisson;
let exp;
var model = argv.model;
var watch = argv.watch;
var effort = Number(argv.frequency) * 60 * 1000 * 0.65;
var pe_or_po = argv.pe_or_po;
var test_type = argv.testtype;
var sensor = argv.sensor;

//Creating new Cassandra Client
const cass_client = new cassandra.Client({
  contactPoints: ['localhost'],
  localDataCenter: 'datacenter1'
});

//Experiment Number, which will create a table with that name
var exp_num = 10;

// ================================== END IMPORTS SECTION ===============================================================

/*
  ===========  Cassandra Table Creation =====================
*/
cass_client.connect(function (err) {
  //   console.log(err);
  if(argv.testtype == 'audio' || argv.testtype == 'c_audio' || test_type == 'text_local' || test_type == 'text_offload'){
    cass_client.execute(`CREATE KEYSPACE IF NOT EXISTS watch_analytics WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : 1 };`)
    .then(() => {
      console.log('Here Audio Test');
      // console.log('Heree');
      cass_client.execute(`CREATE TABLE IF NOT EXISTS watch_analytics.tensorflow${exp_num}(Network_Profile text,Exp_Name text, episodeID text, timestamp bigint primary key, period double, Device_ID text, type text, poisson_frequency double, model int, in_word text, out_word text, prediction_time int, batterylevel double,cpuload double, availablememory double, totalmemory double, exp_type text, period_mode text);`,
        (err, result) => {
          console.log(err, result);
        });
    });
  } else {
    cass_client.execute(`CREATE KEYSPACE IF NOT EXISTS watch_analytics WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : 1 };`)
    .then(() => {
      console.log('Here');
      // console.log('Heree');
      cass_client.execute(`CREATE TABLE IF NOT EXISTS watch_analytics.sensors${exp_num}(Network_Profile text, frequency double, poisson_frequency double, Exp_Name text, episodeID text, timestamp bigint primary key, period int, payload int, Device_ID text, type text, sensor_data double, device_data1 double, device_data2 text, batterylevel double,cpuload double, availablememory double, totalmemory double, roundtriptime int, sensor text, period_mode text, effort int, exp_type text );`,
        (err, result) => {
          console.log(err, result);
        });
    });
  }

});

//======================== END CDB SECTION ====================================

/*
  ======================= Network Shaping ================================
*/

// getting target device from command line parameters sent by testAutomator
var targetDevice = null;
console.dir(argv);
try {
  if (argv.targetDevice != null) {
    targetDevice = argv.targetDevice;
  }
}
catch (err) { }

var isMac = /^darwin/.test(process.platform);

console.log('os is mac?' + isMac);

var d = new Date();
var n = d.getTime();

//creating unique names for pcap files with episode ID and timestamp
var episode = argv.episodeId + '-' + n;


//tconfig
const { execSync, exec, spawn } = require('child_process');
// stderr is sent to stdout of parent process
// you can set options.stdio if you want it to go elsewhere
try {

  var stdout = execSync(`sudo tcdel --device ${network_driver} --all`); //reset previous shaping profiles

}
catch (err) {
  console.log(err.message);
}

try {
  if (argv.profile != "Phy-wifi-baseline") { // mention baseline and wifi conditions eg: AC dual wifi baseline, bitrate delay on tshark

    if (isMac) {
      var stdout = execSync('sudo pfctl -E');
      stdout = execSync('(cat /etc/pf.conf && echo "dummynet-anchor \\"mop\\"" && echo "anchor \\"mop\\"") | sudo pfctl -f -');
      stdout = execSync('echo "dummynet in quick proto tcp from any to any port 3000 pipe 1" | sudo pfctl -a mop -f -');
      if (argv.profile != "2G-DevelopingRural") { // dn -> dummy network traffic shaping for mac
        stdout = execSync('sudo dnctl pipe 1 config bw 20Kbit/s plr 0.02 delay 650');
      }
      else if (argv.profile != "2G-DevelopingUrban") {
        stdout = execSync('sudo dnctl pipe 1 config bw 35Kbit/s delay 650');
      }
      else if (argv.profile != "3G-Average") {
        stdout = execSync('sudo dnctl pipe 1 config bw 780Kbit/s delay 100');
      }
      else if (argv.profile != "3G-Good") {
        stdout = execSync('sudo dnctl pipe 1 config bw 850Kbit/s delay 90');
      }
      else if (argv.profile != "Edge-Average") {
        stdout = execSync('sudo dnctl pipe 1 config bw 400Kbit/s delay 240');
      }
      else if (argv.profile != "Edge-Good") {
        stdout = execSync('sudo dnctl pipe 1 config bw 250Kbit/s delay 350');
      }
      else if (argv.profile != "Edge-Lossy") {
        stdout = execSync('sudo dnctl pipe 1 config bw 240Kbit/s plr 0.01 delay 400');
      }
    }
    else {  //network shaping for non Mac Devices
      // setting profiles from the json file based on the profile from the excel file
      var stdout = execSync(`sudo tcset --import-setting ${tcconfigprofiles}` + argv.profile + '.json');

      //show the network configurations on the wifi driver
      stdout = execSync(`sudo tcshow --device ${network_driver}`);
    }
  }
  console.log(stdout.toString());
}
catch (err) {
  console.log(err.message);
}
//tconfig

//tshark
// http://nodejs.org/api.html#_child_processes
console.log(`tshark -i any -f "tcp port 3000" -w ${pcaps}` + episode + '.pcap');

//tshark captures packets only on websocket port 3000 and default mqtt port 1883 and writes out to a pcap file
exec(`tshark -i any -f "tcp port 3000" -f "tcp port 1883" -f "tcp port 5555" -f "tcp port 52280" -w ${pcaps}` + episode + '.pcap', (err, stdout, stderr) => {
  if (err) {
    console.log(err.message);
    // node couldn't execute the command
    return;
  }
  // the *entire* stdout and stderr (buffered)
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
});
//========================= END NETWORK SHAPING ================================================

/*
  ========================== MQTT Section ======================================================
*/

// connect to local mqtt broker
var client = mqtt.connect('mqtt://localhost:1883');

//all automation tasks will only happen on successful connection to a broker
client.on('connect', function () {

  //check what the target device is and accordingly subscribe to the topics
  if(targetDevice == 'Fitbit'){
    client.subscribe('watch2/watchdata');
    client.subscribe('watch2/finaldata');
    client.subscribe('watch2/connect');
  } else if(targetDevice == 'Huawei'){
    client.subscribe('watch3/watchdata');
    client.subscribe('watch3/finaldata');
    client.subscribe('watch3/connect');
    client.subscribe('watch3/disconnect');
  } else if(targetDevice == 'Samsung'){
    client.subscribe('watch1/watchdata');
    client.subscribe('watch1/finaldata');
    client.subscribe('watch1/connect');
    client.subscribe('watch1/audiodata');
    client.subscribe('watch1/wc_audiodata');
  } else if(targetDevice == 'ESP32'){
    client.subscribe('ESP32/data');
    client.subscribe('ESP32/finaldata');
  } else if(targetDevice == 'Apple'){
    client.subscribe('watch4/watchdata');
    client.subscribe('watch4/finaldata');
  }

  //---------------------- Automation Section (Launch Apps on Different Devices) -----------------------------------

  //Samsung launch app using SDB tool
  if (targetDevice == 'Samsung') {
    console.log('~/tizen-studio1/tools/sdb connect ' + argv.samsung);
    console.log('Got here');
    var child = execSync('~/tizen-studio1/tools/sdb connect ' + argv.samsung, (err,stdout,stderr)=>{
      if(err){
        exec('~/tizen-studio1/tools/sdb connect ' + argv.samsung);
      }
      if(stdout){
        console.log(stdout);
      } 
      if(stderr){
        console.log(stderr);
        exec('~/tizen-studio1/tools/sdb connect ' + argv.samsung);
      }
    });
    console.log('Connected');
    if(test_type == 'audio' && model == 1){
      execSync('~/tizen-studio1/tools/sdb shell launch_app PRsDVBBVB0.HeartRateMonitor', (err,stdout,stderr)=>{
        if(err){
          console.log('Error in launching app!');
        }
      });
    } else if(test_type == 'c_audio' && model == 1){
      console.log('Second Model');
      execSync('~/tizen-studio1/tools/sdb shell launch_app dAQ4l5wJKH.LightSensor', (err,stdout,stderr)=>{
        if(err){
          console.log('Error in launching app!');
        }
      });
    }
     else if(test_type == 'text_local' || test_type == 'text_offload' && model == 2){
      execSync('~/tizen-studio1/tools/sdb shell launch_app I5BOVQ4uA1.HeartRateMonitor3', (err,stdout,stderr)=>{
        if(err){
          console.log('Error in launching app!');
        }
      });
     }
     else if(test_type == 'sensor_local' || test_type == 'sensor_offload'){ 
      execSync('~/tizen-studio1/tools/sdb shell launch_app k22dl1qHKb.HeartRateMonitor4', (err,stdout,stderr)=>{
        if(err){
          console.log('Error in launching app!');
        }
      });
     } 


    //Send first Mqtt message to tell Samsung to start sending data
    // client.publish('watch1/start', JSON.stringify({frequency:argv.frequency, duration: duration}),{qos:2});
  }

  //if you want to launch app on multiple Samsung watches
  else if (targetDevice == 'all') {
    for (var j = 122; j < 130; j++) {
      console.log('~/tizen-studio1/tools/sdb connect 192.168.0.' + j);
      execSync('~/tizen-studio1/tools/sdb connect 192.168.0.' + j);
    }
    for (var j = 122; j < 130; j++) {
      execSync('~/tizen-studio1/tools/sdb -s 192.168.0.' + j + ':26101 shell launch_app PRsDVBBVB0.HeartRateMonitor');
    }
  } 
  // if target device is Fitbit device we use the fitbit CLI tool to build and launch the app
  else if (targetDevice == 'Fitbit') {
    var child = exec("cd ../test1; npx fitbit-build; printf 'install' | npx fitbit");

    child.stdout.on('data', (data) => {
      console.log(data);
    });
  } 
  //if target device is Android Wear (Huawei) we use Nativescript CLI tool to launch and install the app
  else if (targetDevice == 'Huawei') {
    // execSync(`adb connect ${adb_huawei_addr}:5555`, (err, stdout, stderr) => {
    //   if (err) {
    //     console.log(err);
    //     execSync(`adb connect ${adb_huawei_addr}`);
    //     var child = exec('tns run android', { cwd: '../test2huawei' }, (err, stdout, stderr) => {
    //       if (err) {
    //         console.log(err);
    //       }
    //       if (stdout) { console.log(stdout); }
    //       if (stderr) { console.log(stderr); }
    //     });
    //     child.stdout.on('data', (data) => {
    //       console.log(data);
    //     });
    //   }
    //   if (stdout) { console.log(stdout); }
    //   if (stderr) { console.log(stderr); }
    // });
    var child = exec('tns run android', { cwd: '../test2huawei' }, (err, stdout, stderr) => {
      if (err) {
        console.log('Err' + err);
      }
      if (stdout) { console.log(stdout); }
      if (stderr) { console.log('STD ERR' + stderr); }
    });
    child.stdout.on('data', (data) => {
      console.log(data);
    });


  } 
  //If device is ESP32 just send MQTT message to tell it to start sending data
  else if(targetDevice == 'ESP32'){
    client.publish('ESP32/start',JSON.stringify({frequency:argv.frequency, payload: argv.payload}));
  } 

  else if(targetDevice == 'Apple'){
    client.publish('watch4/start',"start");
  }
});
    //------------------------------- END AUTOMATION SECTION --------------------------------------------------

// ------------------------------- MQTT Data and Save to Cassandra DB ----------------------------------------
var count_msg = 0;
var timestamp = 0;
client.on('message', function (topic, message) {
  // message is Buffer 
  if(topic == 'watch3/disconnect'){
    console.log('Got Huawei Disconnect message, Reconnecting/Restarting...');
    var child = exec('tns run android', { cwd: '../test2huawei' }, (err, stdout, stderr) => {
      if (err) {
        console.log('Err' + err);
      }
      if (stdout) { console.log(stdout); }
      if (stderr) { console.log('STD ERR' + stderr); }
    });
    child.stdout.on('data', (data) => {
      console.log(data);
    });
  }
  // First data sent by all devices to which the server sends an ack to calculate roundtrip time on each device
  if(topic == 'watch1/connect'){
    console.log('Samsung Ready Received!');
    client.publish('watch1/start', JSON.stringify({ poisson: Number(poisson), test_type: argv.testtype, frequency: argv.frequency, duration: duration, pe_or_po: pe_or_po, effort: Number(effort) }));
    if(argv.testtype == 'audio'){
      exp = 'local';
      exec(`node ~/ayesh-server/Watch1CodeServer/testAudio.js --duration ${duration} --poisson ${poisson} --model ${model}`);
    } else if(argv.testtype == 'c_audio'){
      exp = 'offload';
      exec(`node ~/ayesh-server/Watch1CodeServer/testAudio2.js --duration ${duration} --poisson ${poisson} --model ${model}`);
    }
  } else if(topic == 'watch3/connect'){
    console.log('Huawei Ready Received!');

    //Send first MQTT message to Android Wear Nativescript App to tell it start sending data
    client.publish('watch3/start', JSON.stringify({ test_type: argv.testtype, frequency: argv.frequency, duration: duration }));
  } else if(topic == 'watch2/connect'){
    console.log('Fitbit Ready Received!');
    //send first MQTT message to tell Fitbit to start sending data
    client.publish('watch2/start', JSON.stringify({ test_type: argv.testtype, frequency: argv.frequency, duration: duration }));
  }
  else if(topic == 'watch1/audiodata'){
    var pkg = JSON.parse(message);
    // if(pkg.battery){
    console.log(`TimeStamp: ${new Date().getTime()} ; IN_Word: ${pkg.input_word} ; OUT_Word: ${pkg.output_word} ; Predic Time: ${pkg.predic_time} ; Battery level: ${pkg.battery.level} ; CPU Load: ${pkg.cpuLoad.load} ; Available Mem: ${pkg.av_Mem} ; Total Mem: ${pkg.totalMemory}`);
    const query = `INSERT INTO watch_analytics.tensorflow${exp_num} (Network_Profile,episodeID, Exp_Name, timestamp, Device_ID, type, poisson_frequency, model, in_word, out_word, prediction_time, batterylevel,cpuload,availablememory,totalmemory, exp_type, period_mode, period) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [argv.profile, episode, argv.name, new Date().getTime(), 'watch1', 'Samsung galaxy watch', Number(poisson), Number(model), pkg.input_word, pkg.output_word, pkg.predic_time, pkg.battery.level, pkg.cpuLoad.load, pkg.av_Mem, pkg.totalMemory, test_type, pe_or_po, argv.frequency];
    cass_client.execute(query, params, { prepare: true }, function (err) {
      console.log(err);
      //Inserted in the cluster
    });
    setTimeout(function () {
      //Send Kill Message to Stop the App on Samsung
      client.publish('watch1/kill',"kill");

      //Give a delay to allow the kill message to reach
      setTimeout(function(){
        //Exit this server process to read next row in the excel file from testAutomator.js
        process.exit();
      },5000);
    }, duration); //duration is how long we want the test for a device to run (this process)
  }
  else if (topic == 'watch1/watchdata') {
    if(count_msg == 0){
      init_time = new Date();
      count_msg ++;
    }
    var pkg = JSON.parse(message);
    timestamp = pkg.time;
    console.log('Received Samsung data... Replying');
    client.publish('watch1/ack', 'Received your message');
  } else if (topic == 'watch2/watchdata') {
    console.log('Received Fitbit data... Replying');
    client.publish('watch2/ack', 'Received your message');
  } else if (topic == 'watch3/watchdata') {
var pkg = JSON.parse(message);
    console.log('Received Huawei data...Replying');
    console.log(`TimeStamp: ${pkg.timestamp} ; Heart Rate: ${pkg.heartRate} ; Battery level: ${pkg.battery} ; Available Mem: ${pkg.av_Mem} ; Total Mem: ${pkg.totalMemory}`);
    client.publish('watch3/ack', 'Received your message', {qos:2,properties:{messageExpiryInterval:0.5}});
  } else if(topic == 'ESP32/data'){
    console.log('Received ESP32 data... Replying');
    client.publish('ESP32/ack','Received your message');  
  } else if(topic == "watch4/watchdata"){
    console.log("Received Apple data... Replying");
    client.publish('watch4/ack','ack');
  }
  // Second data sent by all devices with round trip time field (Final Data Package) which we save to Cassandra DB
  else if (topic == 'watch1/finaldata') { //Samsung Final Data
    var pkg = JSON.parse(message);
    // if(pkg.battery){
    console.log(`TimeStamp: ${pkg.time} ; Heart Rate: ${pkg.hrm} ; Battery level: ${pkg.battery.level} ; CPU Load: ${pkg.cpuLoad.load} ; Available Mem: ${pkg.av_Mem} ; Total Mem: ${pkg.totalMemory}`);
    const query = `INSERT INTO watch_analytics.sensors${exp_num} (Network_Profile, frequency, episodeID, Exp_Name, timestamp, Device_ID, sensor_data, sensor, batterylevel,cpuload,availablememory,totalmemory, roundtriptime, period_mode, effort, exp_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [argv.profile, argv.frequency, episode, argv.name, pkg.time, watch, pkg.hrm, sensor, pkg.battery.level, pkg.cpuLoad.load, pkg.av_Mem, pkg.totalMemory, pkg.roundtrip_time, pe_or_po, Number(effort), test_type];
    cass_client.execute(query, params, { prepare: true }, function (err) {
      console.log(err);
      //Inserted in the cluster
    });
    setTimeout(function () {
      //Send Kill Message to Stop the App on Samsung
      client.publish('watch1/kill',"kill");

      //Give a delay to allow the kill message to reach
      setTimeout(function(){
        //Exit this server process to read next row in the excel file from testAutomator.js
        process.exit();
      },5000);
    }, duration); //duration is how long we want the test for a device to run (this process)
  } else if (topic == 'watch2/finaldata') { //FItbit final data
    var pkg = JSON.parse(message);
    console.log(pkg.accel);
    // var acc = JSON.parse(pkg.accel);
    console.log("X: " +pkg.accel.x);
    console.log(`TimeStamp: ${pkg.timestamp} ; Accel X: ${pkg.accel.x} ; Accel Y: ${pkg.accel.y} ; Battery level: ${pkg.battery} ; Available Mem: ${pkg.av_Mem} ; Total Mem: ${pkg.totalMemory}`);
    const query = `INSERT INTO watch_analytics.experiment${exp_num} (Network_Profile, frequency, episodeID, Exp_Name, timestamp, Device_ID, type, sensor_data, device_data1, device_data2, batterylevel,availablememory,totalmemory, roundtriptime, sensor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    // const params = [argv.profile, argv.frequency, episode, argv.name, pkg.timestamp, 'watch2', 'fitbit versa', pkg.accel.x, pkg.accel.y,String(pkg.accel.z), pkg.battery, pkg.av_Memory, pkg.totalMemory, pkg.roundtrip_time, sensor];
    const params = [argv.profile, argv.frequency, episode, argv.name, new Date().getTime(), 'watch2', 'fitbit versa', pkg.accel.x, pkg.accel.y,String(pkg.accel.z), pkg.battery, pkg.av_Memory, pkg.totalMemory, pkg.roundtrip_time, sensor];
    cass_client.execute(query, params, { prepare: true }, function (err) {
      console.log(err);
      //Inserted in the cluster
    });
    setTimeout(function () {
      //Send Kill Message to Stop the App on Fitbit
      client.publish('watch2/kill',"kill");

      //Give a delay to allow the kill message to reach
      setTimeout(function(){
        //Exit this server process to read next row in the excel file from testAutomator.js
        process.exit();
      },5000);
    }, duration); //duration is how long we want the test for a device to run (this process)
  } else if (topic == 'watch3/finaldata') { //If 
    if(count_msg == 0){
      init_time = new Date();
      count_msg ++;
    }
    var pkg = JSON.parse(message);
    // console.log(`TimeStamp: ${new Date().getTime()} ; Heart Rate: ${pkg.heartRate} ; Battery level: ${pkg.battery} ; Available Mem: ${pkg.av_Mem} ; Total Mem: ${pkg.totalMemory}`);
    const query = `INSERT INTO watch_analytics.experiment${exp_num} (Network_Profile, frequency, episodeID, Exp_Name, timestamp, Device_ID, type, sensor, sensor_data, batterylevel,availablememory,totalmemory, roundtriptime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    // const params = [argv.profile, argv.frequency, episode, argv.name, pkg.timestamp, 'watch3', 'Huawei Watch 2', Number(pkg.heartRate), pkg.battery, pkg.av_Mem, pkg.totalMemory, pkg.roundtrip_time];
    const params = [argv.profile, argv.frequency, episode, argv.name, new Date().getTime(), 'watch3', 'Huawei Watch 2', sensor, Number(pkg.heartRate), pkg.battery, pkg.av_Mem, pkg.totalMemory, pkg.roundtrip_time];
    cass_client.execute(query, params, { prepare: true }, function (err) {
      console.log(err);
      //Inserted in the cluster
    });
    setTimeout(function () {
      client.publish("watch3/kill","kill");
      setTimeout(function(){
        var final_time = new Date() - init_time;
        console.log('No. of messages should be: ' + final_time/argv.frequency);
        process.exit();
      },5000);
    }, duration);
  } else if(topic == 'ESP32/finaldata'){
    console.log('Roundtrip from ESP32:'+message);
    var pkg = JSON.parse(message);
    console.log(`Text: ${pkg.text} ; Rountrip Time: ${pkg.roundtrip_time}`);
    const query = `INSERT INTO watch_analytics.experiment${exp_num} (Network_Profile, episodeID, Exp_Name, timestamp,sensor_data, Device_ID, type, roundtriptime, period, payload) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [argv.profile, episode, argv.name, new Date().getTime(), Number(pkg.sensor_data) ,'Device4', 'ESP32',pkg.roundtrip_time, argv.frequency, argv.payload];
    cass_client.execute(query, params, { prepare: true }, function (err) {
      console.log(err);
      //Inserted in the cluster
    });
    setTimeout(function () {
      console.log('Ending ESP32..');
      if(client.disconnected){
        console.log('Disconnected');
      }
      client.publish('ESP32/kill','njn',{qos:1});
      setTimeout(function(){
        process.exit();
      },5000);
      
    }, duration);
  } else if(topic == 'watch4/finaldata'){
    console.log('Received data from Apple Watch...');
    var pkg = JSON.parse(message);
    console.log(`battery: ${pkg.battery} ; X:${pkg.x} ; Y:${pkg.y} ; Z:${pkg.z} ; roundtrip_time:${pkg.roundtrip_time}`);
    const query = `INSERT INTO watch_analytics.experiment${exp_num} (Network_Profile,frequency, episodeID, Exp_Name, timestamp, batterylevel, sensor_data,device_data1,device_data2, Device_ID, type, roundtriptime) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)`;
    const params = [argv.profile, argv.frequency, episode, argv.name, new Date().getTime(), Number(pkg.battery), Number(pkg.x) , Number(pkg.y) , pkg.z, 'Device5', 'Apple Watch', pkg.roundtrip_time];
    cass_client.execute(query, params, { prepare: true }, function (err) {
      console.log(err);
      // Inserted in the cluster
    });
    setTimeout(function () {
      console.log('Ending Apple..');
      if(client.disconnected){
        console.log('Disconnected');
      }
      client.publish('watch4/kill','kill',{qos:1});
      setTimeout(function(){
        process.exit();
      },5000);
      
    }, duration);
  }
});

// ================================= END MQTT SECTION ==========================================
