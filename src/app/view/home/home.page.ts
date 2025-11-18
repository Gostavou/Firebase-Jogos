import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonButton, IonList, IonIcon, IonChip, IonText,
  IonMenu, IonMenuButton, IonButtons, IonItem,
  IonListHeader, IonMenuToggle
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  chevronUpOutline, chevronDownOutline,
  createOutline, trashOutline,
  gameControllerOutline, logOutOutline, menuOutline
} from 'ionicons/icons';

import { JogosService, Jogo } from '../../service/jogos.service';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonList, IonIcon, IonChip, IonText,
    IonMenu, IonMenuButton, IonButtons, IonItem,
    IonListHeader, IonMenuToggle
  ]
})
export class HomePage implements OnInit, OnDestroy {
  nomeUsuario: string = 'Carregando...';
  jogos: Jogo[] = [];
  private jogosSubscription!: Subscription;
  private authSubscription!: Subscription;
  private authStateSubscription!: Subscription;
  isLoading: boolean = true;

  constructor(
    private router: Router,
    private jogosService: JogosService,
    private authService: AuthService
  ) {
    addIcons({
      chevronUpOutline,
      chevronDownOutline,
      createOutline,
      trashOutline,
      gameControllerOutline,
      logOutOutline,
      menuOutline
    });
  }

  ngOnInit() {
    this.carregarUsuario();
    
    // Aguardar o auth state ser verificado antes de carregar jogos
    this.authStateSubscription = this.authService.authStateChecked$.subscribe(checked => {
      if (checked) {
        this.carregarJogos();
      }
    });
  }

  ngOnDestroy() {
    if (this.jogosSubscription) {
      this.jogosSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.authStateSubscription) {
      this.authStateSubscription.unsubscribe();
    }
  }

  carregarUsuario() {
    this.authSubscription = this.authService.user$.subscribe(user => {
      if (user) {
        this.nomeUsuario = this.authService.userName;
      } else {
        this.nomeUsuario = 'Usuário';
      }
    });
  }

  carregarJogos() {
    this.jogosSubscription = this.jogosService.obterJogos().subscribe({
      next: (jogos) => {
        this.jogos = jogos;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar jogos:', error);
        this.jogos = [];
        this.isLoading = false;
      }
    });
  }

  ionViewWillEnter() {
    this.carregarUsuario();
  }

  irParaCadastrar() {
    this.router.navigate(['/cadastrar']);
  }

  editarJogo(jogo: Jogo, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/detalhes', jogo.id]);
  }

  async excluirJogo(jogo: Jogo, event: Event) {
    event.stopPropagation();
    if (confirm(`Tem certeza que deseja excluir o jogo "${jogo.nome}"?`)) {
      const sucesso = await this.jogosService.excluirJogo(jogo.id);
      if (!sucesso) {
        alert('Erro ao excluir jogo. Tente novamente.');
      }
    }
  }

  async sair() {
    try {
      await this.authService.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      alert('Erro ao fazer logout. Tente novamente.');
    }
  }

  toggleExpand(index: number) {
    this.jogos[index].expandido = !this.jogos[index].expandido;
  }
}