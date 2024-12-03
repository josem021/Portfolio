import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Experience } from '../interfaces/experience.interface';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ExperienceService {
  constructor(private http: HttpClient) { }

  getExperiences(): Observable<Experience[]> {
    return this.http.get<{ experiences: Experience[] }>('/assets/json/experience.json').pipe(
      map(response => response.experiences) // Extrae el array de experiencias
    );
  }
}