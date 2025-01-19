import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from '@/services/authService';

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
}

class AuthStore {
  private initialState: AuthState = {
    isAuthenticated: false,
    token: null,
    refreshToken: null,
  };

  private stateSubject = new BehaviorSubject<AuthState>(this.initialState);
  public state$: Observable<AuthState> = this.stateSubject.asObservable();

  constructor() {
    // Inicializar estado a partir do localStorage apenas no cliente
    if (typeof window !== 'undefined') {
      this.initializeFromStorage();
    }
  }

  private initializeFromStorage() {
    if (typeof window === 'undefined') return;
    
    const token = AuthService.getToken();
    const refreshToken = localStorage.getItem('refresh_token');

    if (token && refreshToken) {
      this.setState({
        isAuthenticated: true,
        token,
        refreshToken,
      });
    }
  }

  private setState(newState: Partial<AuthState>) {
    const currentState = this.stateSubject.getValue();
    this.stateSubject.next({ ...currentState, ...newState });
  }

  getState(): AuthState {
    return this.stateSubject.getValue();
  }

  async login(username: string, password: string): Promise<void> {
    try {
      const response = await AuthService.login(username, password);
      this.setState({
        isAuthenticated: true,
        token: response.access_token,
        refreshToken: response.refresh_token,
      });
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      const newToken = await AuthService.refresh_token();
      if (newToken) {
        const refreshToken = localStorage.getItem('refresh_token');
        this.setState({
          isAuthenticated: true,
          token: newToken,
          refreshToken: refreshToken || null,
        });
        return newToken;
      }
      return null;
    } catch (error) {
      this.logout();
      return null;
    }
  }

  logout() {
    AuthService.logout();
    this.setState(this.initialState);
  }

  get isAuthenticated(): boolean {
    return this.stateSubject.getValue().isAuthenticated;
  }

  get token(): string | null {
    return this.stateSubject.getValue().token;
  }
}

// Exportar instância singleton
export const authStore = new AuthStore();
