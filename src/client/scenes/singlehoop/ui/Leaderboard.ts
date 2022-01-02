import { LeaderboardRowState } from "common/schema/LeaderboardRowState";
import Phaser from "phaser";

const defaultColor = "#ffdd00";
const playerColor = "#00dd00";
export default class Headerboard extends Phaser.GameObjects.Container {
  nameLabels: Phaser.GameObjects.Text[] = [];
  scoreLabels: Phaser.GameObjects.Text[] = [];
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
        .rectangle(0, 0, width, height, 0xffffff, 0.05)
        .setOrigin(0, 0)
    );

    for (let i = 0; i < this.maxRows; i++) {
      const nameLabel = this.scene.add
        .text(8, 8 + i * 25, "", {
          font: `24px Arial`,
          color: defaultColor,
          fixedWidth: width * 0.75,
        })
        .setOrigin(0, 0) as Phaser.GameObjects.Text;
      this.nameLabels.push(nameLabel);
      this.add(nameLabel);

      const scoreLabel = this.scene.add
        .text(width - 8, 8 + i * 25, "", {
          font: `24px Arial`,
          color: defaultColor,
          align: "right",
        })
        .setOrigin(1, 0) as Phaser.GameObjects.Text;
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
          row.sessionId === this.playerSessionId ? playerColor : defaultColor;
        this.nameLabels[i].setText(row.name).setColor(color);
        this.scoreLabels[i].setText(row.score).setColor(color);
      } else {
        this.nameLabels[i].setText("").setColor(defaultColor);
        this.scoreLabels[i].setText("").setColor(defaultColor);
      }
    }
  }
}
