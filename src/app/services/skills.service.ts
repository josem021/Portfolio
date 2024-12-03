import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {HttpClient} from '@angular/common/http';
import { Skills } from '../interfaces/skills.interface';

@Injectable({
  providedIn: 'root'
})
export class SkillsService {
  private skillsURL = './assets/json/skills.json';

  constructor(private http: HttpClient) { }

  getSkills(): Observable<Skills> {
    return this.http.get<Skills>(this.skillsURL);
  }
}