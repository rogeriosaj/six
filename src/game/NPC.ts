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

/* ==========================================================================
   Classe da Cadela Cait (Guia de Laurla na busca por Kora)
   Cãozinho preto com peito, patas e ponta do focinho brancos
   ========================================================================== */
import { createDogSpriteSheet } from './SpriteGenerator';

export class CaitDogNPC {
  public x: number;
  public y: number;
  public width: number = 16;
  public height: number = 20;
  public direction: Direction = 'down';

  private spriteSheet: HTMLCanvasElement;
  private animTimer: number = 0;
  private animFrame: number = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.spriteSheet = createDogSpriteSheet(false); // Cait (coleira rosa)
  }

  // Segue o jogador no mapa se estiver distante
  public followPlayer(playerX: number, playerY: number, targetDirection: Direction, dt: number) {
    const targetX = playerX - (targetDirection === 'right' ? 20 : targetDirection === 'left' ? -20 : 0);
    const targetY = playerY - (targetDirection === 'down' ? 20 : targetDirection === 'up' ? -20 : 0);

    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 16) {
      const speed = 2.2;
      this.x += (dx / dist) * speed;
      this.y += (dy / dist) * speed;

      if (Math.abs(dx) > Math.abs(dy)) {
        this.direction = dx > 0 ? 'right' : 'left';
      } else {
        this.direction = dy > 0 ? 'down' : 'up';
      }

      this.animTimer += dt;
      if (this.animTimer > 120) {
        this.animFrame = (this.animFrame + 1) % 3;
        this.animTimer = 0;
      }
    } else {
      this.animFrame = 0;
    }
  }

  public facePlayer(player: Player) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      this.direction = dx > 0 ? 'right' : 'left';
    } else {
      this.direction = dy > 0 ? 'down' : 'up';
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    const frameWidth = 16;
    const frameHeight = 20;

    let dirRow = 0;
    if (this.direction === 'down') dirRow = 0;
    if (this.direction === 'up') dirRow = 1;
    if (this.direction === 'left') dirRow = 2;
    if (this.direction === 'right') dirRow = 3;

    const srcX = this.animFrame * frameWidth;
    const srcY = dirRow * frameHeight;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(Math.round(this.x + 8), Math.round(this.y + 16), 5, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.drawImage(
      this.spriteSheet,
      srcX, srcY, frameWidth, frameHeight,
      Math.round(this.x + 2), Math.round(this.y + 4), frameWidth * 1.0, frameHeight * 1.0
    );
  }
}

/* ==========================================================================
   Classe da Cadela Kora (Irmã de Cait que se perdeu no Jardim)
   ========================================================================== */
export class KoraDogNPC {
  public x: number;
  public y: number;
  public width: number = 16;
  public height: number = 20;
  public direction: Direction = 'down';

  private spriteSheet: HTMLCanvasElement;
  private animTimer: number = 0;
  private animFrame: number = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.spriteSheet = createDogSpriteSheet(true); // Kora (coleira azul)
  }

  // Segue o jogador se estiver junto com Cait!
  public followPlayer(playerX: number, playerY: number, targetDirection: Direction, dt: number) {
    const targetX = playerX - (targetDirection === 'right' ? 36 : targetDirection === 'left' ? -36 : 12);
    const targetY = playerY - (targetDirection === 'down' ? 36 : targetDirection === 'up' ? -36 : 12);

    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 14) {
      const speed = 2.0;
      this.x += (dx / dist) * speed;
      this.y += (dy / dist) * speed;

      if (Math.abs(dx) > Math.abs(dy)) {
        this.direction = dx > 0 ? 'right' : 'left';
      } else {
        this.direction = dy > 0 ? 'down' : 'up';
      }

      this.animTimer += dt;
      if (this.animTimer > 120) {
        this.animFrame = (this.animFrame + 1) % 3;
        this.animTimer = 0;
      }
    } else {
      this.animFrame = 0;
    }
  }

  public facePlayer(player: Player) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      this.direction = dx > 0 ? 'right' : 'left';
    } else {
      this.direction = dy > 0 ? 'down' : 'up';
    }
  }

  public update(dt: number) {
    this.animTimer += dt;
    if (this.animTimer > 300) {
      this.animFrame = (this.animFrame + 1) % 3;
      this.animTimer = 0;
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    const frameWidth = 16;
    const frameHeight = 20;

    let dirRow = 0;
    if (this.direction === 'down') dirRow = 0;
    if (this.direction === 'up') dirRow = 1;
    if (this.direction === 'left') dirRow = 2;
    if (this.direction === 'right') dirRow = 3;

    const srcX = this.animFrame * frameWidth;
    const srcY = dirRow * frameHeight;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(Math.round(this.x + 8), Math.round(this.y + 16), 5, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.drawImage(
      this.spriteSheet,
      srcX, srcY, frameWidth, frameHeight,
      Math.round(this.x + 2), Math.round(this.y + 4), frameWidth * 1.0, frameHeight * 1.0
    );
  }
}


