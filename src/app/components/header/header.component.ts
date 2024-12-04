import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { NgClass } from '@angular/common';
import {
  RouterLink,
  RouterLinkActive,
  Router,
  NavigationEnd,
} from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgClass, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  isMenuOpen = false;
  currentRoute = '';

  constructor(private router: Router, private elementRef: ElementRef) {}

  ngOnInit() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
        this.scrollToSection(this.currentRoute.slice(1));
      });
    
    this.handleScreenSize();
    window.addEventListener('resize', this.handleScreenSize.bind(this));
  }
  downloadCV() {
    const linkDownload = document.createElement('a');
    linkDownload.href = 'assets/cv/CV_José Miguel Mejía Crespo.pdf';
    linkDownload.download = 'CV_José Miguel Mejía Crespo.pdf';
    linkDownload.click();
  }
  navigateAndScroll(sectionId: string) {

    if (this.router.url === `/${sectionId}`) {
      this.scrollToSection(sectionId);
    } else {
      this.router.navigate([`/${sectionId}`]).then(() => {
        this.scrollToSection(sectionId);
      });
    }
    this.closeMenu();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside && this.isMenuOpen) {
      this.closeMenu();
    }
  }
  private scrollToSection(sectionId: string) {
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  }

  private handleScreenSize() {
    const screenWidth = window.innerWidth;
    if (screenWidth > 585) {
      this.isMenuOpen = false;
    }
  }
}