import {EventEmitter} from 'events';

export class cp1601Lcd{
    public position: number = 1;
    public pixels: Uint8Array = new Uint8Array(256).fill(0);
    public color: number = 0x00;
    public pressed: boolean = false;

    public event: EventEmitter = new EventEmitter();    

    public constructor(position: number){
        this.position=position;
    }
}

export class cp1601Knob{
    public event: EventEmitter = new EventEmitter();      
    public pressed: boolean = false;
    public turnDirection: 3|4 = 3; //left or right
    public value: number = 0;
}

export class cp1601{
    // polling command, needs to be done every ~5 seconds 
    static cmdPoll: Uint8Array = new Uint8Array([0x01]);

    // command to write lcd's, send before cmdWriteLcd is send
    // 3rd byte is amount of lcd's written
    static cmdInitWriteLcd(lcdCount: number): Uint8Array{
        if(lcdCount < 0x01)
            lcdCount = 1;
        else if(lcdCount > 0x10)
            lcdCount = 0x10;

        return new Uint8Array([0x40,0x20,lcdCount,0x50]);
    }

    // target a specific lcd to write data, command followed by 256 data bytes
    // 2nd byte is target lcd, start at 0x01
    static cmdWriteLcd(targetLcd:number): Uint8Array{
        if(targetLcd <0x01)
            targetLcd = 0x01; 
        else if(targetLcd > 0x10)
            targetLcd = 0x10;

        return new Uint8Array([0x06,targetLcd]);
    }

    // set the color of a specific lcd backlight
    // 2nd byte is target led, start at 0x01, 3rd byte is color, combine color bits 
    static cmdColorLcd(targetLcd:number,color:number): Uint8Array{
        if(targetLcd <0x01)
            targetLcd = 0x01; 
        else if(targetLcd > 0x10)
            targetLcd = 0x10;
        if(color<0)
            color=0;
        else if(color>255)
            color=255;
        return new Uint8Array([0x05,targetLcd,color]);
    }

    static cmdRgbColorLcd(targetLcd:number,red:number,green:number,blue:number): Uint8Array{
        let color = 0;
        if(red > 0){
            if(red > 0xAA){
                color |= this.redColor | this.darkRedColor;
            }else if(red > 0x55){
                color |= this.redColor;
            }else{
                color |= this.darkRedColor;
            }
        }
        if(green > 0){
            if(green > 0xAA){
                color |= this.greenColor | this.darkGreenColor;
            }else if(green > 0x55){
                color |= this.greenColor;
            }else{
                color |= this.darkGreenColor;
            }
        }
        if(blue > 0){
            if(blue > 0xAA){
                color |= this.blueColor | this.darkBlueColor;
            }else if(blue > 0x55){
                color |= this.blueColor;
            }else{
                color |= this.darkBlueColor;
            }
        }
        return this.cmdColorLcd(targetLcd,color);
    }

    // beep, 3rd byte is duration, higher == longer, I think 100ms steps
    static cmdBeep(duration: number = 0x01): Uint8Array{
        if(duration<1)
            duration=1;
        else if(duration >=256)
            duration = 255;        
        return new Uint8Array([0x03,0x00,duration]);
    }

    // clear lcd, 2nd byte is target lcd, start at 0x01
    static cmdClearLcd(targetLcd: number): Uint8Array{
        if(targetLcd<1)
            targetLcd =1;
        else if(targetLcd>16)
            targetLcd=16;
        return new Uint8Array([0x04,0x00]);
    }

    // colors
    static noColor: number = 0x00;
    static darkBlueColor: number = 0x01;
    static blueColor: number = 0x02;
    static fullBlueColor: number = this.darkBlueColor | this.blueColor;
    static darkGreenColor: number = 0x04;
    static greenColor: number = 0x08;
    static fullGreenColor: number = this.darkGreenColor | this.greenColor;
    static darkRedColor: number = 0x10;
    static redColor: number = 0x20; 
    static fullRedColor: number = this.darkRedColor | this.redColor;   
    static fullColor: number = 0x3F;
    
    // send as acknowledgement to commands
    static deviceAck: number = 0x84;
    // starter for device button data
    static deviceBtn: number = 0x82;
    // probably device info
    static deviceInfo: number = 0x81;
    // device lcd button is pressed, contains which lcd
    // 3rd byte is target lcd
    static deviceLcdBtn: Uint8Array =  new Uint8Array([0x82,0x01,0x00,0x00]);
    // turn knob button is up
    static deviceTurnBtnUp: Uint8Array =  new Uint8Array([0x82,0x02,0x11]);
    // turn knob button is down
    static deviceTurnBtnDown: Uint8Array =  new Uint8Array([0x82,0x01,0x11]);
    // turn knob is turned, with 4th byte is turn value
    static deviceTurnKnob: Uint8Array =  new Uint8Array([0x82,0x03,0x11,0x00]);    

    // all buttons
    public buttons: cp1601Lcd[] = [];
    public turnKnob: cp1601Knob = new cp1601Knob();
    public lastButtonPressed: number = 0;

    /**
     * create all buttons
     */
    public constructor(){
        for(let i=1;i<=16;i++){
            this.buttons.push(new cp1601Lcd(i));
        }
    }

    public event: EventEmitter = new EventEmitter();
    /**
     * parse incoming data, and do something in response ... 
     * @param data 
     * @returns 
     */
    public parse(data: Uint8Array|number[]): boolean{
        switch(data[0]){
            case cp1601.deviceAck: 
                this.event.emit('ack');
                break;
            case cp1601.deviceBtn:
                if(data[2] >= 1 && data[2] <= 16){
                    this.buttons[data[2]-1].pressed = data[1] == 1;
                    if(data[1] == 1){
                        this.buttons[data[2]-1].event.emit('pressed',data);
                        this.event.emit('pressed',data);
                    }else{
                        this.buttons[data[2]-1].event.emit('released',data);
                        this.event.emit('released',data);
                    }
                    this.lastButtonPressed = data[2];
                }else if(data[2] == 17){  
                    this.turnKnob.pressed = data[1] == 1;
                    this.turnKnob.value = data[3];
                    if(data[1] == 1){
                        this.turnKnob.event.emit('pressed',data);
                    }else if(data[1] == 2){
                        this.turnKnob.event.emit('released',data);
                    }else if(data[1] == 3 || data[1] == 4){                        
                        this.turnKnob.turnDirection == data[1];                                                
                        if(data[1] == 3)
                            this.turnKnob.event.emit('right',data);
                        else
                            this.turnKnob.event.emit('left',data);
                    }
                }                
                break;
            case cp1601.deviceInfo:
                this.event.emit('eventInfo',data);
                break;            
            default:
                return false;
        }        
        return true;
    }
}
