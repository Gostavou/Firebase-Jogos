import { Injectable } from '@angular/core';
import { 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile,
  user,
  User
} from '@angular/fire/auth';
import { 
  Firestore, 
  doc, 
  setDoc
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  private authStateChecked = new BehaviorSubject<boolean>(false);

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    this.inicializarAuthListener();
  }

  private inicializarAuthListener() {
    user(this.auth).subscribe({
      next: (user) => {
        console.log('Auth state changed:', user);
        this.userSubject.next(user);
        this.authStateChecked.next(true);
      },
      error: (error) => {
        console.error('Erro no listener de autenticação:', error);
        this.userSubject.next(null);
        this.authStateChecked.next(true);
      }
    });
  }

  async login(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      throw error;
    }
  }

  async register(email: string, password: string, nome: string): Promise<void> {
    try {
      const cred = await createUserWithEmailAndPassword(this.auth, email, password);
      
      await updateProfile(cred.user, { 
        displayName: nome 
      });
      
      const userDocRef = doc(this.firestore, `usuarios/${cred.user.uid}`);
      await setDoc(userDocRef, {
        nome: nome,
        email: email,
        criadoEm: new Date()
      });
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate(['/logar']);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  }

  get user(): User | null {
    return this.auth.currentUser;
  }

  get userName(): string {
    return this.auth.currentUser?.displayName || this.auth.currentUser?.email || 'Usuário';
  }

  get user$(): Observable<User | null> {
    return this.userSubject.asObservable();
  }

  get authStateChecked$(): Observable<boolean> {
    return this.authStateChecked.asObservable();
  }

  isAuthenticated(): boolean {
    return this.auth.currentUser !== null;
  }
}