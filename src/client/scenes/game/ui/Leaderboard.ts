import Colors from "client/consts/Colors";
import Fonts from "client/consts/Fonts";
import { LeaderboardRowState } from "common/schema/LeaderboardRowState";
import Phaser from "phaser";

export default class Headerboard extends Phaser.GameObjects.Container {
  nameLabels: Phaser.GameObjects.BitmapText[] = [];
  scoreLabels: Phaser.GameObjects.BitmapText[] = [];
  scores = {};
  maxRows: number;
  playerSessionId: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    maxRows: number,
    playerSessionId: string
  ) {
    super(scene, x, y);
    this.maxRows = maxRows;
    this.playerSessionId = playerSessionId;

    this.add(
      this.scene.add
        .rectangle(0, 0, width, height, Colors.White, 0.05)
        .setOrigin(0, 0)
    );

    for (let i = 0; i < this.maxRows; i++) {
      const nameLabel = this.scene.add
        .bitmapText(8, 8 + i * 25, Fonts.Pixel, "", 24)
        .setTint(Colors.Orange1)
        .setOrigin(0, 0) as Phaser.GameObjects.BitmapText;
      this.nameLabels.push(nameLabel);
      this.add(nameLabel);

      const scoreLabel = this.scene.add
        .bitmapText(width - 8, 8 + i * 25, Fonts.Pixel, "", 24)
        .setOrigin(1, 0) as Phaser.GameObjects.BitmapText;
      this.scoreLabels.push(scoreLabel);
      this.add(scoreLabel);
    }

    this.scene.add.existing(this);
  }

  update(sessionId: string, { name, score }: LeaderboardRowState) {
    this.scores[sessionId] = { name, score, sessionId };

    const rows: any[] = Object.values(this.scores)
      .sort((s1: any, s2: any) => {
        if (s1.score === s2.score) {
          return s2.name > s1.name ? -1 : 1;
        }
        return s2.score - s1.score;
      })
      .slice(0, this.maxRows);

    for (let i = 0; i < this.maxRows; i++) {
      if (rows.length > i) {
        const row = rows[i];
        const color =
          row.sessionId === this.playerSessionId
            ? Colors.Green
            : Colors.Orange1;
        this.nameLabels[i].setText(row.name).setTint(color);
        this.scoreLabels[i].setText(row.score).setTint(color);
      } else {
        this.nameLabels[i].setText("").setTint(Colors.Orange1);
        this.scoreLabels[i].setText("").setTint(Colors.Orange1);
      }
    }
  }
}
