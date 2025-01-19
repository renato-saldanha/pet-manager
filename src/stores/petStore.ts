import { BehaviorSubject, Observable } from 'rxjs';
import { Pet, Pageable } from '@/types';
import { PetService } from '@/services/petService';

interface PetState {
  pets: Pet[];
  currentPet: Pet | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
  } | null;
}

class PetStore {
  private initialState: PetState = {
    pets: [],
    currentPet: null,
    loading: false,
    error: null,
    pagination: null,
  };

  private stateSubject = new BehaviorSubject<PetState>(this.initialState);
  public state$: Observable<PetState> = this.stateSubject.asObservable();

  private setState(newState: Partial<PetState>) {
    const currentState = this.stateSubject.getValue();
    this.stateSubject.next({ ...currentState, ...newState });
  }

  getState(): PetState {
    return this.stateSubject.getValue();
  }

  async fetchPets(page: number = 0, size: number = 10, nome?: string) {
    this.setState({ loading: true, error: null });

    try {
      const data = await PetService.getAll(page, size, nome);
      this.setState({
        pets: data.content || [],
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
        error: error instanceof Error ? error.message : 'Erro ao buscar pets',
      });
    }
  }

  async fetchPetById(id: number) {
    this.setState({ loading: true, error: null, currentPet: null });

    try {
      const pet = await PetService.getById(id);
      this.setState({
        currentPet: pet,
        loading: false,
      });
    } catch (error) {
      this.setState({
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar pet',
      });
    }
  }

  async createPet(pet: Omit<Pet, 'id'>) {
    this.setState({ loading: true, error: null });

    try {
      const newPet = await PetService.create(pet);
      const currentState = this.stateSubject.getValue();
      this.setState({
        pets: [...currentState.pets, newPet],
        loading: false,
      });
      return newPet;
    } catch (error) {
      this.setState({
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao criar pet',
      });
      throw error;
    }
  }

  async updatePet(id: number, pet: Partial<Pet>) {
    this.setState({ loading: true, error: null });

    try {
      const updatedPet = await PetService.update(id, pet);
      const currentState = this.stateSubject.getValue();
      this.setState({
        pets: currentState.pets.map((p) => (p.id === id ? updatedPet : p)),
        currentPet: currentState.currentPet?.id === id ? updatedPet : currentState.currentPet,
        loading: false,
      });
      return updatedPet;
    } catch (error) {
      this.setState({
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao atualizar pet',
      });
      throw error;
    }
  }

  async deletePet(id: number) {
    this.setState({ loading: true, error: null });

    try {
      await PetService.delete(id);
      const currentState = this.stateSubject.getValue();
      this.setState({
        pets: currentState.pets.filter((p) => p.id !== id),
        currentPet: currentState.currentPet?.id === id ? null : currentState.currentPet,
        loading: false,
      });
    } catch (error) {
      this.setState({
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao deletar pet',
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
export const petStore = new PetStore();
