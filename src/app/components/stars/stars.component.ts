import { Component, ElementRef, Renderer2, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-stars',
  standalone: true,
  template: '<div class="stars-container"></div>',
  styles: [`
    .stars-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      overflow: hidden;
      z-index: -1;
    }

    .start {
      position: absolute;
      display: block;
      width: 0;
      height: 0;
      border-right: 15px solid transparent;
      border-bottom: 10.5px solid #8ffdf3;
      border-left: 15px solid transparent;
      transform: rotate(35deg);
      opacity: 0.5;
      animation: twinkle 5s infinite ease-in-out;
      z-index: -1;
    }

    .start::before {
      content: "";
      position: absolute;
      border-bottom: 12px solid #8ffdf3;
      border-left: 4.5px solid transparent;
      border-right: 4.5px solid transparent;
      top: -6.75px;
      left: -9.25px;
      transform: rotate(-35deg);
    }

    .start::after {
      content: "";
      position: absolute;
      top: 0.375px;
      left: -15.75px;
      width: 0;
      height: 0;
      border-right: 15px solid transparent;
      border-bottom: 10.5px solid #8ffdf3;
      border-left: 15px solid transparent;
      transform: rotate(-70deg);
    }

    @keyframes twinkle {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.8; }
    }

    @media (max-width: 768px) {
      .start {
        border-right: 10px solid transparent;
        border-bottom: 7px solid #8ffdf3;
        border-left: 10px solid transparent;
      }

      .start::before {
        border-bottom: 8px solid #8ffdf3;
        border-left: 3px solid transparent;
        border-right: 3px solid transparent;
        top: -4.5px;
        left: -6px;
      }

      .start::after {
        border-right: 10px solid transparent;
        border-bottom: 7px solid #8ffdf3;
        border-left: 10px solid transparent;
        top: 0.25px;
        left: -10.5px;
      }
    }

    @media (max-width: 480px) {
      .start {
        border-right: 7px solid transparent;
        border-bottom: 5px solid #8ffdf3;
        border-left: 7px solid transparent;
      }

      .start::before {
        border-bottom: 5px solid #8ffdf3;
        border-left: 2px solid transparent;
        border-right: 2px solid transparent;
        top: -3px;
        left: -4px;
      }
      
      .start::after {
        border-right: 7px solid transparent;
        border-bottom: 5px solid #8ffdf3;
        border-left: 7px solid transparent;
        top: 0.15px;
        left: -7px;
      }
    }
  `]
})
export class StarsComponent implements OnInit {
  private seed: number = 42;
  private stars: HTMLElement[] = [];
  private readonly starCount = 18;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.createStars();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.stars.forEach(star => star.remove());
    this.stars = [];
    this.createStars();
  }

  private seededRandom(index: number): number {
    const x = Math.sin(index + this.seed) * 10000;
    return x - Math.floor(x);
  }

  private createStars(): void {
    const container = this.el.nativeElement.querySelector('.stars-container');
    const zones = this.createZones();

    for (let i = 0; i < this.starCount; i++) {
      const star = this.renderer.createElement('div');
      this.renderer.addClass(star, 'start');

      // Seleccionar una zona disponible y obtener una posición dentro de ella
      const position = this.getStarPosition(zones, i);
      
      this.renderer.setStyle(star, 'top', `${position.top}%`);
      this.renderer.setStyle(star, 'left', `${position.left}%`);
      
      // Añadir variación al ángulo de rotación para más naturalidad
      const rotation = 35 + (this.seededRandom(i * 7) * 40 - 20);
      this.renderer.setStyle(star, 'transform', `rotate(${rotation}deg)`);

      this.animateStar(star);
      container.appendChild(star);
      this.stars.push(star);
    }
  }

  private createZones(): any[] {
    // Dividir la pantalla en zonas para mejor distribución
    const zones = [];
    const numZones = 6; // Dividir la pantalla en 6 zonas verticales
    
    for (let i = 0; i < numZones; i++) {
      zones.push({
        startX: (i * 100) / numZones,
        endX: ((i + 1) * 100) / numZones,
        usedPositions: [] // Almacenar posiciones usadas en cada zona
      });
    }
    
    return zones;
  }

  private getStarPosition(zones: any[], index: number): { top: number, left: number } {
    const random = this.seededRandom(index + this.starCount);
    let selectedZone;

    if (random < 0.4) {
      // 40% en los laterales
      selectedZone = random < 0.2 ? 
        zones[0] : // Primera zona (izquierda)
        zones[zones.length - 1]; // Última zona
    } else {
      // 60% en el resto de zonas
      const middleZoneIndex = Math.floor(this.seededRandom(index * 13) * (zones.length - 2)) + 1;
      selectedZone = zones[middleZoneIndex];
    }

    // Genera posición dentro de la zona seleccionada
    let left, top;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      left = selectedZone.startX + (this.seededRandom(index * 3 + attempts) * (selectedZone.endX - selectedZone.startX));
      top = this.seededRandom(index * 5 + attempts) * 95;
      attempts++;
    } while (
      this.isPositionTooClose(selectedZone.usedPositions, left, top) && 
      attempts < maxAttempts
    );

    // Guarda la posición usada
    selectedZone.usedPositions.push({ left, top });

    return { top, left };
  }

  private isPositionTooClose(usedPositions: any[], left: number, top: number): boolean {
    const minDistance = 15; // Distancia mínima entre estrellas
    
    return usedPositions.some(pos => {
      const distance = Math.sqrt(
        Math.pow(pos.left - left, 2) + 
        Math.pow(pos.top - top, 2)
      );
      return distance < minDistance;
    });
  }

  private animateStar(star: HTMLElement): void {
    const delay = Math.random() * 5 + 's';
    this.renderer.setStyle(star, 'animation-delay', delay);
  }
}