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
  selector: 'app-registrar',
  standalone: true,
  imports: [
    IonicModule, 
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule
  ],
  templateUrl: './registrar.page.html',
  styleUrls: ['./registrar.page.scss']
})
export class RegistrarPage implements OnDestroy {
  form = this.fb.group({
    nome: ['', Validators.required],
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
    // Adicionar os ícones
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

  async registrar() {
    if (this.form.invalid) return;

    const { nome, email, senha } = this.form.value;

    try {
      await this.authService.register(email!, senha!, nome!);
      alert("Conta criada com sucesso! Faça login para continuar");
      this.router.navigate(['/logar']);
    } catch (e: any) {
      let mensagem = 'Erro ao criar conta.';
      
      if (e.code === 'auth/email-already-in-use') {
        mensagem = 'email já em uso';
      } else if (e.code === 'auth/weak-password') {
        mensagem = 'a senha deve conter ao menos 6 caracteres';
      } else if (e.code === 'auth/invalid-email') {
        mensagem = 'email nao válido';
      }
      
      alert(mensagem);
    }
  }
}