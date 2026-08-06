/* ==========================================================================
   Modal de Batalha no Estilo Pokémon Fire Red (Turn-Based Battle)
   ========================================================================== */

import { AnimalType, createAnimalSprite, createDogSpriteSheet } from '../game/SpriteGenerator';
import { sound } from '../game/Audio';

export class BattleModal {
  private modalEl: HTMLElement;
  private enemyNameEl: HTMLElement;
  private enemyHpFillEl: HTMLElement;
  private enemyCanvas: HTMLCanvasElement;
  private enemyCtx: CanvasRenderingContext2D;

  private caitHpFillEl: HTMLElement;
  private caitHpTextEl: HTMLElement;
  private caitCanvas: HTMLCanvasElement;
  private caitCtx: CanvasRenderingContext2D;

  private messageEl: HTMLElement;
  private actionsGridEl: HTMLElement;

  private btnAttack: HTMLButtonElement;
  private btnSpecial: HTMLButtonElement;
  private btnTreat: HTMLButtonElement;
  private btnRun: HTMLButtonElement;

  private isVisible: boolean = false;
  private isTurnBusy: boolean = false;

  private enemyType: AnimalType = 'bird';
  private enemyName: string = 'Passarinho';
  private enemyHp: number = 20;
  private enemyMaxHp: number = 20;

  private caitHp: number = 30;
  private caitMaxHp: number = 30;

  private onCompleteCallback: ((won: boolean) => void) | null = null;

  constructor() {
    this.modalEl = document.getElementById('battle-modal')!;
    this.enemyNameEl = document.getElementById('enemy-name')!;
    this.enemyHpFillEl = document.getElementById('enemy-hp-fill')!;
    this.enemyCanvas = document.getElementById('enemy-canvas') as HTMLCanvasElement;
    this.enemyCtx = this.enemyCanvas.getContext('2d')!;

    this.caitHpFillEl = document.getElementById('cait-hp-fill')!;
    this.caitHpTextEl = document.getElementById('cait-hp-text')!;
    this.caitCanvas = document.getElementById('cait-canvas') as HTMLCanvasElement;
    this.caitCtx = this.caitCanvas.getContext('2d')!;

    this.messageEl = document.getElementById('battle-message-text')!;
    this.actionsGridEl = document.getElementById('battle-actions-grid')!;

    this.btnAttack = document.getElementById('btn-attack') as HTMLButtonElement;
    this.btnSpecial = document.getElementById('btn-special') as HTMLButtonElement;
    this.btnTreat = document.getElementById('btn-treat') as HTMLButtonElement;
    this.btnRun = document.getElementById('btn-run') as HTMLButtonElement;

    this.bindEvents();
  }

  private bindEvents() {
    this.btnAttack.addEventListener('click', () => this.handlePlayerAction('attack'));
    this.btnSpecial.addEventListener('click', () => this.handlePlayerAction('special'));
    this.btnTreat.addEventListener('click', () => this.handlePlayerAction('treat'));
    this.btnRun.addEventListener('click', () => this.handlePlayerAction('run'));
  }

  public startBattle(animalType: AnimalType, onComplete: (won: boolean) => void) {
    this.enemyType = animalType;
    this.onCompleteCallback = onComplete;
    this.isTurnBusy = false;

    // Define nomes e atributos conforme o animal selvagem
    if (animalType === 'luna') {
      this.enemyName = 'Luna (Gatinha Branca)';
      this.enemyMaxHp = 30;
      this.enemyHp = this.enemyMaxHp;
      this.caitHp = this.caitMaxHp;
      this.enemyNameEl.textContent = this.enemyName;
      this.updateHpBars();
      this.renderSprites();

      this.messageEl.textContent = '🐾 Luna, a Gatinha Branca, apareceu! Cait ficou assustada e saiu correndo! 🙀';
      this.actionsGridEl.classList.add('hidden');
      this.modalEl.classList.remove('hidden');
      this.isVisible = true;
      sound.playEncounter();

      setTimeout(() => {
        sound.playCancel();
        this.endBattle(false);
      }, 1600);
      return;
    }

    if (animalType === 'bird') {
      this.enemyName = 'Passarinho Selvagem';
      this.enemyMaxHp = 20;
    } else if (animalType === 'rat') {
      this.enemyName = 'Ratinho Furioso';
      this.enemyMaxHp = 18;
    } else if (animalType === 'cat') {
      this.enemyName = 'Gatinho Bravo';
      this.enemyMaxHp = 25;
    } else {
      this.enemyName = 'Esquilo Travesso';
      this.enemyMaxHp = 22;
    }

    this.enemyHp = this.enemyMaxHp;
    this.caitHp = this.caitMaxHp;

    this.enemyNameEl.textContent = this.enemyName;
    this.updateHpBars();

    // Renderiza Sprites de Batalha
    this.renderSprites();

    this.messageEl.textContent = `Um ${this.enemyName} apareceu! Cait entrou na batalha!`;
    this.actionsGridEl.classList.remove('hidden');
    this.modalEl.classList.remove('hidden');
    this.isVisible = true;

    sound.playEncounter();
  }


  private renderSprites() {
    // Canvas Inimigo (Sprite frontal de Animal)
    this.enemyCtx.clearRect(0, 0, 48, 48);
    const animalSprite = createAnimalSprite(this.enemyType);
    this.enemyCtx.drawImage(animalSprite, 0, 0, 48, 48);

    // Canvas Cait (Sprite de costas/perfil de Cait)
    this.caitCtx.clearRect(0, 0, 48, 48);
    const dogSpriteSheet = createDogSpriteSheet(false);
    // Desenha Cait de costas (dir = up => frameOffsetY = 20)
    this.caitCtx.imageSmoothingEnabled = false;
    this.caitCtx.drawImage(dogSpriteSheet, 0, 20, 16, 20, 4, 4, 40, 40);
  }

  private updateHpBars() {
    const enemyPct = Math.max(0, Math.min(100, (this.enemyHp / this.enemyMaxHp) * 100));
    this.enemyHpFillEl.style.width = `${enemyPct}%`;

    const caitPct = Math.max(0, Math.min(100, (this.caitHp / this.caitMaxHp) * 100));
    this.caitHpFillEl.style.width = `${caitPct}%`;
    this.caitHpTextEl.textContent = `${Math.max(0, this.caitHp)}/${this.caitMaxHp}`;

    // Altera cor da barra de vida estilo Pokémon
    if (enemyPct < 25) this.enemyHpFillEl.style.background = '#e53935';
    else if (enemyPct < 50) this.enemyHpFillEl.style.background = '#ffb300';
    else this.enemyHpFillEl.style.background = '#4caf50';

    if (caitPct < 25) this.caitHpFillEl.style.background = '#e53935';
    else if (caitPct < 50) this.caitHpFillEl.style.background = '#ffb300';
    else this.caitHpFillEl.style.background = '#4caf50';
  }

  private handlePlayerAction(action: 'attack' | 'special' | 'treat' | 'run') {
    if (this.isTurnBusy || !this.isVisible) return;
    this.isTurnBusy = true;

    if (action === 'run') {
      sound.playCancel();
      this.messageEl.textContent = 'Cait e Laurla fugiram com segurança da batalha!';
      setTimeout(() => this.endBattle(false), 1200);
      return;
    }

    if (action === 'attack') {
      sound.playAttack();
      const dmg = Math.floor(Math.random() * 5) + 8; // 8-12 dano
      this.enemyHp = Math.max(0, this.enemyHp - dmg);
      this.updateHpBars();
      this.messageEl.textContent = `Cait usou Mordidinha! Causou ${dmg} de dano no ${this.enemyName}!`;
    } else if (action === 'special') {
      sound.playAttack();
      const dmg = Math.floor(Math.random() * 4) + 6; // 6-9 dano
      this.enemyHp = Math.max(0, this.enemyHp - dmg);
      this.updateHpBars();
      this.messageEl.textContent = `Cait deu um LATIDO FORTE! Assustou o ${this.enemyName} (${dmg} dano)!`;
    } else if (action === 'treat') {
      sound.playOpenModal();
      const heal = 12;
      this.caitHp = Math.min(this.caitMaxHp, this.caitHp + heal);
      this.updateHpBars();
      this.messageEl.textContent = `Laurla deu um Petisco saboroso para Cait! Recuperou ${heal} HP!`;
    }

    // Checa se o inimigo foi derrotado
    if (this.enemyHp <= 0) {
      setTimeout(() => {
        sound.playVictory();
        this.messageEl.textContent = `🎉 O ${this.enemyName} foi derrotado! Cait venceu a batalha!`;
        setTimeout(() => this.endBattle(true), 1800);
      }, 1000);
      return;
    }

    // Turno do Inimigo
    setTimeout(() => {
      sound.playAttack();
      const enemyDmg = Math.floor(Math.random() * 4) + 4; // 4-7 dano
      this.caitHp = Math.max(0, this.caitHp - enemyDmg);
      this.updateHpBars();
      this.messageEl.textContent = `O ${this.enemyName} contra-atacou e causou ${enemyDmg} de dano em Cait!`;

      if (this.caitHp <= 0) {
        setTimeout(() => {
          sound.playCancel();
          this.messageEl.textContent = `Cait ficou cansada! Laurla correu para proteger Cait!`;
          setTimeout(() => this.endBattle(false), 1800);
        }, 1200);
      } else {
        setTimeout(() => {
          this.messageEl.textContent = 'O que Cait deve fazer agora?';
          this.isTurnBusy = false;
        }, 1200);
      }
    }, 1200);
  }

  private endBattle(won: boolean) {
    this.modalEl.classList.add('hidden');
    this.isVisible = false;
    this.isTurnBusy = false;
    if (this.onCompleteCallback) {
      this.onCompleteCallback(won);
      this.onCompleteCallback = null;
    }
  }

  public isOpen(): boolean {
    return this.isVisible;
  }
}
