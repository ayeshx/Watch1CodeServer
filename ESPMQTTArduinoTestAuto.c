#include <WiFi.h>
#include <MQTT.h> // MQTT by joel gaehwiler: https://github.com/256dpi/arduino-mqtt
#include <cJSON.h>

const char ssid[] = "Shams";    //Network SSID, change to your network SSID
const char pass[] = "testpass"; //Network Password, change to your network SSID

cJSON *Jmessage; //JSON message
WiFiClient net;
MQTTClient client;
String MQTTBroker = "192.168.43.124"; //MQTT broker IP address, change to your broker's IP address

unsigned long lastMillis = 0;   // time since last publish
unsigned long Timeout = 10000;  // timeout is set to 10 seconds
int value = 0;                  //number to send
bool GotAck;                    // acknowledgment check bit
bool Start;                     // acknowledgment check bit
const int period = 500;         //specify perdiod duration
String ClientID = "ESP32";

//Connect to Wifi and MQTT //DO NOT MODIFY
void connect() 
{
  //check and connect to WiFi
  Serial.print("checking wifi...");
  while (WiFi.status() != WL_CONNECTED)
  {
    Serial.print(".");
    delay(1000);
  }

  Serial.print("\nconnecting...");
  //connect to MQTT broker
  while (!client.connect(ClientID.c_str(), "try", "try"))
  {
    Serial.print(".");
    delay(1000);
  }
  client.publish("ESP32/Status", "Connected");

  Serial.println("\nconnected!");
  //subscribe to recieve commands
  client.subscribe("ESP32/start");
  client.subscribe("ESP32/ack");
  client.subscribe("ESP32/kill");
  client.publish("ESP32/Status", "Subscribed");
}

//OnMessage callback //DO NOT MODIFY
void messageReceived(String &topic, String &payload)
{
  Serial.print("Message arrived on [");
  Serial.print(topic);
  Serial.print("]: ");
  Serial.print(payload);
  Serial.println();

  //check if an ack message
  if (strcmp(topic.c_str(), "ESP32/ack") == 0 && Start == 1)
  {
    char message[34]; //array to stringify roundtrip time
    cJSON_DeleteItemFromObject(Jmessage, "roundtrip_time"); //delete exostong roundtrip time element
    cJSON_AddStringToObject(Jmessage, "roundtrip_time", ultoa((esp_log_timestamp() - lastMillis), message, 10)); //add element with new value
    client.publish("ESP32/finaldata", cJSON_Print(Jmessage)); //publish message
    GotAck = 1; //enable ack bit to verify
    Serial.println(cJSON_Print(Jmessage));
  }

  //check if a start message
  else if (strcmp(topic.c_str(), "ESP32/start") == 0 && Start == 0)
  {
    client.publish("ESP32/Status", "Starting");
    Serial.println("Starting");
    Start = 1; // enable Start/tansmission bit
  }

  //check if a terminate message
  else if (strcmp(topic.c_str(), "ESP32/kill") == 0 && Start == 1)
  {
    client.publish("ESP32/Status", "Ending");
    Serial.println("kill code");
    Start = 0; // disable start/tranmsission bit
  }
}

void setup()
{
  Serial.begin(115200);
  WiFi.begin(ssid, pass); //Setup Wifi config

  // Note: Local domain names (e.g. "Computer.local" on OSX) are not supported by Arduino.
  // You need to set the IP address directly.
  client.begin(MQTTBroker.c_str(), net); //configure MQTT client
  client.onMessage(messageReceived); //configure on message calllback
  Serial.println("Booting up");
  client.publish("ESP32/Status", "BootingUp");
  Jmessage = cJSON_CreateObject(); // create JSON object to be sent
  cJSON_AddStringToObject(Jmessage, "text", ""); // add text elemnt
  cJSON_AddStringToObject(Jmessage, "roundtrip_time", ""); //add roundtrip element
  Start = 0; //initilize Start bit to 0;
  GotAck = 1;//initilize ack bit to 1;
  connect(); // connect wo WiFi and MQTT

  //////////////////////PLUG SETUP CODE HERE//////////////////////////////////

  ///////////////////////////////////////////////////////////////////////////

}

void loop()
{
  client.loop();
  delay(20); //fixes some issues with WiFi stability

  if (!client.connected()) //check for MQTT connection
  {
    connect();
  }

  // To transmit, Start bit needs to be enabled, last published message should be sent after period passed and you either recieved an ack from last message or timeout occured (timeout is 10 seconds)
  if (Start == 1 && (esp_log_timestamp() - lastMillis) > period && (GotAck == 1 || ((esp_log_timestamp() - lastMillis) > Timeout)))
  {
    Serial.println("Publishing message");
    char message[10];
    // to replace an existing JSON element you need yo delete the current one and add a new  one in its place
    cJSON_DeleteItemFromObject(Jmessage, "text"); //delete current "text" element
    cJSON_AddStringToObject(Jmessage, "text", itoa(value, message, 10)); //add text element with new value

    //////////////////////PLUG CODE HERE///////////////////////////////////////
    value++; //increment value for next message
    //////////////////////////////////////////////////////////////////////////

    GotAck = 0; //reset ack to 0 (wait for ack before next tranmission)
    client.publish("ESP32/data", cJSON_Print(Jmessage)); //publish message
    lastMillis = esp_log_timestamp(); //capture timestamp of las publish
  }
}