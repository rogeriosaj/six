/* ==========================================================================
   Gerenciador de Controles Touch Mobile-First & Teclado PC
   ========================================================================== */

export class ControlManager {
  // Estado dos botões de direção
  public upPressed: boolean = false;
  public downPressed: boolean = false;
  public leftPressed: boolean = false;
  public rightPressed: boolean = false;

  // Estado dos botões de ação
  public aPressed: boolean = false;
  public bPressed: boolean = false;

  // Triggers de clique único
  private aTriggered: boolean = false;
  private bTriggered: boolean = false;

  constructor() {
    this.bindTouchControls();
    this.bindKeyboardControls();
  }

  private bindTouchControls() {
    const bindBtn = (id: string, onPress: () => void, onRelease: () => void) => {
      const el = document.getElementById(id);
      if (!el) return;

      const startHandler = (e: Event) => {
        e.preventDefault();
        onPress();
      };
      const endHandler = (e: Event) => {
        e.preventDefault();
        onRelease();
      };

      el.addEventListener('touchstart', startHandler, { passive: false });
      el.addEventListener('touchend', endHandler, { passive: false });
      el.addEventListener('touchcancel', endHandler, { passive: false });

      // Fallback para mouse em desktop nos botões virtuais
      el.addEventListener('mousedown', startHandler);
      el.addEventListener('mouseup', endHandler);
      el.addEventListener('mouseleave', endHandler);
    };

    // D-Pad Touch
    bindBtn('dpad-up', () => { this.upPressed = true; }, () => { this.upPressed = false; });
    bindBtn('dpad-down', () => { this.downPressed = true; }, () => { this.downPressed = false; });
    bindBtn('dpad-left', () => { this.leftPressed = true; }, () => { this.leftPressed = false; });
    bindBtn('dpad-right', () => { this.rightPressed = true; }, () => { this.rightPressed = false; });

    // Botões A e B
    bindBtn('btn-a', () => {
      this.aPressed = true;
      this.aTriggered = true;
    }, () => {
      this.aPressed = false;
    });

    bindBtn('btn-b', () => {
      this.bPressed = true;
      this.bTriggered = true;
    }, () => {
      this.bPressed = false;
    });
  }

  private bindKeyboardControls() {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();

      if (key === 'arrowup' || key === 'w') this.upPressed = true;
      if (key === 'arrowdown' || key === 's') this.downPressed = true;
      if (key === 'arrowleft' || key === 'a') this.leftPressed = true;
      if (key === 'arrowright' || key === 'd') this.rightPressed = true;

      if (key === 'z' || key === ' ' || key === 'enter') {
        this.aPressed = true;
        this.aTriggered = true;
      }

      if (key === 'x' || key === 'escape') {
        this.bPressed = true;
        this.bTriggered = true;
      }
    });

    window.addEventListener('keyup', (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (key === 'arrowup' || key === 'w') this.upPressed = false;
      if (key === 'arrowdown' || key === 's') this.downPressed = false;
      if (key === 'arrowleft' || key === 'a') this.leftPressed = false;
      if (key === 'arrowright' || key === 'd') this.rightPressed = false;

      if (key === 'z' || key === ' ' || key === 'enter') this.aPressed = false;
      if (key === 'x' || key === 'escape') this.bPressed = false;
    });
  }

  // Retorna se o Botão A foi pressionado neste quadro e limpa o gatilho
  public consumeATrigger(): boolean {
    if (this.aTriggered) {
      this.aTriggered = false;
      return true;
    }
    return false;
  }

  // Retorna se o Botão B foi pressionado neste quadro e limpa o gatilho
  public consumeBTrigger(): boolean {
    if (this.bTriggered) {
      this.bTriggered = false;
      return true;
    }
    return false;
  }

  // Retorna vetor de direção normalizado
  public getMoveVector(): { dx: number; dy: number } {
    let dx = 0;
    let dy = 0;

    if (this.leftPressed) dx -= 1;
    if (this.rightPressed) dx += 1;
    if (this.upPressed) dy -= 1;
    if (this.downPressed) dy += 1;

    return { dx, dy };
  }
}
