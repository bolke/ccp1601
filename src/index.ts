import delay = require("delay");
import { Socket } from "net";
import { cp1601 } from "./cp1601";

async function main(){  
   /* let pixels: Uint8Array = new Uint8Array([
0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00
    ]);*/
    let panel: cp1601 = new cp1601();
    let client = new Socket();
    client.connect(2071,'192.168.1.112');
    client.on('data', function(data){
        panel.parse(data);
    });

    panel.event.on('pressed', async(data) =>{
        client.write(cp1601.cmdColorLcd(data[2],cp1601.fullGreenColor));
    });

    panel.turnKnob.event.on('pressed',async (data) => {        
        client.write(cp1601.cmdBeep(1));                            
    });

    panel.turnKnob.event.on('left', async(data) => {
        client.write(cp1601.cmdColorLcd(panel.lastButtonPressed,cp1601.fullRedColor));
        panel.lastButtonPressed--;        
        client.write(cp1601.cmdColorLcd(panel.lastButtonPressed,cp1601.fullBlueColor));        
        console.log(panel.lastButtonPressed+'');
    });

    panel.turnKnob.event.on('right', async(data) => {
        client.write(cp1601.cmdColorLcd(panel.lastButtonPressed,cp1601.fullRedColor));
        panel.lastButtonPressed++;        
        client.write(cp1601.cmdColorLcd(panel.lastButtonPressed,cp1601.fullBlueColor));
        console.log(panel.lastButtonPressed+'');
    });
    
    for(let i=1;i<=16;i++){
        client.write(cp1601.cmdClearLcd(i));
        await delay(10);
    }
/*
    client.write(cp1601.cmdInitWriteLcd(1));
    await delay(5);
    client.write(cp1601.cmdWriteLcd(8));
    await delay(5);
    client.write(pixels);
    await delay(1000);*/

    while(true){
       await client.write(new Uint8Array(cp1601.cmdPoll));
       await delay(3000);
    }    
}

main();
