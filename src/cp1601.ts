export class cp1601{
    static cmdPoll: number[] = [0x01];
    // command to write lcd's, send before cmdWriteLcd is send
    // 3rd byte is amount of lcd's written
    static cmdInitWriteLcd: number[] = [0x40,0x20,0x00,0x50];
    // target a specific lcd to write data, command followed by 256 data bytes
    // 2nd byte is target lcd, start at 0x01
    static cmdWriteLcd: number[] = [0x06,0x00];
    // set the color of a specific lcd backlight
    // 2nd byte is target led, start at 0x01, 3rd byte is color, combine color bits 
    static cmdColorLcd: number[] = [0x05,0x00,0x00];
    // beep, 3rd byte is duration, higher == longer, I think 100ms steps
    static cmdBeep: number[] = [0x03,0x00,0x01];
    // clear lcd, 2nd byte is target lcd, start at 0x01
    static cmdEmptyLcd: number[] = [0x04,0x00];

    // colors
    static noColor: number = 0x00;
    static darkBlueColor: number = 0x01;
    static blueColor: number = 0x02;
    static darkRedColor: number = 0x04;
    static redColor: number = 0x08;
    static darkGreenColor: number = 0x10;
    static greenColor: number = 0x20;
    static fullColor: number = 0x3F;
    
    // send as acknowledgement to commands
    static deviceAck: number = 0x84;
    // starter for device button data
    static deviceBtn: number = 0x82;
    // probably device info
    static deviceInfo: number = 0x81;
    // device lcd button is pressed, contains which lcd
    // 3rd byte is target lcd
    static deviceLcdBtn: number[] = [0x82,0x01,0x00,0x00];
    // turn knob button is up
    static deviceTurnBtnUp: number[] = [0x82,0x02,0x11];
    // turn knob button is down
    static deviceTurnBtnDown: number[] = [0x82,0x01,0x11];
    // turn knob is turned, with 4th byte is turn value
    static deviceTurnKnob: number[] = [0x82,0x03,0x11,0x00];
    
    public parse(data: number[]): boolean{
        switch(data[0]){
            case cp1601.deviceAck:
                break;
            case cp1601.deviceBtn:
                break;
            case cp1601.deviceInfo:
                break;
        }
        return false;
    }
}
