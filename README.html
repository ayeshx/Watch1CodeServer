<h1>Steps to setup the Experiment</h1>
<ol>
    <li>
        <h3>Basic Setup Steps</h3>
        <ul>
            <li>Download the zip file and extract it locally.</li>
            <li>Move the project to your <em>/home</em> directory.</li>
            <li>Switch to the project folder in command line and enter <strong>npm install</strong>.</li>
            <li>That should install the required dependencies of <em>mqtt, cassandra-driver, exceljs and pcap2csv</em> ,
                otherwise manually install them.</li>
            <li>Open <strong>testAutomater.js</strong> file and change the <em>server_file</em> and <em>pcaps</em>
                constants to point to your exact <strong>server.js</strong> file as shown in the default value and also
                to your <strong>pcaps</strong> directory where the throughput.csv file will be saved.</li>
            <li>Install Cassandra DB on your machine. Steps can be found at this link
                http://cassandra.apache.org/download/</li>
            <li>
                <p>After installation, an instance/node of cassandra should be running automatically, check status by
                    running
                    <strong>nodetool status</strong> or <strong>sudo service cassandra status</strong>. Both should give
                    you an active or running status for one node. </p>
                <p>Note: If you get nodetool error or service cassandra status returns that the service has exited, it
                    means that cassandra is crashing, and probably has to do with the amount of space that is required.
                    Try increasing your VM RAM to about 16 GB or so and retry.</p>
            </li>

            <li>Additionally, you will need an MQTT broker running locally, try using PONTE npm broker. Installation and
                setup steps can be found at https://www.npmjs.com/package/ponte</li>
            <li>Once the environment is setup and the broker is running, start the server.</li>
            <li>Change the experiment number by modifying the <em>exp_num</em> variable if you run the experiment more
                than once. This will create a new record/table in the DB for every experiment you run.</li>
            <li>The server displays all the data it receives from the watch and also saves it in the DB with a unique
                key called <em>timestamp</em>.</li>
            <li>You can view the entries in the DB by running <strong>cqlsh</strong> on command line and entering the
                Cassandra Query Language(CQL) shell. From there just enter <strong>select * from
                    watch_analytics.experiment#</strong> with your experiment # and view the results.</li>
            <li>Change the <em>tcconfigprofiles</em> variable to your downloaded project directory and
                <strong>tcconfigprofiles</strong> directory under it </li>
            <li>Change the <em>network_driver</em> variable to your wireless adapter name, when you run <em>ip addr</em>
                or <em>ifconfig</em>.</li>
            <li>Similarly change the <em>pcaps</em> variable to your pcaps directory location in your downloaded
                project.</li>
        </ul>
    </li>
    <li>
        <h3>Setup for Tizen OS (Samsung Gear S3)</h3>
        <ul>
            <li>If running a Samsung watch, change the <em>targetWatch</em> constant in the <em>testAutomater.js</em>
                file to the address of your watch
                too.</li>
            <li>Make sure the test machine and the watch are on the same network.</li>
            <li>It may not work on the first try because of SDB related issues, so re run it again.</li>
        </ul>
    </li>
    <li>
        <h3>Setup for Android Wear (Huawei Watch)</h3>
        <ul>
            <li>Download the Nativescript Android App from https://github.com/ayesh6x6x6/Watch3-Android-NativescriptApp.
            </li>
            <li>Move the downloaded project to the same location as your Main Server (this project). </li>
            <li>Go to your watch and enable adb debugging under developer options.</li>
            <li>Make sure the test machine and the watch are on the same network.</li>
            <li>Also enable Wi-fi debugging or debugging over Wi-fi which will give you an address to connect to along
                with the port number, usually 5555 by default.</li>
            <li> change the <em>adb_huawei_addr</em> variable to the IP address of your watch with the port number as
                the default value shows.</li>
            <li>Lastly, install the Nativescript CLI globally by running <em>npm install -g nativescript</em>.</li>
        </ul>
    </li>
    <li>
        <h3>Setup for Fitbit OS Device (Fitbit Versa)</h3>
        <ul>
            <li>Download the Fitbit Device Fitbit App from https://github.com/ayesh6x6x6/Watch2FitbitApp</li>
            <li>Move the downloaded project to the same location as your Main Server (this project).</li>
            <li>Download the Fitbit App on your phone which is the primary pair of the Fitbit device.</li>
            <li>Enable bluetooth and Wifi on your phone and open the app.</li>
            <li>Select your device and enable <em>developer bridge</em> from the developer options.</li>
            <li>On your Fitbit device go to settings and enable the Developer Bridge too.</li>
            <li>Make sure the test machine, the watch and the companion (The phone which is paired with your Fitbit
                using the Fitbit App) are on the same network.</li>
            <li>When running the server and having a Fitbit device, a second shell will open as
                <strong>fitbit$</strong>, enter the command <em>install</em> here.</li>
        </ul>
    </li>
    <li>
        <h3>Setup for Arduino Device (ESP 32)</h3>
        <ul>
            <li>Change the SSID, password and IP to the one in which you are running your experiment.</li>
            <li>download and install arduino IDE from https://www.arduino.cc/en/Main/Software</li>

            <li>Run arduino IDE</li>

            <li>go to <em>file-> preferences</em>  and paste <strong>https://dl.espressif.com/dl/package_esp32_index.json</strong> in additional
                boards manager url field</li>

            <li>go to <em>tools->board->board manager</em> and search for <strong>esp32</strong> and install</li>

            <li>go to <em>tools->manage libraries</em>, and search for <strong>mqtt</strong>.</li>

            <li>select and install MQTT by <strong><em>joel gaehwiler</em></strong></li>

            <li>copy the code from <strong>ESPMQTTArduinoTestAuto.c</strong> to arduino ide, verify and upload</li>
        </ul>
    </li>
    <li>
        <h3>Network Shaping Setup & Requirements</h3>
        <ul>
            <li> you will need to install <strong>tcconfig</strong>. </li>
            <li>On debian/ubuntu enter <strong>wget
                    https://github.com/thombashi/tcconfig/releases/download/v0.19.0/tcconfig_0.19.0_amd64.deb</strong>
            </li>
            <li>Follow by this command <strong>sudo dpkg -i tcconfig_0.19.0_amd64.deb</strong></li>
            <li>You will also need to install Wireshark to use the tshark command line utility, this is simply done from
                the <em>Ubuntu Software</em>.</li>
            <li>If you get the following error, <em>couldn't run /usr/bin/dumpcap in child process: Permission
                    Denied</em> or something similar its a permissions related issue and add your user to the wireshark
                group by-
                <ol>
                    <li>sudo dpkg-reconfigure wireshark-common</li>
                    <li>choose answer as "YES" .Then add user to the group by</li>
                    <li>sudo adduser $USER wireshark</li>
                    <li>Restart your machine or wireshark.</li>
                    <li>The pcaps you capture should not be locked, a useful link-
                        https://askubuntu.com/questions/458762/how-to-enable-wireshark-without-running-as-root-in-trusty-14-04
                    </li>
                </ol>
            </li>
            <li>After successfull run, in the <em>pcaps</em> directory, you should get a <strong>throughput.csv</strong>
                file which has the network
                related information. For every re-run of the same experiment, remove the old pcaps and csv file. For new
                experiments, change <em>exp_num</em> and the <strong>Examples.xlsx</strong> file.</li>
        </ul>
    </li>
    <li>
        <h3>Steps to Automate the Experiment</h3>
        <ul>
            <li> <strong>Examples.xlsx</strong> contains information to automate the tests. </li>
            <li>Change columns <em>B, F, G, H and I</em> to the values you want and save the file.</li>
            <li>Check if any device has a new IP that is not already configured in the 7 json profiles in
                tcconfigprofiles directory, then,
                <ol>
                    <li>Open <strong>addnewip.js</strong> file and change <em>new_ip</em> variable to the new IP that
                        you want to add. </li>
                    <li>Run the file using <em>node addnewip.js</em>, and the IP should be added to all 7 profiles.</li>
                </ol>
            </li>
            <li>Finally run the <em>testAutomater.js</em> file using <em>node testAutomater.js</em>, and the experiment
                should start for the duration specified per row in the <em>Examples.xlsx</em> file.</li>
        </ul>
    </li>



</ol>