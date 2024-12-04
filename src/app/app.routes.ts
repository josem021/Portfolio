import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
    {path: 'home', component: HomeComponent},
    {path: 'proyectos', component: HomeComponent},
    {path: 'habilidades', component: HomeComponent},
    {path: 'experiencias', component: HomeComponent},
    {path: 'contacto', component: HomeComponent},
    {path: '', redirectTo: 'home', pathMatch: 'full'},
    {path: '**', redirectTo: 'home'}
];