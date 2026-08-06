/* ==========================================================================
   Mapa do Corredor de Memórias (Pokémon Fire Red Gallery Map)
   ========================================================================== */

import { createMapTileSet } from './SpriteGenerator';
import { Memory } from '../data/memories';

export interface InteractivePainting {
  id: number;
  tileX: number;
  tileY: number;
  memoryIndex: number;
  isSecret?: boolean;
}

export type MapType = 'main' | 'secret_corridor' | 'room1' | 'room2' | 'room3' | 'room4' | 'room5' | 'room6' | 'outside';

export interface InteractivePainting {
  id: number;
  tileX: number;
  tileY: number;
  memoryIndex: number;
  isSecret?: boolean;
}

export class CorridorMap {
  public type: MapType;
  public readonly cols: number;
  public readonly rows: number;
  public readonly tileSize: number = 32;

  private tileSet: HTMLCanvasElement;
  public paintings: InteractivePainting[] = [];
  public outsideGrid: number[][] = [];

  constructor(type: MapType = 'main') {
    this.type = type;
    this.tileSet = createMapTileSet();

    if (type === 'main') {
      this.cols = 22;
      this.rows = 8;
    } else if (type === 'secret_corridor') {
      this.cols = 28; // Espaço para 6 portas espaçadas
      this.rows = 8;
    } else if (type === 'outside') {
      this.cols = 36;
      this.rows = 20;
      this.generateOutsideGrid();
    } else {
      // Salas Secretas (room1 até room6)
      this.cols = 9;
      this.rows = 7;
    }

    this.setupPaintings();
  }

  // Gera o grid de tiles para o mapa externo estilo Pokémon Fire Red (Expandido com Rio e Pontes)
  private generateOutsideGrid() {
    this.outsideGrid = [];
    for (let r = 0; r < this.rows; r++) {
      const row: number[] = [];
      for (let c = 0; c < this.cols; c++) {
        // Borda de Árvores
        if (r === 0 || r === 1 || r === this.rows - 1 || c === 0 || c === this.cols - 1) {
          // Portal de entrada (c=0, r=9, 10)
          if (c === 0 && (r === 9 || r === 10)) {
            row.push(13); // Portal de volta para a galeria
          } else {
            row.push(r % 2 === 0 ? 9 : 10); // Árvores
          }
        }
        // Rio Fluindo do topo ao fundo (colunas 17 e 18)
        else if (c === 17 || c === 18) {
          // Pontes de Madeira sobre o Rio
          if ((r >= 5 && r <= 6) || (r >= 13 && r <= 14)) {
            row.push(15); // Ponte de madeira
          } else {
            row.push(14); // Rio / Água
          }
        }
        else {
          // Caminhos de Terra cruzando o mapa e conectando as pontes
          if ((r === 9 || r === 10) && c >= 1 && c <= 34) {
            row.push(12); // Caminho Principal Leste-Oeste
          } else if ((c === 15 || c === 16 || c === 19 || c === 20) && ((r >= 5 && r <= 6) || (r >= 13 && r <= 14))) {
            row.push(12); // Caminho de acesso às pontes
          }
          // Campos de Grama Alta com Animais e Kora
          else if (c >= 4 && c <= 13 && (r >= 3 && r <= 7)) {
            row.push(8); // Grama Alta Oeste Norte
          } else if (c >= 4 && c <= 13 && (r >= 12 && r <= 16)) {
            row.push(8); // Grama Alta Oeste Sul
          } else if (c >= 22 && c <= 32 && (r >= 3 && r <= 7)) {
            row.push(8); // Grama Alta Leste Norte
          } else if (c >= 22 && c <= 32 && (r >= 12 && r <= 16)) {
            row.push(8); // Grama Alta Leste Sul
          }
          // Canteiros de Flores
          else if ((c >= 14 && c <= 16 && r >= 3 && r <= 4) || (c >= 31 && c <= 34 && r >= 9 && r <= 10)) {
            row.push(11);
          } else {
            row.push(7); // Gramado verde
          }
        }
      }
      this.outsideGrid.push(row);
    }
  }

  // Verifica se a posição dada é Grama Alta (arbusto com chance de encontrar animais)
  public isTallGrass(x: number, y: number): boolean {
    if (this.type !== 'outside' || this.outsideGrid.length === 0) return false;
    const tileX = Math.floor((x + 8) / this.tileSize);
    const tileY = Math.floor((y + 14) / this.tileSize);
    if (tileY >= 0 && tileY < this.rows && tileX >= 0 && tileX < this.cols) {
      return this.outsideGrid[tileY][tileX] === 8;
    }
    return false;
  }

  private setupPaintings() {
    if (this.type === 'main') {
      const paintingPositions = [3, 6, 9, 12, 15, 18];
      paintingPositions.forEach((posX, idx) => {
        this.paintings.push({
          id: idx,
          tileX: posX,
          tileY: 1,
          memoryIndex: idx
        });
      });
    } else if (this.type.startsWith('room')) {
      const roomNum = parseInt(this.type.replace('room', ''), 10);
      const memoryIdx = 5 + roomNum;

      this.paintings.push({
        id: 0,
        tileX: 4,
        tileY: 1,
        memoryIndex: memoryIdx,
        isSecret: true
      });
    }
  }

  // Verifica se uma posição em pixels está colidindo com obstáculos
  public isSolid(x: number, y: number, width: number = 16, height: number = 16): boolean {
    const minTileX = Math.floor(x / this.tileSize);
    const maxTileX = Math.floor((x + width - 1) / this.tileSize);
    const minTileY = Math.floor(y / this.tileSize);
    const maxTileY = Math.floor((y + height - 1) / this.tileSize);

    if (this.type === 'main') {
      // Passagem lateral direita para Corredor Secreto
      if (maxTileX >= this.cols - 1 && minTileY >= 3 && maxTileY <= 5) {
        return false;
      }
      // Passagem superior para o Jardim Externo (tile col 1, row 2)
      if (minTileX >= 0 && maxTileX <= 2 && minTileY <= 2) {
        return false;
      }
      if (minTileX < 1 || maxTileX >= this.cols - 1 || minTileY < 2 || maxTileY >= this.rows - 1) {
        return true;
      }
      if ((minTileX === 1 || minTileX === 20) && minTileY === 2) {
        return true;
      }
    } else if (this.type === 'secret_corridor') {
      if (minTileX <= 0 && minTileY >= 3 && maxTileY <= 5) {
        return false;
      }
      if (minTileX < 1 || maxTileX >= this.cols - 1 || minTileY < 2 || maxTileY >= this.rows - 1) {
        return true;
      }
    } else if (this.type === 'outside') {
      // Portal de saída à esquerda (c=0, r=9,10)
      if (minTileX <= 0 && minTileY >= 8 && maxTileY <= 11) {
        return false;
      }
      // Colisão com borda de árvores
      if (minTileX < 1 || maxTileX >= this.cols - 1 || minTileY < 2 || maxTileY >= this.rows - 1) {
        return true;
      }
      // Checa colisão com o Rio (Tile 14)
      for (let r = minTileY; r <= maxTileY; r++) {
        for (let c = minTileX; c <= maxTileX; c++) {
          if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
            if (this.outsideGrid[r][c] === 14) { // Rio / Água
              return true;
            }
          }
        }
      }
    } else if (this.type.startsWith('room')) {
      if (minTileX === 4 && maxTileX === 4 && maxTileY >= this.rows - 1) {
        return false;
      }
      if (minTileX < 1 || maxTileX >= this.cols - 1 || minTileY < 2 || maxTileY >= this.rows - 1) {
        return true;
      }
    }

    return false;
  }

  public getFacingDoorIndex(playerX: number, playerY: number, direction: string): number {
    if (this.type !== 'secret_corridor' || direction !== 'up') return 0;

    const centerPlayerX = playerX + 8;
    const playerTileX = Math.floor(centerPlayerX / this.tileSize);
    const playerTileY = Math.floor((playerY + 8) / this.tileSize);

    if (playerTileY !== 2) return 0;

    const doorPositions = [4, 8, 12, 16, 20, 24];
    for (let i = 0; i < doorPositions.length; i++) {
      if (playerTileX === doorPositions[i]) {
        return i + 1;
      }
    }
    return 0;
  }

  public getFacingPainting(playerX: number, playerY: number, direction: string): InteractivePainting | null {
    if (direction !== 'up') return null;

    const centerPlayerX = playerX + 8;
    const playerTileX = Math.floor(centerPlayerX / this.tileSize);
    const playerTileY = Math.floor((playerY + 8) / this.tileSize);

    if (playerTileY !== 2) return null;

    for (const p of this.paintings) {
      if (playerTileX === p.tileX) {
        return p;
      }
    }
    return null;
  }

  public render(ctx: CanvasRenderingContext2D, animTime: number, unlockedRooms: Record<number, boolean> = {}) {
    ctx.imageSmoothingEnabled = false;

    if (this.type === 'outside') {
      // Renderiza o grid do jardim externo
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const destX = c * this.tileSize;
          const destY = r * this.tileSize;
          const tileId = this.outsideGrid[r][c];

          // Calcula posição do tile no tileset
          let srcX = 0;
          let srcY = 0;

          if (tileId === 7) { srcX = 224; srcY = 0; } // Grama
          else if (tileId === 8) { srcX = 0; srcY = 32; } // Grama Alta / Arbusto
          else if (tileId === 9) { srcX = 32; srcY = 32; } // Árvore topo
          else if (tileId === 10) { srcX = 64; srcY = 32; } // Tronco árvore
          else if (tileId === 11) { srcX = 96; srcY = 32; } // Flores
          else if (tileId === 12) { srcX = 128; srcY = 32; } // Terra
          else if (tileId === 13) { srcX = 160; srcY = 32; } // Portal
          else if (tileId === 14) { srcX = 192; srcY = 32; } // Rio / Água
          else if (tileId === 15) { srcX = 224; srcY = 32; } // Ponte de madeira


          ctx.drawImage(this.tileSet, srcX, srcY, 32, 32, destX, destY, 32, 32);
        }
      }
      return;
    }

    // Renderiza chão e paredes dos corredores/salas
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const destX = c * this.tileSize;
        const destY = r * this.tileSize;

        if (r < 2) {
          if (this.type === 'main' && c === 1 && r === 1) {
            // Portal para o Jardim Externo
            ctx.drawImage(this.tileSet, 160, 32, 32, 32, destX, destY, 32, 32);
          } else if (this.type === 'secret_corridor' && [4, 8, 12, 16, 20, 24].includes(c) && r === 1) {
            ctx.drawImage(this.tileSet, 160, 0, 32, 32, destX, destY, 32, 32);
          } else {
            ctx.drawImage(this.tileSet, 64, 0, 32, 32, destX, destY, 32, 32);
          }
        } else if (r === this.rows - 1) {
          if (this.type.startsWith('room') && c === 4) {
            ctx.drawImage(this.tileSet, 32, 0, 32, 32, destX, destY, 32, 32);
          } else {
            ctx.fillStyle = '#1b1b22';
            ctx.fillRect(destX, destY, 32, 32);
            ctx.fillStyle = '#37474f';
            ctx.fillRect(destX, destY, 32, 4);
          }
        } else if (c === 0) {
          if (this.type === 'secret_corridor' && (r === 4 || r === 5)) {
            ctx.drawImage(this.tileSet, 32, 0, 32, 32, destX, destY, 32, 32);
          } else {
            ctx.fillStyle = '#263238';
            ctx.fillRect(destX, destY, 32, 32);
          }
        } else if (c === this.cols - 1) {
          if (this.type === 'main' && (r === 4 || r === 5)) {
            ctx.drawImage(this.tileSet, 32, 0, 32, 32, destX, destY, 32, 32);
          } else {
            ctx.fillStyle = '#263238';
            ctx.fillRect(destX, destY, 32, 32);
          }
        } else {
          if ((this.type === 'main' || this.type === 'secret_corridor') && r >= 4 && r <= 5) {
            ctx.drawImage(this.tileSet, 32, 0, 32, 32, destX, destY, 32, 32);
          } else if (this.type.startsWith('room') && c === 4 && r >= 2) {
            ctx.drawImage(this.tileSet, 32, 0, 32, 32, destX, destY, 32, 32);
          } else {
            ctx.drawImage(this.tileSet, 0, 0, 32, 32, destX, destY, 32, 32);
          }
        }
      }
    }

    if (this.type === 'main') {
      ctx.drawImage(this.tileSet, 128, 0, 32, 32, 1 * this.tileSize, 2 * this.tileSize, 32, 32);
      ctx.drawImage(this.tileSet, 128, 0, 32, 32, (this.cols - 2) * this.tileSize, 2 * this.tileSize, 32, 32);
    } else if (this.type === 'secret_corridor') {
      ctx.drawImage(this.tileSet, 128, 0, 32, 32, 1 * this.tileSize, 2 * this.tileSize, 32, 32);
      ctx.drawImage(this.tileSet, 128, 0, 32, 32, (this.cols - 2) * this.tileSize, 2 * this.tileSize, 32, 32);
    } else if (this.type.startsWith('room')) {
      ctx.drawImage(this.tileSet, 128, 0, 32, 32, 1 * this.tileSize, 2 * this.tileSize, 32, 32);
      ctx.drawImage(this.tileSet, 128, 0, 32, 32, (this.cols - 2) * this.tileSize, 2 * this.tileSize, 32, 32);
    }

    // Renderiza os Quadros nas paredes
    this.paintings.forEach((p, idx) => {
      const px = p.tileX * this.tileSize;
      const py = p.tileY * this.tileSize - 12;

      let isLocked = false;
      if (p.isSecret && this.type.startsWith('room')) {
        const roomNum = parseInt(this.type.replace('room', ''), 10);
        isLocked = !unlockedRooms[roomNum];
      }

      if (isLocked) {
        ctx.drawImage(this.tileSet, 192, 0, 32, 32, px, py, 32, 32);
      } else {
        ctx.drawImage(this.tileSet, 96, 0, 32, 32, px, py, 32, 32);
      }

      ctx.fillStyle = isLocked ? '#e53935' : '#fbc02d';
      ctx.fillRect(px + 8, py + 26, 16, 10);
      ctx.fillStyle = isLocked ? '#ffffff' : '#212121';
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(isLocked ? '🔒' : `${idx + 1}`, px + 16, py + 34);

      const pulse = Math.sin(animTime * 0.005 + idx) * 0.4 + 0.6;
      ctx.strokeStyle = isLocked ? `rgba(229, 57, 53, ${pulse})` : `rgba(255, 215, 0, ${pulse})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(px + 1, py + 3, 30, 24);
    });
  }
}

