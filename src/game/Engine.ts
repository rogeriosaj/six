import { CorridorMap, InteractivePainting, MapType } from './Map';
import { Player } from './Player';
import { LittleRogerNPC, CaitDogNPC, KoraDogNPC } from './NPC';
import { ControlManager } from '../ui/Controls';
import { DialogueBox } from '../ui/DialogueBox';
import { MemoryModal } from '../ui/MemoryModal';
import { KeyboardManager } from '../ui/Keyboard';
import { BattleModal } from '../ui/BattleModal';
import { loadMemories, Memory } from '../data/memories';
import { AnimalType } from './SpriteGenerator';
import { sound } from './Audio';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private map: CorridorMap;
  private player: Player;
  private rogerNPC: LittleRogerNPC;
  private caitNPC: CaitDogNPC;
  private koraNPC: KoraDogNPC;

  private controls: ControlManager;
  private dialogueBox: DialogueBox;
  private memoryModal: MemoryModal;
  private keyboard: KeyboardManager;
  private battleModal: BattleModal;

  private memories: Memory[];

  private promptEl: HTMLElement;

  private foundKora: boolean = false;
  private grassStepCounter: number = 0;

  // Estado dos Enigmas das 6 Salas Secretas (true = liberada)
  private unlockedRooms: Record<number, boolean> = {
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false
  };

  // Câmera e Resolução (Estilo clássico GBA 320x192)
  private internalWidth: number = 320;
  private internalHeight: number = 192;
  private cameraX: number = 0;
  private cameraY: number = 0;

  private lastTime: number = 0;
  private animTime: number = 0;

  constructor() {
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;

    this.promptEl = document.getElementById('interaction-prompt')!;

    this.map = new CorridorMap('main');
    this.player = new Player(2 * 32, 3.5 * 32);
    this.rogerNPC = new LittleRogerNPC(19 * 32, 3.5 * 32);
    this.caitNPC = new CaitDogNPC(1.5 * 32, 3.5 * 32); // Cait (Guia de Laurla)
    this.koraNPC = new KoraDogNPC(24 * 32, 4.5 * 32); // Kora (Irmã de Cait no Jardim)

    this.controls = new ControlManager();
    this.dialogueBox = new DialogueBox();
    this.memoryModal = new MemoryModal();
    this.keyboard = new KeyboardManager();
    this.battleModal = new BattleModal();

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
    const btnAudio = document.getElementById('btn-audio')!;
    btnAudio.addEventListener('click', () => {
      const isMuted = sound.toggleMute();
      btnAudio.textContent = isMuted ? '🔇' : '🔊';
    });

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
    if (this.foundKora) {
      this.koraNPC.update(dt);
    }

    const isModalOpen = this.memoryModal.isOpen() || this.dialogueBox.isOpen() || this.keyboard.isKeyboardOpen() || this.battleModal.isOpen();

    if (!isModalOpen) {
      const moveVector = this.controls.getMoveVector();
      this.player.update(dt, moveVector, this.map);

      // Cait e Kora seguem a Laurla fielmente no mapa!
      this.caitNPC.followPlayer(this.player.x, this.player.y, this.player.direction, dt);
      if (this.foundKora) {
        this.koraNPC.followPlayer(this.player.x, this.player.y, this.player.direction, dt);
      }

      // Checa Encontro na Grama Alta (Mapa Externo estilo Pokémon Fire Red)
      if (this.map.type === 'outside' && this.player.isMoving && this.map.isTallGrass(this.player.x, this.player.y)) {
        this.grassStepCounter++;
        if (this.grassStepCounter > 12) {
          this.grassStepCounter = 0;
          if (Math.random() < 0.35) { // 35% de chance de encontro na grama alta
            // Se Kora ainda não foi encontrada, há uma alta chance de encontrar Kora escondida nos arbustos!
            if (!this.foundKora && Math.random() < 0.45) {
              this.foundKora = true;
              this.koraNPC.x = this.player.x + 20;
              this.koraNPC.y = this.player.y;
              sound.playOpenModal();
              this.dialogueBox.show(
                "Kora & Cait 🐾",
                "AAU AAU AAU AAAAAUUUU AUAUAUAUAU!W"
              );
              return;
            }

            // Batalha com animais selvagens (Passarinho, Ratinho, Gatinho, Esquilo)
            const animals: AnimalType[] = ['bird', 'rat', 'cat', 'squirrel'];
            const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
            this.battleModal.startBattle(randomAnimal, (_won) => {
              // Batalha finalizada
            });
            return;
          }
        }
      }

      // Transições de Mapa
      // 1. Ir para Corredor Secreto
      if (this.map.type === 'main' && this.player.x >= 20.2 * 32) {
        this.switchMap('secret_corridor');
      }

      // 2. Voltar para Corredor Principal do Corredor Secreto
      if (this.map.type === 'secret_corridor' && this.player.x <= 0.8 * 32) {
        this.switchMap('main');
      }

      // 3. Voltar de Salas Secretas
      if (this.map.type.startsWith('room') && this.player.y >= 5.2 * 32) {
        const roomNum = parseInt(this.map.type.replace('room', ''), 10);
        this.switchMap('secret_corridor', roomNum);
      }

      // 4. Ir para o Jardim Externo a partir do Corredor Principal (Porta Esquerda Superior)
      if (this.map.type === 'main' && this.player.x <= 1.8 * 32 && this.player.y <= 2.2 * 32) {
        this.switchMap('outside');
      }

      // 5. Voltar do Jardim Externo para a Galeria Principal (Portal Esquerda c=0, r=9,10)
      if (this.map.type === 'outside' && this.player.x <= 0.8 * 32 && (this.player.y >= 8 * 32 && this.player.y <= 12 * 32)) {
        this.switchMap('main', 0, true);
      }
    }

    // Câmera
    const targetCamX = this.player.x + 8 - this.internalWidth / 2;
    const maxCamX = this.map.cols * 32 - this.internalWidth;
    this.cameraX = Math.max(0, Math.min(targetCamX, maxCamX));

    const targetCamY = this.player.y + 10 - this.internalHeight / 2;
    const maxCamY = this.map.rows * 32 - this.internalHeight;
    this.cameraY = Math.max(0, Math.min(targetCamY, maxCamY));

    // Proximidades
    const facingPainting = this.map.getFacingPainting(this.player.x, this.player.y, this.player.direction);
    const facingDoorNum = this.map.getFacingDoorIndex(this.player.x, this.player.y, this.player.direction);
    const isNearRoger = this.isPlayerNearRoger();
    const isNearCait = this.isPlayerNearCait();
    const isNearKora = this.foundKora && this.isPlayerNearKora();
    const isNearGardenDoor = this.map.type === 'main' && (this.player.x <= 2.5 * 32 && this.player.y <= 2.8 * 32);

    const currentRoomNum = this.map.type.startsWith('room') ? parseInt(this.map.type.replace('room', ''), 10) : 0;
    const isCurrentRoomUnlocked = currentRoomNum > 0 ? this.unlockedRooms[currentRoomNum] : false;

    if (!isModalOpen) {
      if (isNearGardenDoor) {
        this.promptEl.classList.remove('hidden');
        this.promptEl.innerHTML = `<span class="prompt-key">A</span> Entrar no Jardim Secreto`;
      } else if (isNearKora) {
        this.promptEl.classList.remove('hidden');
        this.promptEl.innerHTML = `<span class="prompt-key">A</span> Falar com Kora 🐾`;
      } else if (isNearCait) {
        this.promptEl.classList.remove('hidden');
        this.promptEl.innerHTML = `<span class="prompt-key">A</span> Falar com Cait 🐾`;
      } else if (facingDoorNum > 0) {
        this.promptEl.classList.remove('hidden');
        this.promptEl.innerHTML = `<span class="prompt-key">A</span> Entrar na Sala ${facingDoorNum}`;
      } else if (facingPainting) {
        this.promptEl.classList.remove('hidden');
        if (facingPainting.isSecret && !isCurrentRoomUnlocked) {
          this.promptEl.innerHTML = `<span class="prompt-key">A</span> Examinar Quadro Trancado`;
        } else {
          this.promptEl.innerHTML = `<span class="prompt-key">A</span> Ver Quadro ${facingPainting.isSecret ? 'Secreto' : facingPainting.id + 1}`;
        }
      } else if (isNearRoger) {
        this.promptEl.classList.remove('hidden');
        this.promptEl.innerHTML = `<span class="prompt-key">A</span> Falar com Little Roger`;
      } else {
        this.promptEl.classList.add('hidden');
      }
    } else {
      this.promptEl.classList.add('hidden');
    }

    // Botão A
    if (!this.keyboard.isKeyboardOpen() && this.controls.consumeATrigger()) {
      sound.startBgm();

      if (this.dialogueBox.isOpen()) {
        this.dialogueBox.advance();
      } else if (this.memoryModal.isOpen()) {
        this.memoryModal.close();
      } else if (isNearGardenDoor) {
        this.switchMap('outside');
      } else if (isNearKora) {
        this.koraNPC.facePlayer(this.player);
        this.caitNPC.facePlayer(this.player);
        sound.playOpenModal();
        this.dialogueBox.show(
          "Kora 🐾",
          "AAAAAAAAAAAAAUUUUUUUUUUUUUU AU!W"
        );
      } else if (isNearCait) {
        this.caitNPC.facePlayer(this.player);
        sound.playOpenModal();
        if (!this.foundKora) {
          this.dialogueBox.show(
            "Cait 🐾",
            "AU AU AU AU AUAUAUAUAU AU!"
          );
        } else {
          this.dialogueBox.show(
            "Cait 🐾",
            "Au au, au, auauauauauauauauauau! Aaaau"
          );
        }
      } else if (facingDoorNum > 0) {
        this.switchMap(`room${facingDoorNum}` as MapType);
      } else if (facingPainting) {
        if (facingPainting.isSecret && !isCurrentRoomUnlocked) {
          this.rogerNPC.facePlayer(this.player);
          sound.playOpenModal();
          this.dialogueBox.show(
            "Little Roger",
            "Este quadro está trancado por um enigma! Fale com o Little Roger para descobrir a pergunta e desvendar o segredo!"
          );
        } else {
          const memory = this.memories[facingPainting.memoryIndex];
          if (memory) {
            this.memoryModal.open(memory);
          }
        }
      } else if (isNearRoger) {
        this.rogerNPC.facePlayer(this.player);
        sound.playOpenModal();

        if (this.map.type === 'secret_corridor') {
          this.dialogueBox.show(
            "Little Roger",
            "Estas portas levam a salas com imagens secretas trancadas! Cada uma possui um enigma que você precisa responder. Entre em uma porta para tentar!"
          );
        } else if (this.map.type.startsWith('room')) {
          if (!isCurrentRoomUnlocked) {
            this.launchRiddleKeyboard(currentRoomNum);
          } else {
            this.dialogueBox.show(
              "Little Roger",
              `Você já desvendou o mistério da Sala ${currentRoomNum}! O quadro está liberado para você apreciar!`
            );
          }
        } else {
          this.dialogueBox.show("Little Roger", this.rogerNPC.getNextDialogue());
        }
      }
    }

    // Botão B
    if (!this.keyboard.isKeyboardOpen() && this.controls.consumeBTrigger()) {
      if (this.memoryModal.isOpen()) {
        this.memoryModal.close();
      } else if (this.dialogueBox.isOpen()) {
        this.dialogueBox.hide();
      }
    }
  }

  private getRiddleQuestion(roomNum: number): string {
    switch (roomNum) {
      case 1:
        return "Para revelar esta memória, responda: Qual é o doce tradicionalmente horroroso e caro que comemos?";
      case 2:
        return "Para revelar esta memória, responda: Do que é feita a acompanhante que sempre está conosco mas nunca lembramos dela?";
      case 3:
        return "Para revelar esta memória, responda: Qual é o traço tóxico do seu pato?";
      case 4:
        return "Para revelar esta memória, responda: Grande e vermelho, seu nome é?";
      case 5:
        return "Para revelar esta memória, responda: É vendido junto com a larissinha...";
      case 6:
        return "Ainda não escolhiiiiiii";
      default:
        return "Qual é a resposta para este enigma secreto?";
    }
  }

  private switchMap(targetMap: MapType, returningFromRoomNum: number = 0, returningFromOutside: boolean = false) {
    sound.playOpenModal();
    this.map = new CorridorMap(targetMap);

    if (targetMap === 'outside') {
      // Posiciona Laurla na entrada do Jardim Externo
      this.player.x = 1.5 * 32;
      this.player.y = 9.5 * 32;
      this.player.direction = 'right';

      this.caitNPC.x = 1.2 * 32;
      this.caitNPC.y = 9.5 * 32;
      this.caitNPC.direction = 'right';

      if (this.foundKora) {
        this.koraNPC.x = 1.0 * 32;
        this.koraNPC.y = 9.5 * 32;
        this.koraNPC.direction = 'right';
      }
    } else if (targetMap === 'secret_corridor') {
      if (returningFromRoomNum > 0) {
        const doorTileX = [4, 8, 12, 16, 20, 24][returningFromRoomNum - 1] || 4;
        this.player.x = doorTileX * 32;
        this.player.y = 2.5 * 32;
        this.player.direction = 'down';

        this.rogerNPC.x = (doorTileX - 1.5) * 32;
        this.rogerNPC.y = 3.5 * 32;
        this.rogerNPC.direction = 'up';
      } else {
        this.player.x = 1.5 * 32;
        this.player.y = 3.5 * 32;
        this.player.direction = 'right';

        this.rogerNPC.x = 3.5 * 32;
        this.rogerNPC.y = 3.5 * 32;
        this.rogerNPC.direction = 'left';
      }
    } else if (targetMap.startsWith('room')) {
      this.player.x = 4 * 32;
      this.player.y = 4.5 * 32;
      this.player.direction = 'up';

      this.rogerNPC.x = 5 * 32;
      this.rogerNPC.y = 2.5 * 32;
      this.rogerNPC.direction = 'left';
    } else {
      // Corredor Principal
      if (returningFromOutside) {
        this.player.x = 1.5 * 32;
        this.player.y = 3.2 * 32;
        this.player.direction = 'down';
      } else {
        this.player.x = 19.5 * 32;
        this.player.y = 3.5 * 32;
        this.player.direction = 'left';
      }

      this.rogerNPC.x = 19 * 32;
      this.rogerNPC.y = 3.5 * 32;
      this.rogerNPC.direction = 'down';
    }
  }


  private launchRiddleKeyboard(roomNum: number) {
    const question = this.getRiddleQuestion(roomNum);
    this.keyboard.show(
      `ENIGMA DA SALA ${roomNum}`,
      question,
      (answer: string) => this.handleRiddleAnswer(roomNum, answer),
      () => {
        this.dialogueBox.show("Little Roger", "Tudo bem, você pode tentar responder mais tarde!");
      }
    );
  }

  private handleRiddleAnswer(roomNum: number, answer: string) {
    this.keyboard.hide();
    const cleanAnswer = answer.toLowerCase().trim();

    let isCorrect = false;
    if (roomNum === 1 && (cleanAnswer === 'mochi' || cleanAnswer === 'mochis')) isCorrect = true;
    else if (roomNum === 2 && (cleanAnswer === 'plastico' || cleanAnswer === 'saco' || cleanAnswer === 'saquinho')) isCorrect = true;
    else if (roomNum === 3 && (cleanAnswer === 'psicopata' || cleanAnswer === 'psicopato')) isCorrect = true;
    else if (roomNum === 4 && (cleanAnswer === 'caralhudo' || cleanAnswer === 'siri caralhudo')) isCorrect = true;
    else if (roomNum === 5 && (cleanAnswer === 'piroca' || cleanAnswer === 'chocogozo')) isCorrect = true;
    else if (roomNum === 6 && (cleanAnswer === 'sete' || cleanAnswer === '7' || cleanAnswer === 'seis' || cleanAnswer === '6')) isCorrect = true;

    if (isCorrect) {
      this.unlockedRooms[roomNum] = true;
      sound.playOpenModal();
      this.dialogueBox.show(
        "Little Roger",
        `Parabéns! Você acertou! O quadro secreto da Sala ${roomNum} foi liberado!`
      );
    } else {
      sound.playCancel();
      this.dialogueBox.show(
        "Little Roger",
        `Hmm, "${answer}" não é a resposta correta... Tente responder novamente comigo!`
      );
    }
  }

  private isPlayerNearRoger(): boolean {
    const dx = Math.abs((this.player.x + 8) - (this.rogerNPC.x + 8));
    const dy = Math.abs((this.player.y + 10) - (this.rogerNPC.y + 10));
    return dx <= 38 && dy <= 38;
  }

  private isPlayerNearCait(): boolean {
    const dx = Math.abs((this.player.x + 8) - (this.caitNPC.x + 8));
    const dy = Math.abs((this.player.y + 10) - (this.caitNPC.y + 10));
    return dx <= 32 && dy <= 32;
  }

  private isPlayerNearKora(): boolean {
    const dx = Math.abs((this.player.x + 8) - (this.koraNPC.x + 8));
    const dy = Math.abs((this.player.y + 10) - (this.koraNPC.y + 10));
    return dx <= 38 && dy <= 38;
  }

  private render() {
    this.ctx.save();

    this.ctx.fillStyle = '#121216';
    this.ctx.fillRect(0, 0, this.internalWidth, this.internalHeight);

    this.ctx.translate(-Math.round(this.cameraX), -Math.round(this.cameraY));

    // Renderiza o mapa
    this.map.render(this.ctx, this.animTime, this.unlockedRooms);

    // Y-sorting para profundidade de renderização dos personagens
    const renderEntities: { y: number; draw: () => void }[] = [];

    renderEntities.push({
      y: this.player.y,
      draw: () => this.player.render(this.ctx)
    });

    renderEntities.push({
      y: this.caitNPC.y,
      draw: () => this.caitNPC.render(this.ctx)
    });

    if (this.map.type !== 'outside') {
      renderEntities.push({
        y: this.rogerNPC.y,
        draw: () => this.rogerNPC.render(this.ctx, this.animTime)
      });
    }

    if (this.foundKora) {
      renderEntities.push({
        y: this.koraNPC.y,
        draw: () => this.koraNPC.render(this.ctx)
      });
    }


    renderEntities.sort((a, b) => a.y - b.y);
    renderEntities.forEach(entity => entity.draw());

    this.ctx.restore();
  }
}
