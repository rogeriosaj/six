/* ==========================================================================
   Gerenciador da Caixa de Diálogo Estilo Pokémon Fire Red
   ========================================================================== */

import { sound } from '../game/Audio';

export class DialogueBox {
  private containerEl: HTMLElement;
  private speakerEl: HTMLElement;
  private textEl: HTMLElement;
  private arrowEl: HTMLElement;

  private isVisible: boolean = false;
  private fullText: string = "";
  private currentText: string = "";
  private charIndex: number = 0;
  private typewriterInterval: number | null = null;
  private onCompleteCallback: (() => void) | null = null;

  constructor() {
    this.containerEl = document.getElementById('dialogue-box')!;
    this.speakerEl = document.getElementById('dialogue-speaker')!;
    this.textEl = document.getElementById('dialogue-text')!;
    this.arrowEl = document.getElementById('dialogue-arrow')!;
  }

  public show(speaker: string, text: string, onComplete?: () => void) {
    this.fullText = text;
    this.currentText = "";
    this.charIndex = 0;
    this.onCompleteCallback = onComplete || null;

    this.speakerEl.textContent = speaker;
    this.textEl.textContent = "";
    this.arrowEl.classList.add('hidden');
    this.containerEl.classList.remove('hidden');
    this.isVisible = true;

    this.startTypewriter();
  }

  private startTypewriter() {
    if (this.typewriterInterval !== null) {
      clearInterval(this.typewriterInterval);
    }

    this.typewriterInterval = window.setInterval(() => {
      if (this.charIndex < this.fullText.length) {
        this.currentText += this.fullText[this.charIndex];
        this.textEl.textContent = this.currentText;
        this.charIndex++;

        // Som retro de digitação a cada 2 caracteres
        if (this.charIndex % 2 === 0) {
          sound.playTextBlip();
        }
      } else {
        this.finishTypewriter();
      }
    }, 28); // Digitação no ritmo característico do GBA
  }

  public finishTypewriter() {
    if (this.typewriterInterval !== null) {
      clearInterval(this.typewriterInterval);
      this.typewriterInterval = null;
    }
    this.currentText = this.fullText;
    this.textEl.textContent = this.fullText;
    this.arrowEl.classList.remove('hidden');
  }

  public advance(): boolean {
    // Se ainda está digitando, completa o texto instantaneamente no primeiro clique
    if (this.charIndex < this.fullText.length) {
      this.finishTypewriter();
      return false; // Ainda não fechou
    }

    // Se já terminou de digitar, fecha o balão
    this.hide();
    if (this.onCompleteCallback) {
      this.onCompleteCallback();
    }
    return true; // Fechou com sucesso
  }

  public hide() {
    if (this.typewriterInterval !== null) {
      clearInterval(this.typewriterInterval);
      this.typewriterInterval = null;
    }
    this.containerEl.classList.add('hidden');
    this.isVisible = false;
    sound.playCancel();
  }

  public isOpen(): boolean {
    return this.isVisible;
  }
}
