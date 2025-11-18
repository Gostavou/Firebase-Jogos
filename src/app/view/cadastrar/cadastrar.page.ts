import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, 
  IonButton, IonList, IonItem, IonLabel, IonInput, 
  IonSelect, IonSelectOption, IonBackButton, IonButtons, 
  IonText, IonIcon, IonChip
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { JogosService, NovoJogo } from '../../service/jogos.service';
import { addIcons } from 'ionicons';
import { closeCircle } from 'ionicons/icons';

@Component({
  selector: 'app-cadastrar',
  templateUrl: './cadastrar.page.html',
  styleUrls: ['./cadastrar.page.scss'],
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
export class CadastrarPage {

  generos: string[] = [];
  plataformas: string[] = [];
  
  generoSelecionado: string = '';
  plataformaSelecionada: string = '';

  // validação de anos
  anoMinimo = 1972; 
  anoMaximo = 2026;
  anoAtual = new Date().getFullYear();

  constructor(
    private router: Router,
    private jogosService: JogosService
  ) {
    addIcons({
      closeCircle
    });
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

  salvarJogo(form: any) {
    if (form.valid && this.generos.length && this.plataformas.length) {
      const lancamento = form.value.lancamento;
      
      // validação do ano que nao estava incluso na primeira versao
      if (!this.validarAno(lancamento)) {
        alert(`Ano de lançamento deve estar entre ${this.anoMinimo} e ${this.anoMaximo}.`);
        return;
      }
      
      const jogo: NovoJogo = {
        nome: form.value.nome,
        desenvolvedora: form.value.desenvolvedora,
        lancamento: lancamento,
        generos: this.generos,
        plataformas: this.plataformas
      };
      
      this.jogosService.adicionarJogo(jogo);
      this.router.navigate(['/home']);
    } else {
      alert('Preencha todos os campos obrigatórios e adicione pelo menos um gênero e plataforma.');
    }
  }
}