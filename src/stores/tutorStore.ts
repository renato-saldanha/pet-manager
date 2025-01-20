import { BehaviorSubject, Observable } from 'rxjs';
import { Tutor, Pageable } from '@/types';
import { TutorService } from '@/services/tutorService';

interface TutorState {
  tutores: Tutor[];
  currentTutor: Tutor | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
  } | null;
}

class TutorStore {
  private initialState: TutorState = {
    tutores: [],
    currentTutor: null,
    loading: false,
    error: null,
    pagination: null,
  };

  private stateSubject = new BehaviorSubject<TutorState>(this.initialState);
  public state$: Observable<TutorState> = this.stateSubject.asObservable();

  private setState(newState: Partial<TutorState>) {
    const currentState = this.stateSubject.getValue();
    this.stateSubject.next({ ...currentState, ...newState });
  }

  getState(): TutorState {
    return this.stateSubject.getValue();
  }

  async fetchTutores(page: number = 0, size: number = 10) {
    this.setState({ loading: true, error: null });

    try {
      const data = await TutorService.getAll(page, size);
      this.setState({
        tutores: data.content || [],
        loading: false,
        pagination: {
          currentPage: data.number || 0,
          totalPages: data.totalPages || 0,
          totalElements: data.totalElements || 0,
          pageSize: data.size || size,
        },
      });
    } catch (error) {
      this.setState({
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar tutores',
      });
    }
  }

  async fetchTutorById(id: number) {
    this.setState({ loading: true, error: null, currentTutor: null });

    try {
      const tutor = await TutorService.getById(id);
      this.setState({
        currentTutor: tutor,
        loading: false,
      });
    } catch (error) {
      this.setState({
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar tutor',
      });
    }
  }

  async createTutor(tutor: Omit<Tutor, 'id'>) {
    this.setState({ loading: true, error: null });

    try {
      const newTutor = await TutorService.create(tutor);
      const currentState = this.stateSubject.getValue();
      this.setState({
        tutores: [...currentState.tutores, newTutor],
        loading: false,
      });
      return newTutor;
    } catch (error) {
      this.setState({
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao criar tutor',
      });
      throw error;
    }
  }

  async updateTutor(id: number, tutor: Partial<Tutor>) {
    this.setState({ loading: true, error: null });

    try {
      const updatedTutor = await TutorService.update(id, tutor);
      const currentState = this.stateSubject.getValue();
      this.setState({
        tutores: currentState.tutores.map((t) => (t.id === id ? updatedTutor : t)),
        currentTutor: currentState.currentTutor?.id === id ? updatedTutor : currentState.currentTutor,
        loading: false,
      });
      return updatedTutor;
    } catch (error) {
      this.setState({
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao atualizar tutor',
      });
      throw error;
    }
  }

  async deleteTutor(id: number) {
    this.setState({ loading: true, error: null });

    try {
      await TutorService.delete(id);
      const currentState = this.stateSubject.getValue();
      this.setState({
        tutores: currentState.tutores.filter((t) => t.id !== id),
        currentTutor: currentState.currentTutor?.id === id ? null : currentState.currentTutor,
        loading: false,
      });
    } catch (error) {
      this.setState({
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao deletar tutor',
      });
      throw error;
    }
  }

  async linkPet(tutorId: number, petId: number) {
    this.setState({ loading: true, error: null });

    try {
      await TutorService.linkPet(tutorId, petId);
      // Recarregar tutor para obter lista atualizada de pets
      await this.fetchTutorById(tutorId);
    } catch (error) {
      this.setState({
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao vincular pet',
      });
      throw error;
    }
  }

  async unlinkPet(tutorId: number, petId: number) {
    this.setState({ loading: true, error: null });

    try {
      await TutorService.unlinkPet(tutorId, petId);
      // Recarregar tutor para obter lista atualizada de pets
      await this.fetchTutorById(tutorId);
    } catch (error) {
      this.setState({
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao desvincular pet',
      });
      throw error;
    }
  }

  clearError() {
    this.setState({ error: null });
  }

  reset() {
    this.stateSubject.next(this.initialState);
  }
}

// Exportar instância singleton
export const tutorStore = new TutorStore();
