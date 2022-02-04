import delay = require("delay");
import { Socket } from "net";
import { cp1601 } from "./cp1601";
const audio = require('win-audio').speaker;

let panel: cp1601 = new cp1601();
let client = new Socket();
let pixels: number[] = [
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0xFF, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0xc0, 0x03, 0x00, 0x00, 0xc0, 0x03, 
0x00, 0x00, 0xc0, 0x03, 0x00, 0x00, 0xc0, 0x03, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0xFF, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00];

async function write(data: any, waitOnReady=true){
    if(waitOnReady){
        while(!panel.ready){        
            await delay(1);
        }
    }
    panel.ready = false;
    client.write(data);
}

async function main(){           
    client.connect(2071,'192.168.1.112');
    
    client.on('data', function(data){
        panel.parse(data);
    });            
    
    await delay(2000);

    await write(new Uint8Array(cp1601.cmdStatus));
    
    await write(cp1601.cmdInitWriteLcd(16));
    for(let i=1;i<=16;i++){
        pixels[1] = i;
        await write(new Uint8Array([0x06,i]),false);
        await write(new Uint8Array(pixels),false);    
    }
    for(let i=1;i<=16;i++){
        await write(cp1601.cmdColorLcd(i,0x00),false);
    }
    panel.event.on('pressed', async(data) =>{        
        let oldButton = panel.lastButtonPressed;        
        audio.decrease(data[3]);           
        if(oldButton != data[2]){
            await write(cp1601.cmdClearLcd(oldButton));
            await write(cp1601.cmdColorLcd(oldButton,cp1601.fullRedColor));
            await write(cp1601.cmdColorLcd(data[2],cp1601.fullGreenColor));
        }
        audio.set( (100 / 16) * data[2]);
        console.log(`audio ${audio.get()}`);
          
        await write(cp1601.cmdWriteSingleLcd(data[2],pixels),false);
        //let raw = new Uint8Array(pixels.length);
        /*await write(cp1601.cmdInitWriteLcd(1),false);
        await write(cp1601.cmdWriteLcd(data[2]),false);        
        await write(new Uint8Array(pixels),false);*/        
        await write(cp1601.cmdColorLcd(data[2],cp1601.greenColor));
    });

    panel.turnKnob.event.on('pressed',async (data) => {
        audio.toggle();   
        console.log(audio.isMuted()?'muted':'unmuted');
    });

    panel.turnKnob.event.on('left', async(data) => {
        let oldbutton = panel.lastButtonPressed;
        audio.decrease(data[3]);        
        panel.lastButtonPressed = Math.round((audio.get() / (100 / 16)));        
        if(panel.lastButtonPressed<1){
            panel.lastButtonPressed=1;
        }
        if(oldbutton != panel.lastButtonPressed){
            await write(cp1601.cmdColorLcd(oldbutton,cp1601.fullRedColor));
            await write(cp1601.cmdColorLcd(panel.lastButtonPressed,cp1601.fullBlueColor));
        }
        console.log(`audio ${audio.get()}`);
    });

    panel.turnKnob.event.on('right', async(data) => {
        let oldbutton = panel.lastButtonPressed;
        audio.increase(data[3]);        
        panel.lastButtonPressed = Math.round((audio.get() / (100 / 16)));        
        if(panel.lastButtonPressed>16){
            panel.lastButtonPressed=16;
        }
        if(oldbutton != panel.lastButtonPressed){
            await write(cp1601.cmdColorLcd(oldbutton,cp1601.fullRedColor));
            await write(cp1601.cmdColorLcd(panel.lastButtonPressed,cp1601.fullBlueColor));
        }
        console.log(`audio ${audio.get()}`);
    });
    
    for(let i=1;i<=16;i++){
        await write(cp1601.cmdColorLcd(i,cp1601.fullRedColor));        
        await write(cp1601.cmdClearLcd(i));        
    }

    panel.lastButtonPressed = Math.round((audio.get() / (100 / 16)));
    await write(cp1601.cmdColorLcd(panel.lastButtonPressed,cp1601.fullBlueColor));        
    
    while(true){
       await write(new Uint8Array(cp1601.cmdStatus));
       await delay(3000);
    }    
}

main();
