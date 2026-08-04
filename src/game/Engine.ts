/* ==========================================================================
   Motor Principal do Jogo (Game Engine, Render Loop & Câmera)
   ========================================================================== */

import { CorridorMap, InteractivePainting } from './Map';
import { Player } from './Player';
import { LittleRogerNPC } from './NPC';
import { ControlManager } from '../ui/Controls';
import { DialogueBox } from '../ui/DialogueBox';
import { MemoryModal } from '../ui/MemoryModal';
import { loadMemories, Memory } from '../data/memories';
import { sound } from './Audio';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private map: CorridorMap;
  private player: Player;
  private rogerNPC: LittleRogerNPC;

  private controls: ControlManager;
  private dialogueBox: DialogueBox;
  private memoryModal: MemoryModal;

  private memories: Memory[];

  private promptEl: HTMLElement;

  // Câmera e Resolução com mais Zoom (Estilo clássico GBA 320x192)
  private internalWidth: number = 320; // ~10 tiles visíveis (Zoom aproximado)
  private internalHeight: number = 192; // ~6 tiles visíveis
  private cameraX: number = 0;
  private cameraY: number = 0;

  private lastTime: number = 0;
  private animTime: number = 0;

  constructor() {
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;

    this.promptEl = document.getElementById('interaction-prompt')!;

    this.map = new CorridorMap();
    // Laurla nasce no lado esquerdo do corredor (x = 2 tiles, y = 3.5 tiles)
    this.player = new Player(2 * 32, 3.5 * 32);
    // Little Roger fica esperando no final do corredor (x = 19 tiles, y = 3.5 tiles)
    this.rogerNPC = new LittleRogerNPC(19 * 32, 3.5 * 32);

    this.controls = new ControlManager();
    this.dialogueBox = new DialogueBox();
    this.memoryModal = new MemoryModal();

    this.memories = loadMemories();

    this.bindHeaderEvents();
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.startLoop();
  }

  private resizeCanvas() {
    this.canvas.width = this.internalWidth;
    this.canvas.height = this.internalHeight;
    this.ctx.imageSmoothingEnabled = false;
  }

  private bindHeaderEvents() {
    // Botão de Áudio (Mute/Unmute)
    const btnAudio = document.getElementById('btn-audio')!;
    btnAudio.addEventListener('click', () => {
      const isMuted = sound.toggleMute();
      btnAudio.textContent = isMuted ? '🔇' : '🔊';
    });

    // Botão de Ajuda
    const btnHelp = document.getElementById('btn-help')!;
    const helpModal = document.getElementById('help-modal')!;
    const helpCloseX = document.getElementById('help-close-x')!;
    const helpBtnClose = document.getElementById('help-btn-close')!;

    const toggleHelp = (show: boolean) => {
      if (show) helpModal.classList.remove('hidden');
      else helpModal.classList.add('hidden');
    };

    btnHelp.addEventListener('click', () => toggleHelp(true));
    helpCloseX.addEventListener('click', () => toggleHelp(false));
    helpBtnClose.addEventListener('click', () => toggleHelp(false));
  }

  private startLoop() {
    const loop = (timestamp: number) => {
      if (!this.lastTime) this.lastTime = timestamp;
      const dt = timestamp - this.lastTime;
      this.lastTime = timestamp;
      this.animTime += dt;

      this.update(dt);
      this.render();

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  private update(dt: number) {
    this.rogerNPC.update(dt);

    // Se houver algum modal ou diálogo aberto, bloqueia a movimentação da Laurla
    const isModalOpen = this.memoryModal.isOpen() || this.dialogueBox.isOpen();

    if (!isModalOpen) {
      const moveVector = this.controls.getMoveVector();
      this.player.update(dt, moveVector, this.map);
    }

    // Atualiza posição suave da Câmera (Centralizada na Laurla em X e Y)
    const targetCamX = this.player.x + 8 - this.internalWidth / 2;
    const maxCamX = this.map.cols * 32 - this.internalWidth;
    this.cameraX = Math.max(0, Math.min(targetCamX, maxCamX));

    const targetCamY = this.player.y + 10 - this.internalHeight / 2;
    const maxCamY = this.map.rows * 32 - this.internalHeight;
    this.cameraY = Math.max(0, Math.min(targetCamY, maxCamY));

    // Detecção de Proximidade para Aviso de Interação (Prompt)
    const facingPainting = this.map.getFacingPainting(this.player.x, this.player.y, this.player.direction);
    const isNearRoger = this.isPlayerNearRoger();

    if (!isModalOpen) {
      if (facingPainting) {
        this.promptEl.classList.remove('hidden');
        this.promptEl.innerHTML = `<span class="prompt-key">A</span> Ver Quadro ${facingPainting.id + 1}`;
      } else if (isNearRoger) {
        this.promptEl.classList.remove('hidden');
        this.promptEl.innerHTML = `<span class="prompt-key">A</span> Falar com Little Roger`;
      } else {
        this.promptEl.classList.add('hidden');
      }
    } else {
      this.promptEl.classList.add('hidden');
    }

    // Tratamento dos botões A e B
    if (this.controls.consumeATrigger()) {
      sound.startBgm(); // Garante início da música no primeiro toque do usuário
      if (this.dialogueBox.isOpen()) {
        const closed = this.dialogueBox.advance();
        if (!closed && isNearRoger) {
          // Se ainda tem mais falas, pega a próxima fala do Little Roger
          this.dialogueBox.show("Little Roger", this.rogerNPC.getNextDialogue());
        }
      } else if (this.memoryModal.isOpen()) {
        // Pressionar A no modal de memória fecha o modal
        this.memoryModal.close();
      } else if (facingPainting) {
        // Abre o modal de memória do quadro
        const memory = this.memories[facingPainting.memoryIndex];
        this.memoryModal.open(memory);
      } else if (isNearRoger) {
        // Inicia diálogo com o Little Roger
        this.rogerNPC.facePlayer(this.player);
        sound.playOpenModal();
        this.dialogueBox.show("Little Roger", this.rogerNPC.getNextDialogue());
      }
    }

    if (this.controls.consumeBTrigger()) {
      if (this.memoryModal.isOpen()) {
        this.memoryModal.close();
      } else if (this.dialogueBox.isOpen()) {
        this.dialogueBox.hide();
      }
    }
  }

  private isPlayerNearRoger(): boolean {
    const dx = Math.abs((this.player.x + 8) - (this.rogerNPC.x + 8));
    const dy = Math.abs((this.player.y + 10) - (this.rogerNPC.y + 10));
    return dx <= 28 && dy <= 28;
  }

  private render() {
    this.ctx.save();

    // Limpa fundo
    this.ctx.fillStyle = '#121216';
    this.ctx.fillRect(0, 0, this.internalWidth, this.internalHeight);

    // Aplica Translação da Câmera
    this.ctx.translate(-Math.round(this.cameraX), -Math.round(this.cameraY));

    // Renderiza o Mapa do Corredor
    this.map.render(this.ctx, this.animTime);

    // Ordenação de profundidade (Y-sorting) para renderizar quem está na frente
    if (this.player.y < this.rogerNPC.y) {
      this.player.render(this.ctx);
      this.rogerNPC.render(this.ctx, this.animTime);
    } else {
      this.rogerNPC.render(this.ctx, this.animTime);
      this.player.render(this.ctx);
    }

    this.ctx.restore();
  }
}
