import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Projects {
  id: number;
  title: string;
  description: string;
  techStack: string[];
  pageLink: string;
  image: string;
}
@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  private projectsURL = './assets/json/project.json';
  constructor(private http: HttpClient) { }

  getProjects(): Observable<Projects[]> {
    return this.http.get<Projects[]>(this.projectsURL);
  }
}
