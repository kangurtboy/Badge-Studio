// 3D Flip Card Animation Controller

export class FlipCardController {
  constructor(cardElement, options = {}) {
    this.cardElement = cardElement;
    this.innerElement = cardElement.querySelector('.flip-card-inner') || cardElement;
    this.isFlipped = false;
    this.enabled = options.animationEnabled !== false;
    this.onFlipCallback = options.onFlip || (() => {});
  }

  setAnimationEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.innerElement.classList.add('no-animation');
    } else {
      this.innerElement.classList.remove('no-animation');
    }
  }

  showFront() {
    if (!this.isFlipped) return;
    this.isFlipped = false;
    this.innerElement.classList.remove('flipped');
    this.onFlipCallback(this.isFlipped, 'front');
  }

  showBack() {
    if (this.isFlipped) return;
    this.isFlipped = true;
    this.innerElement.classList.add('flipped');
    this.onFlipCallback(this.isFlipped, 'back');
  }

  toggle() {
    this.isFlipped = !this.isFlipped;
    this.innerElement.classList.toggle('flipped', this.isFlipped);
    this.onFlipCallback(this.isFlipped, this.isFlipped ? 'back' : 'front');
    return this.isFlipped;
  }

  getCurrentSide() {
    return this.isFlipped ? 'back' : 'front';
  }
}
