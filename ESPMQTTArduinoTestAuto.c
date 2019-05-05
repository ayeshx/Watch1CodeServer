#include <WiFi.h>
#include <MQTT.h>
#include <cJSON.h>

const char ssid[] = "Shams";
const char pass[] = "testpass";

cJSON *Jmessage;
int transmit;

WiFiClient net;
MQTTClient client;

unsigned long lastMillis = 0;
unsigned long Start = 0;
int value=0;

void connect() {
  Serial.print("checking wifi...");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(1000);
  }

  Serial.print("\nconnecting...");
  while (!client.connect("arduino", "try", "try")) {
    Serial.print(".");
    delay(1000);
  }
  client.publish("ESP32/Status", "Connected");

  Serial.println("\nconnected!");

  client.subscribe("ESP32/start");
  client.subscribe("ESP32/ack");
  client.subscribe("ESP32/kill");
  // client.unsubscribe("/hello");
  client.publish("ESP32/Status", "Subscribed");
}

void messageReceived(String &topic, String &payload) {
  Serial.print("Message arrived on [");
  Serial.print(topic);
  Serial.print("]: ");
    Serial.print(payload);
  Serial.println();
  if (strcmp (topic.c_str(),"ESP32/ack")==0 && transmit==1){
    char message[34];
    cJSON_DeleteItemFromObject(Jmessage, "roundtrip_time");
    cJSON_AddStringToObject(Jmessage, "roundtrip_time", ultoa((esp_log_timestamp()-Start),message,10));
    client.publish("ESP32/finaldata", cJSON_Print(Jmessage));
    Serial.println(cJSON_Print(Jmessage));
    }
    else if (strcmp (topic.c_str(),"ESP32/start")== 0){
     client.publish("ESP32/Status", "Starting");
     Serial.println("Starting");
     transmit =1;
    }
     else if (strcmp (topic.c_str(),"ESP32/kill")== 0){
     client.publish("ESP32/Status", "Ending");
     Serial.println("kill code");
     transmit =0;
    }
}


void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, pass);
  Serial.println("Booting");

  // Note: Local domain names (e.g. "Computer.local" on OSX) are not supported by Arduino.
  // You need to set the IP address directly.
  client.begin("192.168.43.12", net);
  client.onMessage(messageReceived);
  Jmessage = cJSON_CreateObject();
  cJSON_AddStringToObject(Jmessage, "text", "");
  cJSON_AddStringToObject(Jmessage, "roundtrip_time", "");
  transmit=0;

  connect();
}



const char text [7][500] = {"ZtHqiLBntcVCZVJkuetxcknHXRfZQsxPPpsEWXWNuEQoVZYhQfJXqmzvkwmoGPfOCeNYwxGEacXrwePIiqKxRpVrcFSNUSuwecJJL",
"cxPMqFLAucCeFeeHuqTjqwzPhiwoSewptCDqTmFXOBKHxGKzhtIqtXGioSGeeQDBcZPDDbATtyUVidxJODxvIpPweSKZawJzFjHHFscDRoMEHNcpBPmIVeZzhklqX",
"aPLwUMKPMyCknbUZGGfKOQrEzgCTqiQoFQFQTssfwUqbysRtFwPoYqeDIUMVEF",
"mnSgxCZRduUNaqxkfxiNhsoUIkQWHzb",
"uKaUPzuJrOoLaul",
"KabpoRpS",
"DTYp"};

const int frequency [13] = {64000 , 32000, 16000, 8000, 4000, 2000, 1000, 500, 250, 125, 100, 65, 50};

const int freq = 2000;
const int mssg_size = 6;


void loop() {
  client.loop();
  delay(10);  // <- fixes some issues with WiFi stability

  if (transmit == 1 && (millis() - lastMillis) > freq){
    Start = esp_log_timestamp();
    Serial.println("Publish message");
    char message[10];
    cJSON_DeleteItemFromObject(Jmessage, "text");
    cJSON_AddStringToObject(Jmessage, "text", itoa(value,message,10));
    value++;
    client.publish("ESP32/data", cJSON_Print(Jmessage));
    lastMillis = millis();
  }


}