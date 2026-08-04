/* ==========================================================================
   Classe da Protagonista Laurla (Movimentação, Animação e Interação)
   ========================================================================== */

import { createLaurlaSprite, Direction } from './SpriteGenerator';
import { CorridorMap } from './Map';
import { sound } from './Audio';

export class Player {
  public x: number;
  public y: number;
  public width: number = 16;
  public height: number = 20;
  public speed: number = 2.4; // Velocidade suave e responsiva de caminhada

  public direction: Direction = 'right';
  public isMoving: boolean = false;
  private animFrame: number = 0;
  private animTimer: number = 0;
  private stepTimer: number = 0;

  private spriteSheet: HTMLCanvasElement;

  constructor(startX: number, startY: number) {
    this.x = startX;
    this.y = startY;
    this.spriteSheet = createLaurlaSprite();
  }

  public update(dt: number, moveDir: { dx: number; dy: number }, map: CorridorMap) {
    let dx = moveDir.dx;
    let dy = moveDir.dy;

    if (dx !== 0 || dy !== 0) {
      this.isMoving = true;

      // Atualiza direção principal
      if (Math.abs(dx) > Math.abs(dy)) {
        this.direction = dx > 0 ? 'right' : 'left';
      } else {
        this.direction = dy > 0 ? 'down' : 'up';
      }

      // Normaliza movimento diagonal
      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      const nextX = this.x + dx * this.speed;
      const nextY = this.y + dy * this.speed;

      // Colisão em X e Y independentes para sliding suave contra paredes
      if (!map.isSolid(nextX, this.y, this.width, this.height)) {
        this.x = nextX;
      }
      if (!map.isSolid(this.x, nextY, this.width, this.height)) {
        this.y = nextY;
      }

      // Animação de caminhada (troca de quadros)
      this.animTimer += dt;
      if (this.animTimer > 120) {
        this.animFrame = (this.animFrame + 1) % 3;
        this.animTimer = 0;
      }

      // Efeito sonoro de passos a cada intervalo
      this.stepTimer += dt;
      if (this.stepTimer > 280) {
        sound.playStep();
        this.stepTimer = 0;
      }
    } else {
      this.isMoving = false;
      this.animFrame = 0; // Quadro parado
      this.animTimer = 0;
      this.stepTimer = 0;
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

    // Desenha sombra nos pés
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(Math.round(this.x + 8), Math.round(this.y + 18), 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Desenha o sprite pixelated da Laurla
    ctx.drawImage(
      this.spriteSheet,
      srcX, srcY, frameWidth, frameHeight,
      Math.round(this.x), Math.round(this.y), frameWidth * 1.5, frameHeight * 1.5
    );
  }
}
