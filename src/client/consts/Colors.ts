import * as Phaser from "phaser";

export default {
  Blue1: 0xbce0f0,
  Blue2: 0x219ebc,
  Blue3: 0x115d72,
  Background: 0x010d14,
  Orange1: 0xffb703,
  Orange2: 0xfd9e02,
  Orange3: 0xfb8500,
  Green: 0x00dd00,
  Red: 0xdd0000,
  White: 0xffffff,
  Black: 0x000000,
  Gray: 0xbbbbbb,
  Metal: 0x8e9ebf,
  getHex(color: number) {
    return Phaser.Display.Color.IntegerToColor(color).rgba;
  },
};
