import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate() {
    return this.authService.authStateChecked$.pipe(
      take(1),
      map(checked => {
        if (!checked) {
          // verificação, caso nao identificar o usuario logado leva de volta pra logar
          this.router.navigate(['/logar']);
          return false;
        }
        
        if (this.authService.isAuthenticated()) {
          return true;
        } else {
          this.router.navigate(['/logar']);
          return false;
        }
      })
    );
  }
}