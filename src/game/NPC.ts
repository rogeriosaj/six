/* ==========================================================================
   Classe do NPC Little Roger (Cabelo Escuro, Óculos Preto, Diálogos & Reações)
   ========================================================================== */

import { createLittleRogerSprite, Direction } from './SpriteGenerator';
import { Player } from './Player';

export class LittleRogerNPC {
  public x: number;
  public y: number;
  public width: number = 16;
  public height: number = 20;

  public direction: Direction = 'down';
  private spriteSheet: HTMLCanvasElement;

  // Lista de Falas Divertidas e Carinhosas do Little Roger
  public dialogues: string[] = [
    "Que foi??",
    "Fon Fon"
  ];

  private currentDialogueIdx: number = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.spriteSheet = createLittleRogerSprite();
  }

  // Virar para a direção de Laurla quando ela fala com ele
  public facePlayer(player: Player) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      this.direction = dx > 0 ? 'right' : 'left';
    } else {
      this.direction = dy > 0 ? 'down' : 'up';
    }
  }

  public getNextDialogue(): string {
    const text = this.dialogues[this.currentDialogueIdx];
    this.currentDialogueIdx = (this.currentDialogueIdx + 1) % this.dialogues.length;
    return text;
  }

  public update(_dt: number) {
    // Atualizações do NPC se necessário
  }

  public render(ctx: CanvasRenderingContext2D, _animTime: number) {
    const frameWidth = 16;
    const frameHeight = 20;

    let dirRow = 0;
    if (this.direction === 'down') dirRow = 0;
    if (this.direction === 'up') dirRow = 1;
    if (this.direction === 'left') dirRow = 2;
    if (this.direction === 'right') dirRow = 3;

    const srcX = 0; // Parado
    const srcY = dirRow * frameHeight;

    // Sombra
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(Math.round(this.x + 8), Math.round(this.y + 18), 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sprite do Little Roger
    ctx.drawImage(
      this.spriteSheet,
      srcX, srcY, frameWidth, frameHeight,
      Math.round(this.x), Math.round(this.y), frameWidth * 1.5, frameHeight * 1.5
    );
  }
}
