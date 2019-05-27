'use strict';

const fs = require('fs');
var new_ip = '192.168.1.5';

//2G-Rural
let rawdata = fs.readFileSync('./tcconfigprofiles/2G-DevelopingRural.json');  
let student = JSON.parse(rawdata);  
student.wlp2s0.outgoing['dst-network='+new_ip+'/32, protocol=ip'] = {
    "delay": "650ms", 
    "rate": "20K", 
    "loss": "2",
    "filter_id": "800::800"
};
student.wlp2s0.incoming['dst-network='+new_ip+'/32, protocol=ip'] = {
    "delay": "650ms", 
    "rate": "18K",
    "loss": "2", 
    "filter_id": "800::800"
};
let data = JSON.stringify(student,null,4);  
fs.writeFileSync('./tcconfigprofiles/2G-DevelopingRural.json', data);  

//2G-Urban
let rawdata2 = fs.readFileSync('./tcconfigprofiles/2G-DevelopingUrban.json');  
let student2 = JSON.parse(rawdata2);  
student2.wlp2s0.outgoing['dst-network='+new_ip+'/32, protocol=ip'] = {
    "delay": "650ms", 
    "rate": "35K", 
    "filter_id": "800::800"
};
student2.wlp2s0.incoming['dst-network='+new_ip+'/32, protocol=ip'] = {
    "delay": "650ms", 
    "rate": "32K",
    "filter_id": "800::800"
};
let data2 = JSON.stringify(student2,null,4);  
fs.writeFileSync('./tcconfigprofiles/2G-DevelopingUrban.json', data2); 

//3G-Good
let rawdata3 = fs.readFileSync('./tcconfigprofiles/3G-Good.json');  
let student3 = JSON.parse(rawdata3);  
student3.wlp2s0.outgoing['dst-network='+new_ip+'/32, protocol=ip'] = {
    "delay": "90ms", 
    "rate": "850K", 
    "filter_id": "800::800"
};
student3.wlp2s0.incoming['dst-network='+new_ip+'/32, protocol=ip'] = {
    "delay": "100ms", 
    "rate": "420K",
    "filter_id": "800::800"
};
let data3 = JSON.stringify(student3,null,4);  
fs.writeFileSync('./tcconfigprofiles/3G-Good.json', data3); 

//3G-Average
let rawdata4 = fs.readFileSync('./tcconfigprofiles/3G-Average.json');  
let student4 = JSON.parse(rawdata4);  
student4.wlp2s0.outgoing['dst-network='+new_ip+'/32, protocol=ip'] = {
    "delay": "100ms", 
    "rate": "780K", 
    "filter_id": "800::800"
};
student4.wlp2s0.incoming['dst-network='+new_ip+'/32, protocol=ip'] = {
    "delay": "100ms", 
    "rate": "330K",
    "filter_id": "800::800"
};
let data4 = JSON.stringify(student4,null,4);  
fs.writeFileSync('./tcconfigprofiles/3G-Average.json', data4); 

//Edge-Average
let rawdata5 = fs.readFileSync('./tcconfigprofiles/Edge-Average.json');  
let student5 = JSON.parse(rawdata5);  
student5.wlp2s0.outgoing['dst-network='+new_ip+'/32, protocol=ip'] = {
    "delay": "400ms", 
    "rate": "240K", 
    "filter_id": "800::800"
};
student5.wlp2s0.incoming['dst-network='+new_ip+'/32, protocol=ip'] = {
    "delay": "440ms", 
    "rate": "200K",
    "filter_id": "800::800"
};
let data5 = JSON.stringify(student5,null,4);  
fs.writeFileSync('./tcconfigprofiles/Edge-Average.json', data5); 

//Edge-Good
let rawdata6 = fs.readFileSync('./tcconfigprofiles/Edge-Good.json');  
let student6 = JSON.parse(rawdata6);  
student6.wlp2s0.outgoing['dst-network='+new_ip+'/32, protocol=ip'] = {
    "delay": "350ms", 
    "rate": "250K", 
    "filter_id": "800::800"
};
student6.wlp2s0.incoming['dst-network='+new_ip+'/32, protocol=ip'] = {
    "delay": "370ms", 
    "rate": "200K",
    "filter_id": "800::800"
};
let data6 = JSON.stringify(student6,null,4);  
fs.writeFileSync('./tcconfigprofiles/Edge-Good.json', data6); 

//Edge-Lossy
let rawdata7 = fs.readFileSync('./tcconfigprofiles/Edge-Lossy.json');  
let student7 = JSON.parse(rawdata7);  
student7.wlp2s0.outgoing['dst-network='+new_ip+'/32, protocol=ip'] = {
    "delay": "400ms", 
    "rate": "240K",
    "loss": "1",
    "filter_id": "800::800"
};
student7.wlp2s0.incoming['dst-network='+new_ip+'/32, protocol=ip'] = {
    "delay": "440ms", 
    "rate": "200K",
    "loss": "1",
    "filter_id": "800::800"
};
let data7 = JSON.stringify(student7,null,4);  
fs.writeFileSync('./tcconfigprofiles/Edge-Lossy.json', data7); 