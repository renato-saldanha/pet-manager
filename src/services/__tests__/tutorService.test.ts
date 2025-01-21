import { TutorService } from "../tutorService";
import { api } from "../api";
import { Tutor, Pageable } from "@/types";

jest.mock("../api");

describe("TutorService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("deve buscar tutores com paginação", async () => {
      const mockPageable: Pageable<Tutor> = {
        content: [
          {
            id: 1,
            nome: "João Silva",
            telefone: "(65) 99999-9999",
            endereco: "Rua Teste, 123",
          },
        ],
        totalElements: 1,
        totalPages: 1,
        size: 10,
        number: 0,
      };

      (api.get as jest.Mock).mockResolvedValue({ data: mockPageable });

      const result = await TutorService.getAll(0, 10);

      expect(api.get).toHaveBeenCalledWith("/v1/tutores", {
        params: { page: 0, size: 10 },
      });
      expect(result).toEqual(mockPageable);
    });
  });

  describe("getById", () => {
    it("deve buscar tutor por ID", async () => {
      const mockTutor: Tutor = {
        id: 1,
        nome: "João Silva",
        telefone: "(65) 99999-9999",
        endereco: "Rua Teste, 123",
      };

      (api.get as jest.Mock).mockResolvedValue({ data: mockTutor });

      const result = await TutorService.getById(1);

      expect(api.get).toHaveBeenCalledWith("/v1/tutores/1");
      expect(result).toEqual(mockTutor);
    });
  });

  describe("create", () => {
    it("deve criar um novo tutor", async () => {
      const newTutor = {
        nome: "João Silva",
        telefone: "(65) 99999-9999",
        endereco: "Rua Teste, 123",
      };

      const createdTutor: Tutor = { id: 1, ...newTutor };

      (api.post as jest.Mock).mockResolvedValue({ data: createdTutor });

      const result = await TutorService.create(newTutor);

      expect(api.post).toHaveBeenCalledWith("/v1/tutores", newTutor);
      expect(result).toEqual(createdTutor);
    });
  });

  describe("update", () => {
    it("deve atualizar um tutor existente", async () => {
      const updates = { nome: "João Silva Atualizado" };
      const updatedTutor: Tutor = {
        id: 1,
        nome: "João Silva Atualizado",
        telefone: "(65) 99999-9999",
        endereco: "Rua Teste, 123",
      };

      (api.put as jest.Mock).mockResolvedValue({ data: updatedTutor });

      const result = await TutorService.update(1, updates);

      expect(api.put).toHaveBeenCalledWith("/v1/tutores/1", updates);
      expect(result).toEqual(updatedTutor);
    });
  });

  describe("delete", () => {
    it("deve deletar um tutor", async () => {
      (api.delete as jest.Mock).mockResolvedValue({});

      await TutorService.delete(1);

      expect(api.delete).toHaveBeenCalledWith("/v1/tutores/1");
    });
  });

  describe("linkPet", () => {
    it("deve vincular um pet a um tutor", async () => {
      (api.post as jest.Mock).mockResolvedValue({});

      await TutorService.linkPet(1, 2);

      expect(api.post).toHaveBeenCalledWith("/v1/tutores/1/pets/2");
    });
  });

  describe("unlinkPet", () => {
    it("deve desvincular um pet de um tutor", async () => {
      (api.delete as jest.Mock).mockResolvedValue({});

      await TutorService.unlinkPet(1, 2);

      expect(api.delete).toHaveBeenCalledWith("/v1/tutores/1/pets/2");
    });
  });

  describe("uploadPhoto", () => {
    it("deve fazer upload de foto do tutor", async () => {
      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      (api.post as jest.Mock).mockResolvedValue({});

      await TutorService.uploadPhoto(1, file);

      expect(api.post).toHaveBeenCalledWith(
        "/v1/tutores/1/fotos",
        expect.any(FormData),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    });
  });
});
