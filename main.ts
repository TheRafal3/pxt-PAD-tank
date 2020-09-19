// Rafal - czytanie Joysticka i sterowanie silnikiem - czolg przod i tyl
// Adam & Maks - dodanie wysyłania przez Radio do czołgu
// Adam - dodanie biegów

radio.setGroup(1)
let m504 = 0
let m505 = 0
let lk = 0
let pk = 0
let kalib = 0
let lpredkosc = 0
let ppredkosc = 0
let wyslij = ""
let lbieg = 5
let pbieg = 5
doMalujBiegi(4, pbieg)
doMalujBiegi(0, lbieg)


input.onButtonPressed(Button.A, function () {
    lbieg += 1
    if (lbieg > 5) { lbieg = 1 }
    doMalujBiegi(0, lbieg)
})

input.onButtonPressed(Button.B, function () {
    pbieg += 1
    if (pbieg > 5) { pbieg = 1 }
    doMalujBiegi(4, pbieg)
})

function doMalujBiegi(kol: number, ile: number) {
    for (let i = 0; i <= ile; i++) {
        led.plot(kol, 4 - i)
    }
    for (let i = ile; i <= 5; i++) {
        led.unplot(kol, 4 - i)
    }
}

basic.forever(function () {
    m504 = pins.analogReadPin(AnalogPin.P2) //PRAWY
    m505 = pins.analogReadPin(AnalogPin.P1) //LEWY

    if (m505 > 600) { //kalibracja: 400-600 to ZERO, 600-1023 do przodu, 1-400 do tyłu
        lk = 1
        kalib = Math.map(m505, 600, 1023, 20, 255) //minimalna prędkość 20
        serial.writeLine("PRZOD LEWA")
    } else if (m505 < 400) {
        lk = 0
        kalib = Math.map(m505, 1, 400, 20, 255) //minimalna prędkość 20
        kalib = 275 - kalib
        serial.writeLine("TYŁ LEWA")
    } else {
        lk = 0
        kalib = 0
        //serial.writeLine("STOP LEWA")
    }
    lpredkosc = Math.floor(kalib / (6 - lbieg))
    
    if (m504 > 584) { //kalibracja: 380-584 to ZERO, 584-1023 do przodu, 1-380 do tyłu 
        pk = 1
        kalib = Math.map(m504, 584, 1023, 20, 255) //minimalna prędkość 20
        serial.writeLine("PRZOD PRAWA")
    } else if (m504 < 380) {
        pk = 0
        kalib = Math.map(m504, 1, 380, 20, 255) //minimalna prędkość 20
        kalib = 275 - kalib
        serial.writeLine("TYŁ PRAWA")
    } else {
        pk = 0
        kalib = 0
        //serial.writeLine("STOP PRAWA")
    }
    ppredkosc = Math.floor(kalib / (6 - pbieg))
    
    //budujemy komunikat do wysłania:
    // LK - kierunek lewej gąsienicy (jeden znak)
    // PL - kierunek prawej gąsienicy (jeden znak)
    // lpredkosc - prędkość lewej gąsienicy (3 znaki)
    // ppredkosc - prędkość prawej gąsienicy (3 znaki)
    // 
    wyslij = lk.toString()
    wyslij = wyslij + pk.toString()

    if (lpredkosc < 10) {
        wyslij = wyslij + "00" + lpredkosc.toString()
    } else if (lpredkosc < 100) {
        wyslij = wyslij + "0" + lpredkosc.toString()
    } else {
        wyslij = wyslij + lpredkosc.toString()
    }

    if (ppredkosc < 10) {
        wyslij = wyslij + "00" + ppredkosc.toString()
    } else if (ppredkosc < 100) {
        wyslij = wyslij + "0" + ppredkosc.toString()
    } else {
        wyslij = wyslij + ppredkosc.toString()
    }


  adc_key_in = pins.analogReadPin(AnalogPin.P3);    // read the value from the sensor
  //serial.writeNumber(adc_key_in);
  //serial.writeLine("-")
  key = do_get_key(adc_key_in);  // convert into key press

  if (key != oldkey)   // if keypress is detected
   {
    basic.pause(50);  // wait for debounce time
    adc_key_in = pins.analogReadPin(AnalogPin.P3)    // read the value from the sensor
    key = do_get_key(adc_key_in);    // convert into key press
    if (key != oldkey)
    {
      oldkey = key;
      if (key >0){
        switch(key)
        {
           case 1:serial.writeLine("S1 OK");
                wyslij = wyslij + "S1";
                break;
           case 2:serial.writeLine("S2 OK");
                wyslij = wyslij + "S2";
                break;
           case 3:serial.writeLine("S3 OK");
                wyslij = wyslij + "S3";
                break;
           case 4:serial.writeLine("S4 OK");
                wyslij = wyslij + "S4";
                break;
           case 5:serial.writeLine("S5 OK");
                wyslij = wyslij + "S5";
                break;
           default: wyslij = wyslij + "  "; 
        }
      }
    }
   }

    radio.sendString(wyslij) //wysyłamy do serwera czołgu

    led.plot(2, 4)
    basic.pause(10)
    led.unplot(2, 4)


})


let adc_key_val =[835,860,890,920,1000];
let NUM_KEYS = 5;
let adc_key_in;
let key = -1;
let oldkey = -1;

 


// Convert ADC value to key number
function do_get_key(input:number) {
    let k;
    for (k = 0; k < NUM_KEYS; k++)
    {
      if (input < adc_key_val[k])
     {
            return k+1;
        }
   }
       if (k >= NUM_KEYS)k = -1;  // No valid key pressed
       return k;
}