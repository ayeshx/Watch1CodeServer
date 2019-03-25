var fs = require('fs');
var walk = require('walk');
var json2csv = require('json2csv');


/**********************************************************************************************************/
var files = [];
var counter = 0;
var i=0;
var mytimer;
var dataArray = [{}];
var fields=['Episode', 'A', 'B', 'AtoB (bit/s)','BtoA (bit/s)'];
console.log("please wait, this may take a few minutes...")
function pcap2csv(path,tcp_udp){

	// Walker options
	var walker = walk.walk(path, {
	    followLinks: false
	});

	// find all files and add them to an array
	walker.on('file', function (root, stat, next) {
        // console.log(stat.name);
	    files.push(root + '/' + stat.name);
	    next();
	});

	walker.on('end', function () {	
        console.log('reading ended')
	    mytimer = setInterval(processor,1000);
	    //processor()
	   //setTimeout(function(){console.log("done")}, 3000);
	});

	function processor(cb){
        // console.log(files)	
		if(files[i]){
			if(files[i].split('.')[1]=='pcap'){
                // console.log(files[i])
                
                var separates = files[i].split('/');
                
                require('child_process').exec('tshark -nr '+files[i]+' -z conv,'+tcp_udp+' -q',
                (err, stdout, stderr) => {
                    if (err) {
                        console.log(err.message);
                        // node couldn't execute the command
                    }
                    // the *entire* stdout and stderr (buffered)
                    // **uncomment to write the output of .pcap files to individual .txt files instead**/

				    // fs.writeFile(path+'/'+separates[separates.length-1].split('.')[0] +'.txt', data, function (err) {
				    // 	console.log(path+'/'+separates[separates.length-1].split('.')[0] +'.txt');
				    //     if (err) throw err;
				    // });

                    console.log(stdout)
				    var array = stdout.toString().split("|");
				    var line = array[array.length-1];
		    		var linearray = line.match(/\S+/g) || [];
		    		while (linearray.length>11){  
                        
			    		var AtoB = parseFloat(linearray[6]) * 8 / parseFloat(linearray[10]);
			    		var BtoA = parseFloat(linearray[4]) * 8 / parseFloat(linearray[10]);
			    		dataArray.push({Episode:i, A:linearray[0], B:linearray[2], 'AtoB (bit/s)':AtoB, 'BtoA (bit/s)':BtoA});
			    		linearray.splice(0, 11)
		    		}
                    console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);
                });
                

				i++;
            }
            else(i++);
		}
		else {
			clearInterval(mytimer)
			var csv = json2csv({ data: dataArray, fields: fields, hasCSVColumnTitle:true });
			fs.writeFile(path+'/'+'throughput.csv', csv, function(err) {
			  if (err) throw err;
			  console.log('file saved');
			});
		}
	}
}

/**********************************************************************************************************/

// pcap2csv('/home/watch1/ayesh-server/Watch1CodeServer/pcaps','tcp');
module.exports = pcap2csv;