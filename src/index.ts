import { cp1601 } from "./cp1601";

let panel: cp1601 = new cp1601();
let beep = [...cp1601.cmdBeep];

beep[0] = 0x20;

panel.parse(beep);