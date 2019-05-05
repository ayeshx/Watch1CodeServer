var pcap2csv = require('pcap2csv');
pcap2csv('/home/watch1/ayesh-server/Watch1CodeServer/pcaps','tcp'); //change "tcp" to "udp" if needed
console.log('Done');