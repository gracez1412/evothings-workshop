#include <SoftwareSerial.h>
#define LED 9
SoftwareSerial HM10(0,2);

void setup() {
  AT+UUID0xAAA0
  OK+Set:0xAAA0
  
  AT+CHAR0xABA0
  OK+SET:0xABA0
  
  // put your setup code here, to run once:
  Serial.begin(9600);
  HM10.begin(9600);
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(LED,OUTPUT);
}

void loop() {
  // put your main code here, to run repeatedly:
  HM10.listen();  
  while(HM10.available() > 0) 
  {
    int data = HM10.read();
    Serial.println(data);
    if (data == 16)
    {
      for (int i = 0; i < 10; i++)
      {
        digitalWrite(LED_BUILTIN, HIGH);
        delay(100);
        digitalWrite(LED_BUILTIN, LOW);
      }  
    }
    else if (data == 0)
    {
      digitalWrite(LED, LOW);
    }
    else
    {
        data = map(data,0,9,0,255);
        Serial.println(data);
        analogWrite(LED,data);
        if (data == 255){
          Serial.println("vibrate!");
          byte s[1] = {0x00};
          HM10.write(s,sizeof(s));
        }
    }
  }
}
