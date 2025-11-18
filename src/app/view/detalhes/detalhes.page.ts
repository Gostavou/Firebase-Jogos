import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, 
  IonButton, IonList, IonItem, IonLabel, IonInput, 
  IonSelect, IonSelectOption, IonBackButton, IonButtons, 
  IonText, IonIcon, IonChip
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { JogosService, NovoJogo } from '../../service/jogos.service';

@Component({
  selector: 'app-detalhes',
  templateUrl: './detalhes.page.html',
  styleUrls: ['./detalhes.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonList, IonItem, IonLabel,
    IonInput, IonSelect, IonSelectOption, IonBackButton,
    IonButtons, IonText, IonIcon, IonChip
  ]
})
export class DetalhesPage implements OnInit {

  jogo: any = null;
  generos: string[] = [];
  plataformas: string[] = [];
  
  nome: string = '';
  desenvolvedora: string = '';
  lancamento: number | null = null;

  generoSelecionado: string = '';
  plataformaSelecionada: string = '';

  anoMinimo = 1972; 
  anoMaximo = 2026;
  anoAtual = new Date().getFullYear();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jogosService: JogosService
  ) {}

  ngOnInit() {
    this.carregarJogo();
  }

  async carregarJogo() {
    const id = this.route.snapshot.paramMap.get('id'); 
    if (id) {
      const jogoEncontrado = await this.jogosService.obterJogoPorId(id);
      
      if (jogoEncontrado) {
        this.jogo = { ...jogoEncontrado };
        this.nome = this.jogo.nome;
        this.desenvolvedora = this.jogo.desenvolvedora;
        this.lancamento = this.jogo.lancamento;
        this.generos = [...this.jogo.generos];
        this.plataformas = [...this.jogo.plataformas];
      } else {
        this.router.navigate(['/home']);
      }
    } else {
      this.router.navigate(['/home']);
    }
  }

  addGenero() {
    if (this.generoSelecionado && !this.generos.includes(this.generoSelecionado)) {
      this.generos.push(this.generoSelecionado);
      this.generoSelecionado = '';
    }
  }

  removeGenero(index: number) {
    this.generos.splice(index, 1);
  }

  addPlataforma() {
    if (this.plataformaSelecionada && !this.plataformas.includes(this.plataformaSelecionada)) {
      this.plataformas.push(this.plataformaSelecionada);
      this.plataformaSelecionada = '';
    }
  }

  removePlataforma(index: number) {
    this.plataformas.splice(index, 1);
  }

  validarAno(lancamento: number): boolean {
    return lancamento >= this.anoMinimo && lancamento <= this.anoMaximo;
  }

  async salvarAlteracoes() {
    if (this.nome && this.desenvolvedora && this.lancamento && this.generos.length && this.plataformas.length && this.jogo) {
      
      if (!this.validarAno(this.lancamento)) {
        alert(`Ano de lançamento deve estar entre ${this.anoMinimo} e ${this.anoMaximo}.`);
        return;
      }

      const jogoAtualizado: NovoJogo = {
        nome: this.nome,
        desenvolvedora: this.desenvolvedora,
        lancamento: this.lancamento,
        generos: this.generos,
        plataformas: this.plataformas
      };

      const sucesso = await this.jogosService.atualizarJogo(this.jogo.id, jogoAtualizado);
      if (sucesso) {
        alert('Jogo atualizado com sucesso!');
        this.router.navigate(['/home']);
      } else {
        alert('Erro ao atualizar jogo. Tente novamente.');
      }
    } else {
      alert('Preencha todos os campos obrigatórios e adicione pelo menos um gênero e plataforma.');
    }
  }

  async excluirJogo() {
    if (this.jogo && confirm(`Tem certeza que deseja excluir o jogo "${this.jogo.nome}"?`)) {
      const sucesso = await this.jogosService.excluirJogo(this.jogo.id);
      if (sucesso) {
        this.router.navigate(['/home']);
      } else {
        alert('Erro ao excluir jogo. Tente novamente.');
      }
    }
  }
}