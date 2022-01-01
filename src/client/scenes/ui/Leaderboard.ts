import { LeaderboardRowState } from "common/schema/LeaderboardRowState";
import Phaser from "phaser";

export default class Headerboard extends Phaser.GameObjects.Container {
  namesLabel: Phaser.GameObjects.Text;
  scoresLabel: Phaser.GameObjects.Text;
  scores = {};

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    super(scene, x, y);

    this.add(
      this.scene.add
        .rectangle(0, 0, width, height, 0xffffff, 0.05)
        .setOrigin(0, 0)
    );

    this.namesLabel = this.scene.add
      .text(8, 8, "Loading..", {
        font: `16px Arial`,
        color: "#ffdd00",
      })
      .setOrigin(0, 0) as Phaser.GameObjects.Text;
    this.add(this.namesLabel);

    this.scoresLabel = this.scene.add
      .text(248, 8, "", {
        font: `16px Arial`,
        color: "#ffdd00",
        align: "right",
      })
      .setOrigin(1, 0) as Phaser.GameObjects.Text;
    this.add(this.scoresLabel);

    this.scene.add.existing(this);
  }

  update(sessionId: string, { name, score }: LeaderboardRowState) {
    this.scores[sessionId] = { name, score };
    const scores = Object.values(this.scores).sort((s1: any, s2: any) => {
      if (s1.score === s2.score) {
        return s2.name > s1.name ? -1 : 1;
      }
      return s2.score - s1.score;
    });
    this.namesLabel.setText(scores.map((s: any) => s.name).join("\n"));
    this.scoresLabel.setText(scores.map((s: any) => s.score).join("\n"));
  }
}
