var pcap2csv = require('pcap2csv');
var fs = require('fs');
var csv = require('fast-csv');
var w1 = '';
var w2 = '';

// pcap2csv('/home/watch1/ayesh-server/Watch1CodeServer/pcaps','tcp'); //change "tcp" to "udp" if needed

var stream = fs.createReadStream("/home/watch1/ayesh-server/Watch1CodeServer/pcaps/throughput.csv");

var ws = fs.createWriteStream("/home/watch1/ayesh-server/Watch1CodeServer/pcaps/final.csv");

var fullw1 = '';
var fullw2 = '';
var fullw3 = '';
var w1_A2B_avg = 0;
var w1_B2A_avg = 0;
var w2_A2B_avg = 0;
var w2_B2A_avg = 0;
var w3_A2B_avg = 0;
var w3_B2A_avg = 0;
var w1_count = 0;
var w2_count = 0;
var w3_count = 0;
csv
 .fromStream(stream, {headers : true})
 .on("data", function(data){
     if(w1_count == 0){
        console.log('true');
        w1_count ++;
        fullw1 = data.A;
        w1_A2B_avg += Number(data['AtoB (bit/s)']);
        w1_B2A_avg += Number(data['BtoA (bit/s)']);
        w1 = data.A.split(':')[0];
     }    
     else if(data.A.split(":")[0] == w1){
         console.log('true2');
         w1_A2B_avg += Number(data['AtoB (bit/s)']);
         w1_B2A_avg += Number(data['BtoA (bit/s)']);
         w1_count ++;
     } else if(w2_count == 0) {
         w2_count ++;
         w2 = data.A.split(':')[0];
        console.log('False');
        fullw2 = data.A;
        w2_A2B_avg += Number(data['AtoB (bit/s)']);
        w2_B2A_avg += Number(data['BtoA (bit/s)']);
     }   else if(data.A.split(':')[0] == w2){
        console.log('False');
        w2_A2B_avg += Number(data['AtoB (bit/s)']);
        w2_B2A_avg += Number(data['BtoA (bit/s)']);
        w2_count ++;
     }   else {
        fullw3 = data.A;
        w3_A2B_avg += Number(data['AtoB (bit/s)']);
        w3_B2A_avg += Number(data['BtoA (bit/s)']);
        w3_count ++;
     }
 })
 .on("end", function(){
     console.log("done");
     console.log(w1_count);
     console.log(w2_count);
     console.log(fullw1 + ":"+fullw2);
     console.log(w2_A2B_avg/w2_count);
     console.log(w2_B2A_avg/w2_count);
     csv.write([
         {A:fullw1, B:'192.168.0.110', 'AtoB (bits/s)': w1_A2B_avg/w1_count, 'BtoA (bit/s)':w1_B2A_avg/w1_count},
     ],{headers:true}).pipe(ws).on('finish',()=>{
         console.log('Finished final csv File..');
     })
 });


