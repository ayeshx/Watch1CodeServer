var Excel = require('exceljs');

var pcap2csv = require('./index');
var startFrom = 1;
var targetWatch = '192.168.0.111';
var isMac = /^darwin/.test(process.platform);
const { execSync } = require('child_process');
const server_file = '~/ayesh-server/Watch1CodeServer/server.js';
const pcaps = '/home/watch1/ayesh-server/Watch1CodeServer/pcaps/';
try{
execSync('killall tshark');
}
catch (err){
    console.log(err.message)
}

var workbook = new Excel.Workbook();
workbook.xlsx.readFile('./Examples.xlsx')
    .then(function() {
        var worksheet = workbook.getWorksheet('Sheet1');
        worksheet.eachRow({ includeEmpty: false }, function(row, rowNumber) {
            if(rowNumber > startFrom){
            console.log("Row " + rowNumber + " = " + JSON.stringify(row.values[2]) + ','+ JSON.stringify(row.values[4]) + ','  + JSON.stringify(row.values[6]) + ',' + JSON.stringify(row.values[8]));
            if(row.values[7] == '2'){
                targetWatch = 'Fitbit';
            }
            if(row.values[7] == '3'){
                targetWatch = 'Huawei';
            }
            require('child_process').execSync(`node ${server_file} --episodeId ` + row.values[2]+ ' --mode ' + JSON.stringify(row.values[4]) + ' --frequency ' + JSON.stringify(row.values[6]) + ' --profile ' + JSON.stringify(row.values[8])  + ' --targetWatch ' + targetWatch, {stdio:[0,1,2]});
            console.log('DONNEEEEEE WITH A ROWW');
            // execSync('killall tshark');
            if(isMac){
                var stdout = execSync('sudo pfctl -f /etc/pf.conf');
                var stdout = execSync('sudo pfctl -d');
                var stdout = execSync('sudo dnctl -q flush');
            }
            }
        });
        pcap2csv(`${pcaps}`,'tcp');
    });

