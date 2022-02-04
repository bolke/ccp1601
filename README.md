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
[0x01]
Panel response data
[0x81, 0x01, 0x04, 0x01, 0x00, 0x00]
### Reading button presses.
### Reading knob presses.
### Reading knob turns.
### Settings lcd colors.
### Settling lcd data.
### Clearing lcd data.
