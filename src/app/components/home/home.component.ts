import { Component } from '@angular/core';
import { MainContentComponent } from '../main-content/main-content.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MainContentComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
