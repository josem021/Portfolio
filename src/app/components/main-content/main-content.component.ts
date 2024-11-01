import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.css',
})
export class MainContentComponent implements OnInit, OnDestroy {
  roles: string[] = ['Desarrollador Web', 'QA Tester', 'Analista de Software'];
  currentRoleIndex = 0;
  Roledescription = '';
  private intervalId: any;
  private isDeleting = false;
  ngOnInit() {
    this.startTypingEffect();
  }
  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
  startTypingEffect() {
    this.Roledescription = this.roles[this.currentRoleIndex];
    this.typeRole();
  }

  typeRole() {
    const currentRole = this.roles[this.currentRoleIndex];
    const typingDuration = 150; // Tiempo entre cada letra al escribir
    const deletingDuration = 75; // Tiempo entre cada letra al borrar

    let currentText = '';
    let textLength = 0;

    const type = () => {
      if (textLength < currentRole.length) {
        currentText += currentRole.charAt(textLength);
        this.Roledescription = currentText;
        textLength++;
        setTimeout(type, typingDuration);
      } else {
        setTimeout(() => this.deleteRole(), 1000); // Espera antes de empezar a borrar
      }
    };

    type();
  }

  deleteRole() {
    const currentRole = this.roles[this.currentRoleIndex];
    let currentText = currentRole;

    const deleteText = () => {
      if (currentText.length > 0) {
        currentText = currentText.slice(0, -1);
        this.Roledescription = currentText;
        setTimeout(deleteText, 75); // Espera entre cada letra al borrar
      } else {
        this.currentRoleIndex = (this.currentRoleIndex + 1) % this.roles.length; // Cambiar al siguiente rol
        setTimeout(() => this.typeRole(), 500); // Espera antes de empezar a escribir de nuevo
      }
    };
    deleteText();
  }
}
