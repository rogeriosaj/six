/* ==========================================================================
   Teclado Retro On-Screen Estilo Pokémon Fire Red
   ========================================================================== */

import { sound } from '../game/Audio';

export class KeyboardManager {
  private containerEl: HTMLElement;
  private joystickEl: HTMLElement;
  private inputTextEl: HTMLElement;
  private promptEl: HTMLElement;

  private currentValue: string = "";
  private isOpen: boolean = false;

  private onConfirmCallback: ((val: string) => void) | null = null;
  private onCancelCallback: (() => void) | null = null;

  constructor() {
    this.containerEl = document.getElementById('retro-keyboard')!;
    this.joystickEl = document.getElementById('joystick-controls')!;
    this.inputTextEl = document.getElementById('keyboard-input-text')!;
    this.promptEl = document.getElementById('keyboard-prompt') as HTMLElement;

    this.bindEvents();
  }

  private bindEvents() {
    // Botão de fechar (X)
    const closeBtn = document.getElementById('keyboard-close-x');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.cancel();
      });
    }

    // Escuta cliques nas teclas virtuais (Mouse e Touch)
    const keys = this.containerEl.querySelectorAll('.kb-key');
    keys.forEach(key => {
      const handleKeyPress = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        const target = key as HTMLButtonElement;

        if (target.id === 'kb-back') {
          this.backspace();
        } else if (target.id === 'kb-space') {
          this.typeChar(" ");
        } else if (target.id === 'kb-ok') {
          this.confirm();
        } else {
          this.typeChar(target.textContent || "");
        }
      };

      key.addEventListener('click', handleKeyPress);
    });

    // Escuta teclado físico do computador para digitação fluida
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (!this.isOpen) return;

      const key = e.key;

      if (key === 'Enter') {
        e.preventDefault();
        this.confirm();
      } else if (key === 'Backspace') {
        e.preventDefault();
        this.backspace();
      } else if (key === 'Escape') {
        e.preventDefault();
        this.cancel();
      } else if (key === ' ') {
        e.preventDefault();
        this.typeChar(" ");
      } else if (key.length === 1 && /[a-zA-Z0-9áéíóúãõâêôçÁÉÍÓÚÃÕÂÊÔÇ]/.test(key)) {
        e.preventDefault();
        this.typeChar(key.toUpperCase());
      }
    });
  }

  private typeChar(char: string) {
    if (this.currentValue.length >= 14) {
      sound.playCancel(); // Limite de caracteres
      return;
    }
    this.currentValue += char;
    this.updateDisplay();
    sound.playSelect();
  }

  private backspace() {
    if (this.currentValue.length > 0) {
      this.currentValue = this.currentValue.slice(0, -1);
      this.updateDisplay();
      sound.playCancel();
    }
  }

  private confirm() {
    if (this.onConfirmCallback) {
      sound.playSelect();
      this.onConfirmCallback(this.currentValue.trim());
    }
  }

  private cancel() {
    this.hide();
    if (this.onCancelCallback) {
      sound.playCancel();
      this.onCancelCallback();
    }
  }

  private updateDisplay() {
    this.inputTextEl.textContent = this.currentValue;
  }

  public show(title: string, prompt: string, onConfirm: (val: string) => void, onCancel?: () => void) {
    const titleEl = document.getElementById('keyboard-room-title');
    if (titleEl) {
      titleEl.textContent = title;
    }
    if (this.promptEl) {
      this.promptEl.textContent = prompt;
    }

    this.currentValue = "";
    this.updateDisplay();

    this.onConfirmCallback = onConfirm;
    this.onCancelCallback = onCancel || null;

    if (this.containerEl) this.containerEl.classList.remove('hidden');
    this.isOpen = true;

    sound.playOpenModal();
  }

  public hide() {
    if (this.containerEl) this.containerEl.classList.add('hidden');
    if (this.joystickEl) this.joystickEl.classList.remove('hidden');
    this.isOpen = false;
  }

  public isKeyboardOpen(): boolean {
    return this.isOpen;
  }
}
