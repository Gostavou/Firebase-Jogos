import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../service/auth.service';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';

@Component({
  selector: 'app-logar',
  standalone: true,
  imports: [
    IonicModule, 
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule
  ],
  templateUrl: './logar.page.html',
  styleUrls: ['./logar.page.scss']
})
export class LogarPage implements OnDestroy {
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required]
  });
  
  showPassword = false;
  private authSubscription!: Subscription;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    addIcons({
      'eye-outline': eyeOutline,
      'eye-off-outline': eyeOffOutline
    });

    this.authSubscription = this.authService.authStateChecked$.subscribe(checked => {
      if (checked && this.authService.isAuthenticated()) {
        this.router.navigate(['/home']);
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  async logar() {
    if (this.form.invalid) return;

    const { email, senha } = this.form.value;

    try {
      await this.authService.login(email!, senha!);
      this.router.navigate(['/home']);
    } catch (e: any) {
      let mensagem = 'Erro ao fazer login.';
      
      if (e.code === 'auth/invalid-credential') {
        mensagem = 'Email ou senha incorretos.';
      } else if (e.code === 'auth/too-many-requests') {
        mensagem = 'Muitas tentativas. Tente novamente mais tarde.';
      } else if (e.code === 'auth/user-not-found') {
        mensagem = 'Usuário não encontrado.';
      }
      
      alert(mensagem);
    }
  }
}