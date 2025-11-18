import { Routes } from '@angular/router';
import { HomePage } from './view/home/home.page';
import { CadastrarPage } from './view/cadastrar/cadastrar.page';
import { DetalhesPage } from './view/detalhes/detalhes.page';

import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'logar', pathMatch: 'full' },

  { 
    path: 'home', 
    component: HomePage, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'cadastrar', 
    component: CadastrarPage, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'detalhes/:id', 
    component: DetalhesPage, 
    canActivate: [AuthGuard] 
  },

  {
    path: 'logar',
    loadComponent: () =>
      import('./view/logar/logar.page').then(m => m.LogarPage),
    canActivate: [LoginGuard]
  },

  {
    path: 'registrar',
    loadComponent: () =>
      import('./view/registrar/registrar.page').then(m => m.RegistrarPage),
    canActivate: [LoginGuard]
  },

  { path: '**', redirectTo: 'logar' }
];