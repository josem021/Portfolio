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
        this.scrollToSection();
      });
    this.handleScreenSize();
    window.addEventListener('resize', this.handleScreenSize.bind(this));
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
  private scrollToSection() {
    const sectionId = this.currentRoute.slice(1); // Remove the leading '/'
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
  private handleScreenSize() {
    const screenWidth = window.innerWidth;
    if (screenWidth > 585) {
      this.isMenuOpen = false;
    }
  }
}
