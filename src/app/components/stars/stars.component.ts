import { Component, ElementRef, Renderer2, OnInit } from '@angular/core';

@Component({
  selector: 'app-stars',
  standalone: true,
  templateUrl: './stars.component.html',
  styleUrls: ['./stars.component.css'],
})
export class StarsComponent implements OnInit {
  private seed: number = 42;
  private offsetY: number = 5;
  private middleOffsetY: number = 3;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.createStars(18);
  }

  private seededRandom(index: number): number {
    const x = Math.sin(index + this.seed) * 10000;
    return x - Math.floor(x);
  }

  createStars(count: number): void {
    const container = this.el.nativeElement;
    const gridSize = Math.sqrt(count);
    const gridSpacing = 105 / gridSize;

    const maxOffsetY = gridSpacing / 2;

    for (let i = 0; i < count; i++) {
      const star = this.renderer.createElement('div');
      this.renderer.addClass(star, 'start');

      const row = Math.floor(i / gridSize);
      const col = i % gridSize;

      let top = `${
        row * gridSpacing +
        this.seededRandom(i) * (gridSpacing / 2) +
        this.offsetY
      }%`;
      let left = `${
        col * gridSpacing + this.seededRandom(i + count) * (gridSpacing / 2)
      }%`;

      if (row > gridSize * 0.4) {
        top = `${Math.min(
          parseFloat(top) + this.middleOffsetY,
          100 - maxOffsetY
        )}%`;
      }

      top = `${Math.max(Math.min(parseFloat(top), 95), 0)}%`;
      left = `${Math.max(Math.min(parseFloat(left), 95), 0)}%`;

      this.renderer.setStyle(star, 'top', top);
      this.renderer.setStyle(star, 'left', left);

      container.appendChild(star);
      this.animateStar(star);
    }
  }

  animateStar(star: HTMLElement): void {
    const delay = Math.random() * 3 + 's';
    this.renderer.setStyle(star, 'animation-delay', delay);
  }
}