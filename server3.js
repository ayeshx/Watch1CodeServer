/*
  ============= Imports and Declarations ==========================================================
*/
var argv = require('minimist')(process.argv.slice(2)); //for parsing command line arguments from testAutomator.js
var mqtt = require('mqtt');      

//driver for cassandraDB         
const cassandra = require('cassandra-driver');

//Wifi interface on your machine
var network_driver = 'wlp3s0f0';

//path to tcconfig profiles for network shaping, edit the json file for each profile to add your target IP 
var tcconfigprofiles = '/home/shams/Watch1CodeServer-master/tcconfigprofiles/';

//path to the pcaps file location with packet captures from tshark
var pcaps = '/home/shams/Watch1CodeServer-master/pcaps/';

var duration = argv.duration;

//Creating new Cassandra Client
const cass_client = new cassandra.Client({
  contactPoints: ['localhost'],
  localDataCenter: 'datacenter1'
});

//Experiment Number, which will create a table with that name
var exp_num = 325;

// ================================== END IMPORTS SECTION ===============================================================



/*
  ===========  Cassandra Table Creation =====================
*/
cass_client.connect(function (err) {
  //   console.log(err);
  cass_client.execute(`CREATE KEYSPACE IF NOT EXISTS watch_analytics WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : 1 };`)
    .then(() => {
      console.log('Here');
      // console.log('Heree');
      cass_client.execute(`CREATE TABLE IF NOT EXISTS watch_analytics.experiment${exp_num}(Network_Profile text, Exp_Name text, episodeID text, timestamp bigint primary key, period int, payload int, Device_ID text, type text, sensor_data int, device_data1 int, device_data2 text, batterylevel double,cpuload double, availablememory double, totalmemory double, roundtriptime int, qos int);`,
        (err, result) => {
          console.log(err, result);
        });

      cass_client.execute(`CREATE TABLE IF NOT EXISTS watch_analytics.powexperiment${exp_num}(Network_Profile text, Exp_Name text, episodeID text, timestamp bigint primary key, period int, payload int, Device_ID text, type text,  qos int, current int);`,
        (err, result) => {
          console.log(err, result);
        });
    });
});

//======================== END CDB SECTION ====================================



// ================================== Begin Yocto SECTION ===============================================================

require('yoctolib-es2017/yocto_api.js');
require('yoctolib-es2017/yocto_current.js');

let dcAmp;
var currentfreq= 1000;

async function Yoctostart()
{
    await YAPI.LogUnhandledPromiseRejections();
    await YAPI.DisableExceptions();

    // Setup the API to use the VirtualHub on local machine
    let errmsg = new YErrorMsg();
    if(await YAPI.RegisterHub('127.0.0.1', errmsg) != YAPI.SUCCESS) {
        console.log('Cannot contact VirtualHub on 127.0.0.1: '+errmsg.msg);
        return;
    }

    // Select specified device, or use first available one
    let serial = process.argv[process.argv.length-1];
    if(serial[8] != '-') {
        // by default use any connected module suitable for the demo
        let anysensor = YCurrent.FirstCurrent();
        if(anysensor) {
            let module = await anysensor.module();
            serial = await module.get_serialNumber();
        } else {
            console.log('No matching sensor connected, check cable !');
            return;
        }
    }
    console.log('Using device '+serial);
    dcAmp = YCurrent.FindCurrent(serial+".current1");

    Yoctorefresh();
}

async function Yoctorefresh()
{
    if (await dcAmp.isOnline()) {
        var current = await dcAmp.get_currentValue();
        //console.log('DC current : '+(current)
            //+ (await dcAmp.get_unit()));
        const query = `INSERT INTO watch_analytics.powexperiment${exp_num} (Network_Profile, episodeID, Exp_Name, timestamp, Device_ID, type, period, payload, qos, current) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [argv.profile, episode, argv.name, new Date().getTime(),'Device4', 'ESP32', argv.frequency, argv.payload, Number(argv.qos),current];
    cass_client.execute(query, params, { prepare: true }, function (err) {
      console.log(err);
      //Inserted in the cluster
    });

    } else {
        console.log('Module not connected');
    }
    setTimeout(Yoctorefresh, currentfreq);
}


// ================================== End Yocto SECTION ===============================================================
/*
  ======================= Error Management ================================
*/

	
var printError = function(error, explicit) {
    console.log(`[${explicit ? 'EXPLICIT' : 'INEXPLICIT'}] ${error.name}: ${error.message}`);
}



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
  console.log("No network shaping done!");
}
catch (err) {
  console.log(err.message);
}
//tconfig

//tshark
// http://nodejs.org/api.html#_child_processes
console.log(`tshark -i any -f "tcp port 3000" -w ${pcaps}` + episode + '.pcap');

//tshark captures packets only on websocket port 3000 and default mqtt port 1883 and writes out to a pcap file
exec(`tshark -i any -f "tcp port 3000" -f "tcp port 1883" -w ${pcaps}` + episode + '.pcap', (err, stdout, stderr) => {
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
  } else if(targetDevice == 'Huawei'){
    client.subscribe('watch3/watchdata');
    client.subscribe('watch3/finaldata');
    client.subscribe('watch3/connect');
  } else if(targetDevice == 'Samsung'){
    client.subscribe('watch1/watchdata');
    client.subscribe('watch1/finaldata');
    client.subscribe('watch1/connect');
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
    console.log('~/tizen-studio/tools/sdb connect ' + argv.samsung);
    console.log('Got here');
    var child = execSync('~/tizen-studio/tools/sdb connect ' + argv.samsung, (err,stdout,stderr)=>{
      if(err){
        exec('~/tizen-studio/tools/sdb connect ' + argv.samsung);
      }
      if(stdout){
        console.log(stdout);
      } 
      if(stderr){
        console.log(stderr);
        exec('~/tizen-studio/tools/sdb connect ' + argv.samsung);
      }
    });
    console.log('Connected');
    execSync('~/tizen-studio/tools/sdb shell launch_app PRsDVBBVB0.HeartRateMonitor', (err,stdout,stderr)=>{
      if(err){
        console.log('Error in launching app!');
      }
    });

    //Send first Mqtt message to tell Samsung to start sending data
    // client.publish('watch1/start', JSON.stringify({frequency:argv.frequency, duration: duration}),{qos:2});
  }

  //if you want to launch app on multiple Samsung watches
  else if (targetDevice == 'all') {
    for (var j = 122; j < 130; j++) {
      console.log('~/tizen-studio/tools/sdb connect 192.168.0.' + j);
      execSync('~/tizen-studio/tools/sdb connect 192.168.0.' + j);
    }
    for (var j = 122; j < 130; j++) {
      execSync('~/tizen-studio/tools/sdb -s 192.168.0.' + j + ':26101 shell launch_app PRsDVBBVB0.HeartRateMonitor');
    }
  } 
  // if target device is Fitbit device we use the fitbit CLI tool to build and launch the app
  else if (targetDevice == 'Fitbit') {
    execSync('cd ../test1; npx fitbit-build; npx fitbit', { stdio: "inherit" });

    //send first MQTT message to tell Fitbit to start sending data
    client.publish('watch2/start',JSON.stringify({frequency:argv.frequency,duration:duration}));
  } 
  //if target device is Android Wear (Huawei) we use Nativescript CLI tool to launch and install the app
  else if (targetDevice == 'Huawei') {
    // execSync(`adb connect ${adb_huawei_addr}`, (err, stdout, stderr) => {
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
    client.publish('ESP32/start',JSON.stringify({frequency:argv.frequency, payload: argv.payload, qos: argv.qos}));
    Yoctostart();

  } 

  else if(targetDevice == 'Apple'){
    client.publish('watch4/start',"start");
  }
});
    //------------------------------- END AUTOMATION SECTION --------------------------------------------------

// ------------------------------- MQTT Data and Save to Cassandra DB ----------------------------------------

client.on('message', function (topic, message) {
  // message is Buffer 
  // First data sent by all devices to which the server sends an ack to calculate roundtrip time on each device
  if(topic == 'watch1/connect'){
    console.log('Samsung Ready Received!');
    client.publish('watch1/start', "Start");
  } else if(topic == 'watch3/connect'){
    console.log('Huawei Ready Received!');
        //Send first MQTT message to Android Wear Nativescript App to tell it start sending data
        client.publish('watch3/start',JSON.stringify({frequency:argv.frequency,duration:duration}));
  }
  else if (topic == 'watch1/watchdata') {
    console.log('Received Samsung data... Replying');
    client.publish('watch1/ack', 'Received your message');
  } else if (topic == 'watch2/watchdata') {
    console.log('Received Fitbit data... Replying');
    client.publish('watch2/ack', 'Received your message');
  } else if (topic == 'watch3/watchdata') {
    console.log('Received Huawei data...Replying');
    client.publish('watch3/ack', 'Received your message');
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
    console.log(`TimeStamp: ${pkg.time} ; Heart Rate: ${pkg.hrm.rate} ; Battery level: ${pkg.battery.level} ; CPU Load: ${pkg.cpuLoad.load} ; Available Mem: ${pkg.av_Mem} ; Total Mem: ${pkg.totalMemory}`);
    const query = `INSERT INTO watch_analytics.experiment${exp_num} (Network_Profile, episodeID, Exp_Name, timestamp, Device_ID, type, sensor_data, batterylevel,cpuload,availablememory,totalmemory, roundtriptime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [argv.profile, episode, argv.name, pkg.time, 'watch1', 'Samsung gear s3', pkg.hrm.rate, pkg.battery.level, pkg.cpuLoad.load, pkg.av_Mem, pkg.totalMemory, pkg.roundtrip_time];
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
    console.log(`TimeStamp: ${pkg.timestamp} ; Heart Rate: ${pkg.heartRate} ; Battery level: ${pkg.battery} ; Available Mem: ${pkg.av_Mem} ; Total Mem: ${pkg.totalMemory}`);
    const query = `INSERT INTO watch_analytics.experiment${exp_num} (Network_Profile, episodeID, Exp_Name, timestamp, Device_ID, type, sensor_data, batterylevel,availablememory,totalmemory, roundtriptime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [argv.profile, episode, argv.name, pkg.timestamp, 'watch2', 'fitbit versa', pkg.heartRate, pkg.battery, pkg.av_Memory, pkg.totalMemory, pkg.roundtrip_time];
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
    var pkg = JSON.parse(message);
    console.log(`TimeStamp: ${pkg.timestamp} ; Heart Rate: ${pkg.heartRate} ; Battery level: ${pkg.battery} ; Available Mem: ${pkg.av_Mem} ; Total Mem: ${pkg.totalMemory}`);
    const query = `INSERT INTO watch_analytics.experiment${exp_num} (Network_Profile, episodeID, Exp_Name, timestamp, Device_ID, type, sensor_data, batterylevel,availablememory,totalmemory, roundtriptime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [argv.profile, episode, argv.name, pkg.timestamp, 'watch3', 'Huawei Watch 2', pkg.heartRate, pkg.battery, pkg.av_Mem, pkg.totalMemory, pkg.roundtrip_time];
    cass_client.execute(query, params, { prepare: true }, function (err) {
      console.log(err);
      //Inserted in the cluster
    });
    setTimeout(function () {
      client.publish("watch3/kill","kill");
      setTimeout(function(){
        process.exit();
      },5000);
    }, duration);
  } else if(topic == 'ESP32/finaldata'){
  	let pkg;
  	try {
    console.log('Roundtrip from ESP32:'+ message);
    pkg = JSON.parse(message);
    console.log(`Episode: ${episode} ; Number: ${pkg.sensor_data} ; Rountrip Time: ${pkg.roundtrip_time} ; Message Size: ${pkg.message.length} Bytes`);
    const query = `INSERT INTO watch_analytics.experiment${exp_num} (Network_Profile, episodeID, Exp_Name, timestamp,sensor_data, Device_ID, type, roundtriptime, period, payload, qos) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`;
    const params = [argv.profile, episode, argv.name, new Date().getTime(), Number(pkg.sensor_data) ,'Device4', 'ESP32',pkg.roundtrip_time, argv.frequency, argv.payload, Number(argv.qos)];
    cass_client.execute(query, params, { prepare: true }, function (err) {
      console.log(err);
      //Inserted in the cluster
    });

    if(pkg.sensor_data == 1){
      console.log('Starting timer');
	  setTimeout(function () {
      console.log('Ending ESP32..');
      if(client.disconnected){
        console.log('Disconnected');
      }
      client.publish('ESP32/kill','njn',{qos:1});
      setTimeout(function(){
        process.exit();
      },10000);
      
    	}, duration);	
	}
}
	catch (e) {
    	if (e instanceof SyntaxError) {
        	printError(e, true);
    	} else {
        printError(e, false);
    }
	}	
	

  } else if(topic == 'watch4/finaldata'){
    console.log('Received data from Apple Watch...');
    var pkg = JSON.parse(message);
    console.log(`X:${pkg.x} ; Y:${pkg.y} ; Z:${pkg.z} ; roundtrip_time:${pkg.roundtrip_time}`);
    const query = `INSERT INTO watch_analytics.experiment${exp_num} (Network_Profile, episodeID, Exp_Name, timestamp,sensor_data,device_data1, Device_ID, type, roundtriptime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [argv.profile, episode, argv.name, new Date().getTime(), Number(pkg.x) , Number(pkg.y) , 'Device5', 'Apple Watch', pkg.roundtrip_time];
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
