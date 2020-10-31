// Rafal - czytanie Joysticka i sterowanie silnikiem - czolg przod i tyl
// Adam & Maks - dodanie wysyłania przez Radio do czołgu
// Adam - dodanie biegów, wyświetalacza, klawiatury

radio.setGroup(1)
let m504 = 0
let m505 = 0
let lk = 0  // kierunek lewej gąsienicy 1- przód, 0 - tył
let pk = 0  // kierunek prawej gąsienicy 1- przód, 0 - tył
let kalib = 0
let lpredkosc = 0 // prędkość lewej gąsienicy 20-255
let ppredkosc = 0 // prędkość prawej gąsienicy 20-255
let wyslij = ""
let lbieg = 2 // bieg lewej
let pbieg = 2 // bieg prawej
doMalujBiegi(4, pbieg)
doMalujBiegi(0, lbieg)
OLED12864_I2C.init(60) // inicjalizacja wyświetlacza (I2C - adres 60)
OLED12864_I2C.showString(0, 0, "Hello, welcome aboard!")
basic.pause(5000)
OLED12864_I2C.clear()

// funkcja zmienia biegi - w kółko od 1->2
input.onButtonPressed(Button.A, function () {
    lbieg += 1
    if (lbieg > 2) { lbieg = 1 }
    doMalujBiegi(0, lbieg) // lewa gąsienica - kolumna 0 na wyświetlaczu LED
})

// funkcja zmienia biegi - w kółko od 1->2
input.onButtonPressed(Button.B, function () {
    pbieg += 1
    if (pbieg > 2) { pbieg = 1 }
    doMalujBiegi(4, pbieg)  // prawa gąsienica - kolumna 4 na wyświetlaczu LED
})

// funkcja prezentująca biegi
// kol - w któej kolumnie zaświecić Led
// ile - ile diod LED zaświecić
function doMalujBiegi(kol: number, ile: number) {
    for (let i = 0; i <= ile; i++) {
        led.plot(kol, 4 - i) //zaświecamy
    } 
    for (let i = ile; i <= 2; i++) {
        led.unplot(kol, 4 - i) //gasimy niepotrzebne
    }
    OLED12864_I2C.showNumber(kol, 2, ile) // dodatkowo prezentacja na wyświetlaczu OLED
}

basic.forever(function () {
    m504 = pins.analogReadPin(AnalogPin.P2) //PRAWY joystick
    m505 = pins.analogReadPin(AnalogPin.P1) //LEWY joystick

    if (m505 > 600) { //kalibracja: 400-600 to ZERO, 600-1023 do przodu, 1-400 do tyłu
        lk = 1 // do przodu
        kalib = Math.map(m505, 584, 1023, 20, 255) //minimalna prędkość 20
        serial.writeLine("PRZOD LEWA")
        OLED12864_I2C.showString(0, 0, "P    ")
    } else if (m505 < 400) {
        lk = 0 // do tyłu
        kalib = Math.map(m505, 1, 380, 20, 255) //minimalna prędkość 20
        kalib = 275 - kalib // sterowanie silnikiem jest od 20-255, więc odwracamy 
        serial.writeLine("TYŁ LEWA")
        OLED12864_I2C.showString(0, 0, "T    ")
    } else { // stoimy w miejscu - to trzeba dopracować
        lk = 0
        kalib = 0
        //serial.writeLine("STOP LEWA")
        OLED12864_I2C.showString(0, 0, "S    ")
    }
    lpredkosc = Math.floor(kalib / (3 - lbieg)) // tutaj trzebya wymyśleć jak zrobić dobrze biegi
    OLED12864_I2C.showNumber(1, 0, lpredkosc)
    
    if (m504 > 584) { //kalibracja: 380-584 to ZERO, 584-1023 do przodu, 1-380 do tyłu 
        pk = 1
        kalib = Math.map(m504, 584, 1023, 20, 255) //minimalna prędkość 20
        serial.writeLine("PRZOD PRAWA")
        OLED12864_I2C.showString(6, 0, "P   ")
    } else if (m504 < 380) {
        pk = 0
        kalib = Math.map(m504, 1, 380, 20, 255) //minimalna prędkość 20
        kalib = 275 - kalib
        serial.writeLine("TYŁ PRAWA")
        OLED12864_I2C.showString(6, 0, "T   ")
    } else {
        pk = 0
        kalib = 0
        //serial.writeLine("STOP PRAWA")
        OLED12864_I2C.showString(6, 0, "S   ")
    }
    ppredkosc = Math.floor(kalib / (3 - pbieg))
    OLED12864_I2C.showNumber(7, 0, ppredkosc)
    
    //budujemy komunikat do wysłania:
    // LK - kierunek lewej gąsienicy (jeden znak)
    // PL - kierunek prawej gąsienicy (jeden znak)
    // lpredkosc - prędkość lewej gąsienicy (3 znaki)
    // ppredkosc - prędkość prawej gąsienicy (3 znaki)
    // klawisz - jeden znak (numer klawisza)
    // LK PL LPR PPR KL
    // _  _  ___ ___ _  <- w sumie 9 znaków 
    wyslij = lk.toString()
    wyslij = wyslij + pk.toString()

    if (lpredkosc < 10) {
        wyslij = wyslij + "00" + lpredkosc.toString() //zera wiodące
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
  key = do_get_key(adc_key_in);  // funkcja zamieniająca odczytaną wartość na kod klawisza

  if (key != oldkey)   // jeśli klawisz się zmienił (odczyt tego samego nic nie zmienia - może trzeba to też uwzględnić?)
   {
    basic.pause(50);  // króka przerwa
    adc_key_in = pins.analogReadPin(AnalogPin.P3)    // read the value from the sensor
    key = do_get_key(adc_key_in);    // funkcja zamieniająca odczytaną wartość na kod klawisza
    if (key != oldkey)
    {
      oldkey = key;
      if (key >0){
        switch(key)
        {
           case 1:serial.writeLine("S1 OK");
                wyslij = wyslij + "1";
                OLED12864_I2C.showString(1, 1, "LED ON ")
                break;
           case 2:serial.writeLine("S2 OK");
                wyslij = wyslij + "2";
                OLED12864_I2C.showString(1, 1, "LED OFF")
                break;
           case 3:serial.writeLine("S3 OK");
                wyslij = wyslij + "3";
                break;
           case 4:serial.writeLine("S4 OK");
                wyslij = wyslij + "4";
                break;
           case 5:serial.writeLine("S5 OK");
                wyslij = wyslij + "5";
                break;
           default: wyslij = wyslij + "0"; 
        }
      }
    }
   }

    radio.sendString(wyslij) //wysyłamy do serwera czołgu

    led.plot(2, 4) 
    basic.pause(10)
    led.unplot(2, 4)
})

// RAFAL - wartości dla klawiatury
//let adc_key_val =[835,860,890,920,1000]; // [S1, S2, S3, S4, S5] - Wartość odczytane odpowiadające przyciskom
// MAKS - wartości dla klawiatury
let adc_key_val =[850,870,900,930,980]; // [S1, S2, S3, S4, S5] - Wartość odczytane odpowiadające przyciskom
let NUM_KEYS = 5; // ile przycisków
let adc_key_in;
let key = -1;
let oldkey = -1;


// funkcja zmienia odczyt w kod klawisza korzystając z tablicy 
function do_get_key(input:number) {
    let k;
    for (k = 0; k < NUM_KEYS; k++)
    {
      if (input < adc_key_val[k])
     {
            return k+1; // zwracamy +1, bo w tablicy indeks zaczyna się o 0
        }
   }
       if (k >= NUM_KEYS)k = -1;  // No valid key pressed
       return k;
}