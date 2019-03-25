<h1>Steps to setup the server</h1>
<ul>
    <li>Download the zip file and extract it locally.</li>
    <li>Switch to the project folder in command line and enter <strong>npm install</strong>.</li>
    <li>That should install the required dependencies of <em>mqtt and cassandra-driver</em> , otherwise manually install them.</li>
    <li>Install Cassandra DB on your machine. Steps can be found at this link http://cassandra.apache.org/download/</li>
    <li> <p>After installation, an instance/node of cassandra should be running automatically, check status by running
        <strong>nodetool status</strong> or <strong>sudo service cassandra status</strong>. Both should give you an active or running status for one node. </p>  
        <p>Note: If you get nodetool error or service cassandra status returns that the service has exited, it means that cassandra is crashing, and probably has to do with the amount of space that is required. Try increasing your VM RAM to about 16 GB or so and retry.</p>   
    </li>
    <li>Additionally, you will need an MQTT broker running locally, try using PONTE npm broker. Installation and setup steps can be found at https://www.npmjs.com/package/ponte</li>
    <li>Once the environment is setup and the broker is running, start the server.</li>
    <li>Change the experiment number by modifying the <em>exp_num</em> variable if you run the experiment more than once. This will create a new record/table in the DB for every experiment you run.</li>
    <li>The server displays all the data it receives from the watch and also saves it in the DB with a unique key called <em>timestamp</em>.</li>
    <li>You can view the entries in the DB by running <strong>cqlsh</strong> on command line and entering the Cassandra Query Language(CQL) shell. From there just enter <strong>select * from watch_analytics.experiment#</strong> with your experiment # and view the results.</li>
</ul>