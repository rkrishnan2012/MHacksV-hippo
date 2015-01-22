// CODE TASKS
//************
// change specific neopixel on strip
// change neopixel brightness w/ potentiometer
// take button input
// calmly rotate servo ~30 degrees
// servos and neopixels dont work well together or at all fuck
// use attiny 85 for servo?(no)
// need new servo

#include <Adafruit_NeoPixel.h>
#include <Adafruit_TiCoServo.h>

// define pin uses
#define PIXEL_PIN 6
#define PIXEL_COUNT 15
#define BUTTON_PIN 23 //use input_pullup (check with uno first)
#define encoder0PinA 20
#define encoder0PinB 21
#define SERVO_PIN 3

Adafruit_NeoPixel strip = Adafruit_NeoPixel(PIXEL_COUNT, PIXEL_PIN, NEO_GRB + NEO_KHZ800);
Adafruit_TiCoServo hippoServo; // create servo object to control a servo

void colorFade(uint8_t wait);
void startShow(int i);
//uint32_t Wheel(byte WheelPos);

void checkTodaysWeather();
void checkSocialAccts();
void checkWebsite();
void checkTomorrowsWeather();
void updateButtonState();

int showType = 0;
int previousShowType = -1;
int reading;           // the current reading from the input pin
int previous = HIGH;    // the previous reading from the input pin
int encoder0Pos = 0;
int encoder0PinALast = LOW;
int n = LOW;

// the follow variables are long's because the time, measured in miliseconds,
// will quickly become a bigger number than can be stored in an int.
long time = 0;         // the last time the output pin was toggled
long debounce = 100;   // the debounce time, increase if the output flickers

boolean facebookNeedsUpdate = false;
boolean gmailNeedsUpdate = false;

int currentBrightness = 255;
int lastPotValue = -1;
//***********
//setup code
//***********

void setup() {
        // initialize serial communication at 9600 bits per second:
        Serial.begin(9600);
	pinMode(BUTTON_PIN, INPUT);
	pinMode(encoder0PinA, INPUT);
        pinMode(encoder0PinB, INPUT);
	hippoServo.attach(SERVO_PIN);
	strip.begin();
	strip.show();
        pinMode(13, OUTPUT);
        digitalWrite(13, HIGH);
}

//**********
//start main loop
//**********
void loop(){
  updateButtonState();
  updatePotentiometer();
  
  //  Perform the designated action (today weather, tomorrow weather, light show).
  startShow(showType);
  
  if(Serial.available() > 0){
    char serialInString[20]; // Allocate some space for the string
    int index = 0;
    char inChar;
    while (Serial.available() > 0) {
      if(index < 19) {
        inChar = Serial.read(); // Read a character
        serialInString[index] = inChar; // Store it
        index++; // Increment where to write next
      }  
    }
    serialInString[index] = '\0'; // Null terminate the string
    if(strcmp(serialInString, "facebook") == 0){
      facebookNeedsUpdate = true;  
    }
    else if(strcmp(serialInString, "gmail") == 0){
      gmailNeedsUpdate = true;  
    }    
  }
}


void updateButtonState(){
  //  Button reading code
  reading = analogRead(BUTTON_PIN);
  if(reading < 8){
    reading = LOW;
  }
  else{
    reading = HIGH;
  }
  if (reading == LOW && previous == HIGH && millis() - time > debounce) {
    //  Only 3 states for the button. Increment it.
    showType = (showType + 1) % 3;
    time = millis();    
  }
  previous = reading;
}

void updatePotentiometer(){
  n = digitalRead(encoder0PinA);
  if ((encoder0PinALast == LOW) && (n == HIGH)){
    if (digitalRead(encoder0PinB) == LOW) 
        encoder0Pos--;
        //if (encoder0Pos >= 10)
          //encoder0Pos = 10;
      else 
        encoder0Pos++;
        //if (encoder0Pos <= 0)
          //encoder0Pos = 0;
  }
  Serial.println(encoder0Pos);
  encoder0PinALast = n;
  delay(20);
  /*if(currentValue == 0){
    return;
  }
  Serial.println(currentValue);
  delay(20);
  if(lastPotValue == -1){
    lastPotValue = currentValue;
    currentBrightness = 255;
  }
  int delta = lastPotValue - currentValue;
  if(abs(delta) > 10 && abs(delta) < 40){
    if(delta > 0){
      currentBrightness = (currentBrightness + 25) % 256;
    }
    else{
      currentBrightness = (currentBrightness - 25) % 256;
    }
    Serial.printf("Setting brightness to %d. Delta = %d\n", currentBrightness, delta);
  }
  else if(abs(delta) > 10){
    Serial.printf("Delta=%d\n", delta);
    delay(50);
  }
  lastPotValue = currentValue;*/
  currentBrightness = encoder0Pos;
  strip.setBrightness(currentBrightness);
  strip.show();
}

void startShow(int i) {
  int today;
  int tomorrow;
  
  switch(i){
    case 0: {
      checkTodaysWeather();
      checkSocialAccts();
      checkWebsite();
      today = HIGH;
      tomorrow = LOW;
      break;
    }
    case 1: {
      checkTomorrowsWeather();
      checkSocialAccts();
      checkWebsite();
      today = LOW;
      tomorrow = HIGH;
      break;
    }
    case 2: {
      colorFade(300);
      today = LOW;
      tomorrow = LOW;
      break;
    }
  }
}

void colorFade(uint8_t wait) {
  if(previousShowType != showType){
    previousShowType = showType;
    Serial.println("Color fading.");
  }

  //  secret rainbow mode
  uint16_t i, j;
 
  for(j=0; j<256; j++) {
    for(i=0; i<strip.numPixels(); i++) {
      strip.setPixelColor(i, Wheel((i+j) & 255));
    }
    strip.show();
    delay(wait);
    updateButtonState();
    updatePotentiometer();
    if(showType != 2){
      delay(500);
      break;
    }
  }
}

//strip.setPixelColor(i+q, Wheel( (i+j) % 255));   //turn every third pixel on
//strip.show();

uint32_t Wheel(byte WheelPos) {
  if(WheelPos < 85) {
   return strip.Color(WheelPos * 3, 255 - WheelPos * 3, 0);
  } else if(WheelPos < 170) {
   WheelPos -= 85;
   return strip.Color(255 - WheelPos * 3, 0, WheelPos * 3);
  } else {
   WheelPos -= 170;
   return strip.Color(0, WheelPos * 3, 255 - WheelPos * 3);
  }
}


void checkTodaysWeather(){
  if(previousShowType != showType){
    previousShowType = showType;
    Serial.println("Checking today's weather.");
  }
}

void checkTomorrowsWeather(){
  if(previousShowType != showType){
    previousShowType = showType;
    Serial.println("Checking tomorrow's weather.");
  }
}

void checkSocialAccts(){
  if(facebookNeedsUpdate){
    fadePixel(0, 59,89,152);
    facebookNeedsUpdate = false;
  }
  else if(gmailNeedsUpdate){
    fadePixel(0, 213,15,37);
    facebookNeedsUpdate = false;
  }
}

void fadePixel(int pixel, int r, int g, int b){
  strip.setPixelColor(pixel, strip.Color(r,g,b));
  int originalBrightness = currentBrightness;
  for (int i = 0; i < originalBrightness; i++)
  {
      strip.setBrightness(i);
      strip.show();
      delay(10);
  }
  for (int i = originalBrightness; i > 0; i--)
  {
      strip.setBrightness(i);
      strip.show();
      delay(10);
  }
}

void checkWebsite(){

}




/*
#define encoder0PinA  2
#define encoder0PinB  4

volatile unsigned int encoder0Pos = 0;
float encodercalc;
int ledpin = 3;

void setup() { 


 pinMode(encoder0PinA, INPUT); 
 digitalWrite(encoder0PinA, HIGH);       // turn on pullup resistor
 pinMode(encoder0PinB, INPUT); 
 digitalWrite(encoder0PinB, HIGH);       // turn on pullup resistor

 attachInterrupt(0, doEncoder, CHANGE);  // encoder pin on interrupt 0 - pin 2
 Serial.begin (9600);
 Serial.println("start");                // a personal quirk
 Serial.print("?c0");
 Serial.print("?fNo. of revs:");
   Serial.print("?k");
      Serial.print("?BFF");
} 

void loop(){
// do some stuff here - the joy of interrupts is that they take care of themselves
}


void doEncoder(){
 if (digitalRead(encoder0PinA) == HIGH) {   // found a low-to-high on channel A
   if (digitalRead(encoder0PinB) == LOW) {  // check channel B to see which way
                                            // encoder is turning
     encoder0Pos = encoder0Pos - 1;         // CCW
   } 
   else {
     encoder0Pos = encoder0Pos + 1;         // CW
   }
 }
 else                                        // found a high-to-low on channel A
 { 
   if (digitalRead(encoder0PinB) == LOW) {   // check channel B to see which way
                                             // encoder is turning  
     encoder0Pos = encoder0Pos + 1;          // CW
   } 
   else {
     encoder0Pos = encoder0Pos - 1;          // CCW
   }

 }
 Serial.print("?l");
encodercalc = (float)encoder0Pos / 56.00;
encodercalc = encodercalc * 100;
 //encodercalc = encoder0Pos;
 if (encoder0Pos < 257) {
   analogWrite(ledpin, encoder0Pos);
 }
 Serial.println (encoder0Pos, DEC);          // debug - remember to comment out
                                             // before final program run
 // you don't want serial slowing down your program if not needed
}

/*  to read the other two transitions - just use another attachInterrupt()
in the setup and duplicate the doEncoder function into say, 
doEncoderA and doEncoderB. 
You also need to move the other encoder wire over to pin 3 (interrupt 1). 
*/ 

