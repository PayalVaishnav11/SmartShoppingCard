#include <WiFi.h>
#include <HTTPClient.h>

#define RFID_RX 16
#define RFID_TX 17
HardwareSerial RFID(2);

const char* ssid = "Sundar das";
const char* password = "Payal@7208";

String serverUrl = "http://192.168.0.107:5000/api/scan";
String deviceId = "cart-esp-01";

String tagBuffer = "";
unsigned long lastCharTime = 0;   // when the last character arrived
bool hasData = false;             // true if buffer has unprocessed data

String lastTag = "";              // debounce: remember last scanned tag
unsigned long lastScanTime = 0;
const unsigned long SCAN_COOLDOWN = 3000;  // 3 sec between same-tag scans
const unsigned long READ_TIMEOUT  = 100;   // 100ms silence = end of one tag read

// Returns true if c is a valid hex character (0-9, A-F, a-f)
bool isHexChar(char c) {
  return (c >= '0' && c <= '9') || (c >= 'A' && c <= 'F') || (c >= 'a' && c <= 'f');
}

void setup() {
  Serial.begin(9600);
  RFID.begin(9600, SERIAL_8N1, RFID_RX, RFID_TX);

  Serial.println("Connecting WiFi...");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }

  Serial.println();
  Serial.print("WiFi connected, IP: ");
  Serial.println(WiFi.localIP());
  Serial.println("Ready to scan RFID card.");
}

// -------------------- SEND DATA --------------------
void sendScanToServer(String rfid) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected, cannot send");
    return;
  }

  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");

  String body = "{\"deviceId\":\"" + deviceId + "\",\"rfid\":\"" + rfid + "\"}";
  Serial.println("Sending: " + body);

  int code = http.POST(body);
  Serial.print("POST code: ");
  Serial.println(code);

  if (code > 0) {
    Serial.println("Server response: " + http.getString());
  } else {
    Serial.println("Error sending data.");
  }

  http.end();
}

// -------------------- PROCESS TAG BUFFER --------------------
void processBuffer() {
  // The raw hex payload from an RDM6300 is 12 hex chars:
  //   VV (2 version) + TTTTTTTT (8 tag ID) + CC (2 checksum)
  // The buffer may contain one or more repetitions if the card was held.
  // We just need the first 12 hex chars.

  Serial.println("Raw buffer: " + tagBuffer);

  if (tagBuffer.length() >= 12) {
    // Extract the first 12-char frame
    // Chars 0-1  = version
    // Chars 2-9  = tag ID  (this is what we want)
    // Chars 10-11 = checksum
    String tagId = tagBuffer.substring(2, 10);
    tagId.toUpperCase();

    Serial.println("RFID TAG ID: " + tagId);

    // Debounce: skip if same tag scanned within cooldown
    unsigned long now = millis();
    if (tagId != lastTag || (now - lastScanTime) > SCAN_COOLDOWN) {
      lastTag = tagId;
      lastScanTime = now;
      sendScanToServer(tagId);
    } else {
      Serial.println("(same tag — cooldown, skipping)");
    }
  } else {
    Serial.println("Short read (" + String(tagBuffer.length()) + " chars), ignoring");
  }

  tagBuffer = "";
  hasData = false;
}

// -------------------- MAIN LOOP --------------------
void loop() {

  // Read all available bytes from RFID serial
  while (RFID.available()) {
    char c = (char)RFID.read();

    // Only keep hex characters; skip control bytes (STX 0x02, ETX 0x03, CR, LF, etc.)
    if (isHexChar(c)) {
      tagBuffer += c;
    }

    lastCharTime = millis();
    hasData = true;
  }

  // If we have data and no new chars arrived for READ_TIMEOUT ms, process it
  if (hasData && (millis() - lastCharTime) > READ_TIMEOUT) {
    processBuffer();
  }
}
