var argv = require('minimist')(process.argv.slice(2));
var mqtt = require('mqtt');
const cassandra = require('cassandra-driver');

const cass_client = new cassandra.Client({ 
  contactPoints: ['localhost'],
  localDataCenter: 'datacenter1'
});
var exp_num = 2;

cass_client.connect(function (err) {
//   console.log(err);
  cass_client.execute(`CREATE KEYSPACE IF NOT EXISTS watch_analytics WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : 1 };`)
  .then(() => {
    console.log('Here');
    // console.log('Heree');
    cass_client.execute(`CREATE TABLE IF NOT EXISTS watch_analytics.experiment${exp_num}(timestamp bigint primary key, watch text, type text, heartrate int, batterylevel double,cpuload double, availablememory double, totalmemory double, roundtriptime int );`,
      (err, result) => {
        console.log(err, result);
      });
  });
});

//Network Shaping

//var targetWatch = '192.168.0.121';
var targetWatch = null;
console.dir(argv);
try {
    if (argv.targetWatch != null) {
        targetWatch = argv.targetWatch;
    }
}
catch(err) {}

var isMac = /^darwin/.test(process.platform);

console.log('os is mac?' + isMac);

var d = new Date();
var n = d.getTime();
var episode = argv.episodeId + '-' + n;


//tconfig
const { execSync } = require('child_process');
// stderr is sent to stdout of parent process
// you can set options.stdio if you want it to go elsewhere
try{

var stdout = execSync('sudo tcdel --device wlp2s0 --all'); //reset previous shaping profiles

}
catch(err) {
    console.log(err.message);
}

try{
    if(argv.profile != "Phy-wifi-baseline") { // mention baseline and wifi conditions eg: AC dual wifi baseline, bitrate delay on tshark

        if(isMac){
            var stdout = execSync('sudo pfctl -E');
            stdout = execSync('(cat /etc/pf.conf && echo "dummynet-anchor \\"mop\\"" && echo "anchor \\"mop\\"") | sudo pfctl -f -'); 
            stdout = execSync('echo "dummynet in quick proto tcp from any to any port 3000 pipe 1" | sudo pfctl -a mop -f -');
            if(argv.profile != "2G-DevelopingRural") { // dn -> dummy network traffic shaping for mac
                stdout = execSync('sudo dnctl pipe 1 config bw 20Kbit/s plr 0.02 delay 650');
            }
            else if(argv.profile != "2G-DevelopingUrban"){
                stdout = execSync('sudo dnctl pipe 1 config bw 35Kbit/s delay 650');
            }
            else if(argv.profile != "3G-Average"){
                stdout = execSync('sudo dnctl pipe 1 config bw 780Kbit/s delay 100');
            }
            else if(argv.profile != "3G-Good"){
                stdout = execSync('sudo dnctl pipe 1 config bw 850Kbit/s delay 90');
            }
            else if(argv.profile != "Edge-Average"){
                stdout = execSync('sudo dnctl pipe 1 config bw 400Kbit/s delay 240');
            }
            else if(argv.profile != "Edge-Good"){
                stdout = execSync('sudo dnctl pipe 1 config bw 250Kbit/s delay 350');
            }
            else if(argv.profile != "Edge-Lossy"){
                stdout = execSync('sudo dnctl pipe 1 config bw 240Kbit/s plr 0.01 delay 400');
            }
        }
        else {
            var stdout = execSync('sudo tcset --import-setting /home/watch1/ayesh-server/Watch1CodeServer/tcconfigprofiles/' + argv.profile + '.json');
            stdout = execSync('sudo tcshow --device wlp2s0');
        }
    }
console.log(stdout.toString());
}
catch(err) {
    console.log(err.message);
}
//tconfig

//tshark
// http://nodejs.org/api.html#_child_processes
const { exec } = require('child_process');
console.log('tshark -i any -f "tcp port 3000" -w /home/watch1/ayesh-server/Watch1CodeServer/pcaps/'+ episode + '.pcap');
exec('sudo tshark -i any -f "tcp port 3000" -w /home/watch1/ayesh-server/Watch1CodeServer/pcaps/'+ episode + '.pcap', (err, stdout, stderr) => {
    if (err) {
        console.log(err.message);
        // node couldn't execute the command
        return;
    }
    // the *entire* stdout and stderr (buffered)
    console.log(`stdout: ${stdout}`);
console.log(`stderr: ${stderr}`);
});
//tshark


// my old part

var client  = mqtt.connect('mqtt://localhost:1883')
 
client.on('connect', function () {
  client.subscribe('watch1/watchdata');
  client.subscribe('watch1/finaldata');
  client.subscribe('watch2/finaldata');
  // client.subscribe('watch1/heartdata/cpu');
  // client.subscribe('watch1/heartdata/mem');
});
 
client.on('message', function (topic, message) {
  // message is Buffer 
  if(topic.substring(7) == "watchdata"){
    console.log('Received watch data... Replying');
    client.publish('watch1/ack','Received your message');
  } else if(topic == 'watch1/finaldata') {
    var pkg = JSON.parse(message);
    // if(pkg.battery){
    console.log(`TimeStamp: ${pkg.time} ; Heart Rate: ${pkg.hrm.rate} ; Battery level: ${pkg.battery.level} ; CPU Load: ${pkg.cpuLoad.load} ; Available Mem: ${pkg.av_Mem} ; Total Mem: ${pkg.totalMemory}`);
    const query = `INSERT INTO watch_analytics.experiment${exp_num} (timestamp, watch, type, heartrate, batterylevel,cpuload,availablememory,totalmemory, roundtriptime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [pkg.time, 'watch1', 'Samsung gear s3', pkg.hrm.rate, pkg.battery.level,pkg.cpuLoad.load, pkg.av_Mem, pkg.totalMemory, pkg.roundtrip_time];
    cass_client.execute(query, params, { prepare: true }, function (err) {
      console.log(err);
      //Inserted in the cluster
    });
  }  else if(topic == 'watch2/finaldata'){
    var pkg = JSON.parse(message);
    console.log(`TimeStamp: ${pkg.timestamp} ; Heart Rate: ${pkg.heartRate} ; Battery level: ${pkg.battery} ; Available Mem: ${pkg.av_Mem} ; Total Mem: ${pkg.totalMemory}`);
    const query = `INSERT INTO watch_analytics.experiment${exp_num} (timestamp, watch, type, heartrate, batterylevel,availablememory,totalmemory) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [pkg.timestamp, 'watch2', 'fitbit versa', pkg.heartRate, pkg.battery, pkg.av_Mem, pkg.totalMemory];
    cass_client.execute(query, params, { prepare: true }, function (err) {
      console.log(err);
      //Inserted in the cluster
    });
  }
});

if(targetWatch != "all" && targetWatch != null && targetWatch != 'Fitbit') {
    console.log('~/tizen-studio/tools/sdb connect ' + targetWatch);
    console.log('Got here');
    execSync('~/tizen-studio/tools/sdb connect ' + targetWatch);
    console.log('Connected');
    execSync('~/tizen-studio/tools/sdb shell launch_app PRsDVBBVB0.HeartRateMonitor');
  }
  // else if (targetWatch == null){
  //   break;
  // }
  else if(targetWatch == 'all')
  {
    for (var j = 122; j < 130; j++) {
        console.log('~/tizen-studio/tools/sdb connect 192.168.0.' + j);
        execSync('~/tizen-studio/tools/sdb connect 192.168.0.' + j);
    }
    for (var j = 122; j < 130; j++) {
        execSync('~/tizen-studio/tools/sdb -s 192.168.0.' + j + ':26101 shell launch_app PRsDVBBVB0.HeartRateMonitor');
    }
  } else {
    execSync('cd ../test1; npx fitbit-build; npx fitbit;fitbit$ install');
  }
setTimeout(function(){
    process.exit();
}, 30000);