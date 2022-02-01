import delay = require("delay");
import { Socket } from "net";
import { cp1601 } from "./cp1601";
const audio = require('win-audio').speaker;

let panel: cp1601 = new cp1601();
let client = new Socket();
let pixels: Uint8Array = new Uint8Array(256);

async function write(data: any){
    while(!panel.ready){        
        await delay(1);
    }
    panel.ready = false;
    client.write(data);
}

async function main(){      
    pixels.fill(0xFF);    
    client.connect(2071,'192.168.1.112');
    
    client.on('data', function(data){
        panel.parse(data);
    });            
    
    await delay(2000);

    await write(new Uint8Array(cp1601.cmdPoll));
    
    panel.event.on('pressed', async(data) =>{        
        let oldbutton = panel.lastButtonPressed;        
        audio.decrease(data[3]);           
        if(oldbutton != data[2]){
            await write(cp1601.cmdColorLcd(oldbutton,cp1601.fullRedColor));
            await write(cp1601.cmdColorLcd(data[2],cp1601.fullGreenColor));
        }
        audio.set( (100 / 16) * data[2]);
        console.log(`audio ${audio.get()}`);
                
        await write(cp1601.cmdInitWriteLcd(1));        
        await write(cp1601.cmdWriteLcd(data[2]));        
        await write(new Uint8Array(pixels));        
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
       await write(new Uint8Array(cp1601.cmdPoll));
       await delay(3000);
    }    
}

main();
