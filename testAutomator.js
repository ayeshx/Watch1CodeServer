/*
    ======================= Imports and Declarations ===============================================
*/

var Excel = require('exceljs');
var pcap2csv = require('./index'); //requiring local index.js file from pcap2csv module
var startFrom = 1;                 // Start from  
var targetDevice = '';
const samsung_ip = '192.168.1.102'; // Samsung Device IP addr
var isMac = /^darwin/.test(process.platform);
const { execSync } = require('child_process');
const server_file = '~/ayesh-server/Watch1CodeServer/server.js'; //Change to location of server.js in your machine
const pcaps = '/home/watch1/ayesh-server/Watch1CodeServer/pcaps/';  //Change to location of pcaps in your machine
var exp_name = ''; //Change exp_name to whatever you want

//=============================== END SECTION =======================================================

try{
execSync('killall tshark');
}
catch (err){
    console.log(err.message)
}

/*
    ================================= Automation Section ==========================================================
*/

//Opening a new Excel workbook 
var workbook = new Excel.Workbook();
workbook.xlsx.readFile('./Examples.xlsx')   //Opening Examples.xlsx file to read experiment conditions
    .then(function() {
        var worksheet = workbook.getWorksheet('Sheet1');
        worksheet.eachRow({ includeEmpty: false }, function(row, rowNumber) {
            if(rowNumber > startFrom){
            console.log("Row " + rowNumber + " = " + JSON.stringify(row.values[2]) + ','+ JSON.stringify(row.values[4]) + ','  + JSON.stringify(row.values[6]) + ',' + JSON.stringify(row.values[8]));
            if(row.values[4] == '2'){       //Checking each row for which device is needed
                targetDevice = 'Fitbit';
            }
            if(row.values[4] == '4'){
                targetDevice = 'ESP32';
            }
            if(row.values[4] == '3'){
                targetDevice = 'Huawei';
            }
            if(row.values[4] == '1'){
                targetDevice = 'Samsung';
            }
            if(row.values[4] == '5'){
                targetDevice = 'Apple';
            }
            exp_name = row.values[3];
            // *************************** STARTING server.js for each row in the file (each episode) ******************************************
            // equivalent to doing it individually in the cmd line as node server.js arg1 arg2 arg3 ........
            require('child_process').execSync(`node ${server_file} --episodeId ` + row.values[2]+ ' --frequency ' + JSON.stringify(row.values[8]) + ' --profile ' + JSON.stringify(row.values[5])  + ' --targetDevice ' + targetDevice + ' --name ' + exp_name + ' --samsung ' + samsung_ip + ' --duration ' + row.values[6] + ' --payload ' + row.values[7] + ' --testtype ' + row.values[9], {stdio:[0,1,2]});
            console.log('DONNEEEEEE WITH A ROWW');  //done with one row
            // execSync('killall tshark');
            if(isMac){
                var stdout = execSync('sudo pfctl -f /etc/pf.conf');
                var stdout = execSync('sudo pfctl -d');
                var stdout = execSync('sudo dnctl -q flush');
            }
            }
            setTimeout(()=>{
                console.log('Delay 10 seconds');
            },10000);
        });
        //end of experiment convert all pcap files to csv to get throughput.csv
        pcap2csv(`${pcaps}`,'tcp');
    });

