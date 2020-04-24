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
    m504 = pins.analogReadPin(AnalogPin.P2)

    serial.writeNumber(m504)
    m505 = pins.analogReadPin(AnalogPin.P1)




    //lpredkosc = Math.map(kalib, 0, 1023, 0, 255)
    if (m505 > 600) {
        pk = 0
        lk = 1
        kalib = Math.map(m505, 600, 1023, 20, 255)
        ppredkosc = 255
        lpredkosc = 255
    } else if (m505 < 400) {
        pk = 1
        lk = 0
        kalib = Math.map(m505, 1, 400, 20, 255)
        kalib = 275 - kalib
        ppredkosc = 255
        lpredkosc = 255
    } else {
        if (m504 > 584) {
            lk = 1
            kalib = Math.map(m504, 584, 1023, 20, 255)
        } else if (m504 < 380) {
            lk = 0
            kalib = Math.map(m504, 1, 380, 20, 255)
            kalib = 275 - kalib
        } else {
            lk = 0
            kalib = 0
        }
        pk = lk
        lpredkosc = Math.floor(kalib / (6 - lbieg))
    }
    //ppredkosc = Math.floor(kalib / (6 - pbieg))
    //ppredkosc = Math.map(kalib, 0, 1023, 0, 255)
    //led.plotBarGraph(
    //    lpredkosc,
    //    255
    //)

    ppredkosc = lpredkosc

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

    //led.plotBarGraph(
    //    lpredkosc,
    //    255
    //)
    //serial.writeLine("l=" + parseInt(wyslij.substr(2, 3)) + " " + m504 + " w=" + parseInt(wyslij.charAt(0)))
    serial.writeLine(wyslij)
    radio.sendString(wyslij)

    led.plot(2, 4)
    basic.pause(10)
    led.unplot(2, 4)
})
