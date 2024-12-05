import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  HostListener,
  Host,
} from '@angular/core';
import { Projects, ProjectsService } from '../../services/projects.service';
import { HttpClient } from '@angular/common/http';
import { AsyncPipe, NgFor, NgIf, NgStyle } from '@angular/common';
import { Observable } from 'rxjs';
import { StarsComponent } from '../stars/stars.component';
import { SkillsService } from '../../services/skills.service';
import { Skills, Skill } from '../../interfaces/skills.interface';
import { Experience } from '../../interfaces/experience.interface';
import { ExperienceService } from '../../services/experience.service';
import { ElementRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmailService } from '../../services/email.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [NgStyle, NgIf, ReactiveFormsModule],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.css',
})
export class MainContentComponent implements OnInit, OnDestroy {
  roles: string[] = ['Desarrollador Web', 'QA Tester', 'Analista de Software'];
  currentRoleIndex = 0;
  Roledescription = '';
  private intervalId: any;
  private isDeleting = false;
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private touchEndX: number = 0;
  private isSwiping: boolean = false;
  private touchStartTime: number = 0;
  private readonly maxClickDuration: number = 100;
  private readonly minSwipeDistance: number = 50;

  /* - EXPERIENCE - */
  experiences: Experience[] = [];
  selectedExperience: string = 'Rappi';
  selectedExperienceData: Experience | null = null;
  showExperienceFilter = false;

  private experienceService = inject(ExperienceService);

  /* - EXPERIENCE END - */
  private elementRef = inject(ElementRef);

  projects: Projects[] = [];
  filteredProjects: Projects[] = [];
  displayProjects: Projects[][] = [];
  currentPage = 0;
  projectsPerPage = 4;
  filterOptions = [
    'Angular',
    'TypeScript',
    'JavaScript',
    'HTML',
    'CSS',
    'MySQL',
    'PHP',
  ];
  showFilters = false;
  hovoredProject: number | null = null;

  skills: Skills | undefined;
  showLanguagesFilter = false;
  selectedFilter: String = 'Todos';
  uniqueLanguages: Skill[] = [];

  currentIndex = 0;
  projectsPerView = 4;

  //Formulario Reactivo
  contactForm: FormGroup;
  isSent: boolean | null = null;

  // Inyección del servicio en el constructor
  constructor(
    private projectService: ProjectsService,
    private skillService: SkillsService,
    private formBuilder: FormBuilder,
    private emailService: EmailService
  ) {
    // Inicializacion del servicio
    this.loadProjects();
    this.loadSkills();
    this.loadExperiences();
    this.contactForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(40)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.maxLength(80)]],
      message: ['', [Validators.required, Validators.maxLength(4000)]],
    });
  }
  downloadCV() {
    const linkDownload = document.createElement('a');
    linkDownload.href = 'assets/cv/CV_José Miguel Mejía Crespo.pdf';
    linkDownload.download = 'CV_José Miguel Mejía Crespo.pdf';
    linkDownload.click();
  }
  isMobileView = true;

  toggleMobileDesktopView() {
    if (window.innerWidth < 1024) {
      this.isMobileView = !this.isMobileView;
    }
  }
  onSubmit() {
    if (this.contactForm.valid) {
      const templateParams = {
        from_name: this.contactForm.value.name,
        to_name: 'José Miguel',
        email: this.contactForm.value.email,
        subject: this.contactForm.value.subject,
        message: this.contactForm.value.message,
      };

      const serviceID = 'service_4schrvk';
      const templateID = 'template_t5q670j';

      this.emailService
        .sendEmail(templateParams, serviceID, templateID)
        .then(
          (response) => {
            console.log('Email enviado', response.status, response.text);
            this.isSent = true;

            this.contactForm.reset();
          },
          (error) => {
            console.error('Error al enviar el email', error);
            this.isSent = false;
          }
        )
        .catch((error) => {
          console.error('Error inesperado', error);
          this.isSent = false;
        });
    } else {
      this.isSent = false;
    }
  }
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const filterContainer =
      this.elementRef.nativeElement.querySelector('.filter-container');
    if (
      this.showLanguagesFilter &&
      filterContainer &&
      !filterContainer.contains(event.target)
    ) {
      this.showLanguagesFilter = false;
    }

    const experienceFilterContainer =
      this.elementRef.nativeElement.querySelector('.filter-container');
    if (
      this.showExperienceFilter &&
      experienceFilterContainer &&
      !experienceFilterContainer.contains(event.target)
    ) {
      this.showExperienceFilter = false;
    }
  }
  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY; // Store initial Y position
    this.touchStartTime = Date.now();
    this.isSwiping = false;
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    const deltaX = event.touches[0].clientX - this.touchStartX;
    const deltaY = event.touches[0].clientY - this.touchStartY;

    // Check if horizontal movement is significant AND vertical is minimal
    if (Math.abs(deltaX) > 10 && Math.abs(deltaY) < 2) {
      // Adjust deltaY threshold as needed
      this.isSwiping = true;
    }
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    const touchDuration = Date.now() - this.touchStartTime;
    this.touchEndX = event.changedTouches[0].clientX;

    if (this.isSwiping && touchDuration > this.maxClickDuration) {
      this.handleSwipe();
    }
  }
  private handleSwipe() {
    const swipeDistance = this.touchEndX - this.touchStartX;
    if (swipeDistance > this.minSwipeDistance) {
      this.previousPage();
    } else if (
      swipeDistance < 0 &&
      this.currentIndex <
        Math.ceil(this.filteredProjects.length / this.projectsPerView) - 1
    ) {
      this.nextPage();
    }
  }
  private loadProjects() {
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.filteredProjects = [...projects];
        this.paginateProjects();
      },
      error: (error) => {
        console.error('Error loading projects:', error);
      },
    });
  }
  paginateProjects() {
    this.displayProjects = [];
    const projectsPerPage = 4;

    // Si no hay proyectos filtrados, crear un grupo vacío
    if (this.filteredProjects.length === 0) {
      this.displayProjects.push(Array(4).fill({} as Projects));
      return;
    }

    // Calcular el número total de páginas necesarias
    const totalPages = Math.ceil(
      this.filteredProjects.length / projectsPerPage
    );

    // Crear las páginas
    for (let i = 0; i < totalPages; i++) {
      const startIdx = i * projectsPerPage;
      const pageProjects = Array(4).fill({} as Projects);

      for (let j = 0; j < projectsPerPage; j++) {
        if (startIdx + j < this.filteredProjects.length) {
          const project = this.filteredProjects[startIdx + j];
          if (project) {
            pageProjects[j] = {
              ...project,
              image: project.image || '',
              pageLink: project.pageLink || '#',
            };
          }
        }
      }
    }
  }

  private loadSkills() {
    this.skillService.getSkills().subscribe({
      next: (skills) => {
        this.skills = skills;
        // Crear array de lenguajes únicos
        const uniqueTitles = new Set<string>();
        this.uniqueLanguages = skills.languages.filter((language) => {
          if (!uniqueTitles.has(language.title)) {
            uniqueTitles.add(language.title);
            return true;
          }
          return false;
        });
      },
      error: (error) => {
        console.error('Error loading skills:', error);
      },
    });
  }
  toggleLanguagesFilter(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.showLanguagesFilter = !this.showLanguagesFilter;
  }
  applyFilter(language: string) {
    this.selectedFilter = language;
    this.currentIndex = 0;

    if (language === 'Todos') {
      this.filteredProjects = [...this.projects];
    } else {
      this.filteredProjects = this.projects.filter((project) =>
        project.techStack.includes(language)
      );
    }

    this.paginateProjects();
  }
  getVisibleProjects() {
    const pages = [];
    const projects = this.filteredProjects;

    for (let i = 0; i < projects.length; i += this.projectsPerPage) {
      pages.push(projects.slice(i, i + this.projectsPerPage));
    }

    return pages;
  }
  getMaxPages() {
    return Math.ceil(this.filteredProjects.length / this.projectsPerPage);
  }

  getTransformStyle() {
    return `translateX(${-100 * this.currentIndex}%)`;
  }

  getBackgroundStyle(imageUrl: string | undefined) {
    if (!imageUrl) {
      return {
        'background-color': '#16161a',
      };
    }
    return {
      'background-image': `url(${imageUrl})`,
      'background-size': 'cover',
      'background-position': 'center',
      'background-repeat': 'no-repeat',
    };
  }

  nextPage() {
    const maxIndex =
      Math.ceil(this.filteredProjects.length / this.projectsPerView) - 1;
    if (this.currentIndex < maxIndex) {
      this.currentIndex++;
    }
  }

  previousPage() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }
  getProjectsForPosition(position: number): Projects {
    const index = this.currentIndex * this.projectsPerView + position;
    return this.filteredProjects[index] || ({} as Projects);
  }

  shouldShowArrows(): boolean {
    return true;
  }

  trackProjectById(index: number, project: Projects) {
    return project.id;
  }
  allSkills: Skill[] = [];
  ngOnInit() {
    this.startTypingEffect();
    console.log('Component initialized');
    this.loadExperiences();
    this.skillService.getSkills().subscribe(
      (data: Skills) => {
        this.allSkills = [...data.languages, ...data.tools];
      },
      (error) => {
        console.error('Error loading skills:', error);
      }
    );
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
    const typingDuration = 100;

    let currentText = '';
    let textLength = 0;

    const type = () => {
      if (textLength < currentRole.length) {
        currentText += currentRole.charAt(textLength);
        this.Roledescription = currentText;
        textLength++;
        setTimeout(type, typingDuration);
      } else {
        setTimeout(() => this.deleteRole(), 1000);
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
        setTimeout(deleteText, 75);
      } else {
        this.currentRoleIndex = (this.currentRoleIndex + 1) % this.roles.length;
        setTimeout(() => this.typeRole(), 500);
      }
    };
    deleteText();
  }

  filterProjects(category: string) {
    this.filteredProjects = this.projects.filter((project) =>
      project.techStack.includes(category)
    );
  }

  clearFilterProject() {
    this.filteredProjects = this.projects;
  }

  openLinkProject(url: string) {
    window.open(url, '_blank');
  }

  /*--- Experience funcs ---*/

  loadExperiences() {
    this.experienceService.getExperiences().subscribe({
      next: (experiences) => {
        // Asegúrate de que experiences sea un array
        this.experiences = Array.isArray(experiences)
          ? experiences
          : [experiences];
        this.setDefaultExperience();
      },
      error: (error) => {
        console.error('Error loading experiences:', error);
      },
    });
  }
  setDefaultExperience() {
    const defaultExperience = this.experiences.find(
      (exp) => exp.title === 'Rappi'
    );
    if (defaultExperience) {
      this.selectedExperience = defaultExperience.title;
      this.selectedExperienceData = defaultExperience;
    } else if (this.experiences.length > 0) {
      // Si no se encuentra "Rappi", selecciona la primera experiencia disponible
      this.selectedExperience = this.experiences[0].title;
      this.selectedExperienceData = this.experiences[0];
    }
  }

  toggleExperienceFilter(event: MouseEvent) {
    event.stopPropagation();
    this.showExperienceFilter = !this.showExperienceFilter;
  }

  selectExperience(title: string) {
    this.selectedExperience = title;
    this.selectedExperienceData =
      this.experiences.find((exp) => exp.title === title) || null;
    this.showExperienceFilter = false; // Se cierra el dropdown tras seleccionar
  }
}
