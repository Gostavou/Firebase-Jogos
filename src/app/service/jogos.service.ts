import { Injectable, OnDestroy } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  setDoc, 
  updateDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
  DocumentData,
  QuerySnapshot
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Jogo {
  id: string;
  nome: string;
  desenvolvedora: string;
  lancamento: number;
  generos: string[];
  plataformas: string[];
  expandido?: boolean;
  userId: string;
  userName: string; 
  userEmail: string; 
  criadoEm: Date;
}

export type NovoJogo = Omit<Jogo, 'id' | 'userId' | 'userName' | 'userEmail' | 'criadoEm'>;

@Injectable({
  providedIn: 'root'
})
export class JogosService implements OnDestroy {
  private jogos: Jogo[] = [];
  private jogosSubject = new BehaviorSubject<Jogo[]>([]);
  private unsubscribeAuth: (() => void) | null = null;
  private unsubscribeJogos: (() => void) | null = null;

  constructor(
    private firestore: Firestore,
    private auth: Auth
  ) {
    this.inicializarListener();
  }

  private inicializarListener() {
    this.limparListeners();

    this.unsubscribeAuth = this.auth.onAuthStateChanged(user => {
      this.jogos = [];
      this.jogosSubject.next([]);
      
      if (this.unsubscribeJogos) {
        this.unsubscribeJogos();
        this.unsubscribeJogos = null;
      }

      if (user) {
        this.carregarJogosDoUsuario(user.uid);
      }
    });
  }

  private carregarJogosDoUsuario(userId: string) {
    try {
      const jogosRef = collection(this.firestore, `jogos/${userId}/lista`);
      const q = query(jogosRef, orderBy('criadoEm', 'desc'));
      
      this.unsubscribeJogos = onSnapshot(q, 
        (snapshot: QuerySnapshot<DocumentData>) => {
          const jogosCarregados = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              nome: data['nome'],
              desenvolvedora: data['desenvolvedora'],
              lancamento: data['lancamento'],
              generos: data['generos'] || [],
              plataformas: data['plataformas'] || [],
              userId: data['userId'],
              userName: data['userName'] || 'Usuário',
              userEmail: data['userEmail'] || '',
              criadoEm: data['criadoEm']?.toDate() || new Date(),
              expandido: false
            } as Jogo;
          });
          
          this.jogos = jogosCarregados;
          this.jogosSubject.next([...this.jogos]);
        },
        (error) => {
          console.error('Erro ao carregar jogos:', error);
          this.jogos = [];
          this.jogosSubject.next([]);
        }
      );

    } catch (error) {
      console.error('Erro ao configurar listener de jogos:', error);
      this.jogos = [];
      this.jogosSubject.next([]);
    }
  }

  async adicionarJogo(jogo: NovoJogo): Promise<Jogo> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');

    const novoJogo: Omit<Jogo, 'id'> = {
      ...jogo,
      userId: user.uid,
      userName: user.displayName || user.email || 'Usuário', 
      userEmail: user.email || '', 
      criadoEm: new Date(),
      expandido: false
    };

    const jogoRef = doc(collection(this.firestore, `jogos/${user.uid}/lista`));
    await setDoc(jogoRef, novoJogo);

    return {
      ...novoJogo,
      id: jogoRef.id
    };
  }

  obterJogos(): Observable<Jogo[]> {
    return this.jogosSubject.asObservable();
  }

  obterJogosArray(): Jogo[] {
    return [...this.jogos];
  }

  async obterJogoPorId(id: string): Promise<Jogo | undefined> {
    return this.jogos.find(jogo => jogo.id === id);
  }

  async atualizarJogo(id: string, jogoAtualizado: NovoJogo): Promise<boolean> {
    const user = this.auth.currentUser;
    if (!user) return false;

    try {
      const jogoRef = doc(this.firestore, `jogos/${user.uid}/lista/${id}`);
      await updateDoc(jogoRef, {
        ...jogoAtualizado
      });
      return true;
    } catch (error) {
      console.error('Erro ao atualizar jogo:', error);
      return false;
    }
  }

  async excluirJogo(id: string): Promise<boolean> {
    const user = this.auth.currentUser;
    if (!user) return false;

    try {
      const jogoRef = doc(this.firestore, `jogos/${user.uid}/lista/${id}`);
      await deleteDoc(jogoRef);
      return true;
    } catch (error) {
      console.error('Erro ao excluir jogo:', error);
      return false;
    }
  }

  limparJogos() {
    this.jogos = [];
    this.jogosSubject.next([]);
  }

  private limparListeners() {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
      this.unsubscribeAuth = null;
    }
    if (this.unsubscribeJogos) {
      this.unsubscribeJogos();
      this.unsubscribeJogos = null;
    }
  }

  ngOnDestroy() {
    this.limparListeners();
  }
}