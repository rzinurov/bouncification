import * as Phaser from "phaser";

export default {
  Color1: 0xc7cff2,
  Color2: 0xa1b7ed,
  Color3: 0x8e9ebf,
  Color4: 0x606994,
  Color5: 0x192730,
  Color6: 0x2e3b43,
  getHex(color: number) {
    return Phaser.Display.Color.IntegerToColor(color).rgba;
  },
};
