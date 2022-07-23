# tldr
streamdeck alternative ...

# cp1601-server
An interface to a cp1601 lcd / button bar. 16 buttons, rgb leds, 64x32 pixels of lcd's and a knob which goes past eleven. 
All information in the program has been reverse engineered, using some of the most complex techniques known to man, and sleep deprivation.
Or wireshark. Luckily it's quite a simple protocol.
-
## Functionality: 
### Connecting to the device
When the device is connected to a dhcp server, it will show its ip address on the buttons / lcds. 
Open a tcp socket to that adres, using port 2071. This connection needs to be kept alive. If there's no 
activity for ~5 seconds, the device will revert to the ip address showing state.

![cpp1601](https://user-images.githubusercontent.com/745449/152605178-86d1878e-e9d6-48e7-bcd8-f49059785825.png)

### Keeping the connection alive.
Sending a hex 0x01 requests status info of the device. The device will respond with a 6 byte value, 
containing some status information. I haven't figured out what's what, but it seems to be version info and 
possibly information about the power supply, which is in use. 

Server send  
*[0x01]*  
Panel response  
*[0x81, 0x01, 0x04, 0x01, 0x00, 0x00]*  
### Receiving button presses.
When a button is pressed, the panel will send a string containing information about which button is pressed
or released. It does this for all 16 of the buttons, and the turn knob.
In the example button 6 is pressed, but this could be any of the buttons, ranging from 0x01 to 0x0f (1-16).  
  
Button 6 is pressed, panel sends  
*[0x82,0x01,0x06,0x00]*  
Button 6 is released, panel sends  
*[0x82,0x02,0x06,0x00]*  
### Receiving knob presses.
When pressed, the panel will send 
*[0x82,0x01,0x10,0x00]*  
  
When released  
*[0x82,0x02,0x10,0x00]*  

So you've got 17 push buttons, of which the last one is a knob.  
### Receiving knob turns.
When the knob is turns, the panel will send the direction and force of the turn.  
*[0x82,0x03,0x10,0x03]*  
here the last value is the force of the turn. Small value, small turn, higher value, bit more 
forcefull. Normally this is between 1 and 4, and bigger turns might turn it up to 10, 11, or higher. Who knows.
### Settings lcd colors.
3 byte command, first a 0x05, then the button number, 0x01 -> 0x0f (1-16), then a colour.
Red green and blue each have 4 levels of brightness, off, dark, normal, bright. 

``` // a colour list, these can be combined to create new colors, like Bob Ross did.   
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
```
    
Server sends button 4 to be red 
*[0x05,0x04,0x20]*  
Panel responds with
*[0x84]* 

The server responds to successfully send commands with a acknowledge, in the form of the byte 0x84
It seems as if only the get status information commands has a different response. 
If the sending of data for a commands hasn't been finished, the acknowledge won't show up. It'll only
be send when the complete command has been send. 
### Beep
Send beep command, with duration. Device does beep for a period of time ... amazing.
The last byte send determines how long the beep lasts. More is longer. I don't know how long one unit is,
but it feels like 1 == 100ms ... but that's a guess.  
*[0x03,0x00,0x01]*  
Panel goes beep and sends  
*[0x84]*  

### Setting lcd data.
<to be done, see code for now>
### Clearing lcd data.
<to be done, see code for now>

