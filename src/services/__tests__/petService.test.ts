import { PetService } from "../petService";
import { api } from "../api";
import { Pet, Pageable } from "@/types";

jest.mock("../api");

describe("PetService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("deve buscar pets com paginação", async () => {
      const mockPageable: Pageable<Pet> = {
        content: [
          { id: 1, nome: "Rex", idade: 3, raca: "Labrador" },
        ],
        totalElements: 1,
        totalPages: 1,
        size: 10,
        number: 0,
      };

      (api.get as jest.Mock).mockResolvedValue({ data: mockPageable });

      const result = await PetService.getAll(0, 10);

      expect(api.get).toHaveBeenCalledWith("/v1/pets", {
        params: { page: 0, size: 10 },
      });
      expect(result).toEqual(mockPageable);
    });

    it("deve buscar pets com filtro de nome", async () => {
      const mockPageable: Pageable<Pet> = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 10,
        number: 0,
      };

      (api.get as jest.Mock).mockResolvedValue({ data: mockPageable });

      await PetService.getAll(0, 10, "Rex");

      expect(api.get).toHaveBeenCalledWith("/v1/pets", {
        params: { page: 0, size: 10, nome: "Rex" },
      });
    });
  });

  describe("getById", () => {
    it("deve buscar pet por ID", async () => {
      const mockPet: Pet = {
        id: 1,
        nome: "Rex",
        idade: 3,
        raca: "Labrador",
      };

      (api.get as jest.Mock).mockResolvedValue({ data: mockPet });

      const result = await PetService.getById(1);

      expect(api.get).toHaveBeenCalledWith("/v1/pets/1");
      expect(result).toEqual(mockPet);
    });
  });

  describe("create", () => {
    it("deve criar um novo pet", async () => {
      const newPet = {
        nome: "Rex",
        idade: 3,
        raca: "Labrador",
      };

      const createdPet: Pet = { id: 1, ...newPet };

      (api.post as jest.Mock).mockResolvedValue({ data: createdPet });

      const result = await PetService.create(newPet);

      expect(api.post).toHaveBeenCalledWith("/v1/pets", newPet);
      expect(result).toEqual(createdPet);
    });
  });

  describe("update", () => {
    it("deve atualizar um pet existente", async () => {
      const updates = { nome: "Rex Atualizado" };
      const updatedPet: Pet = {
        id: 1,
        nome: "Rex Atualizado",
        idade: 3,
        raca: "Labrador",
      };

      (api.put as jest.Mock).mockResolvedValue({ data: updatedPet });

      const result = await PetService.update(1, updates);

      expect(api.put).toHaveBeenCalledWith("/v1/pets/1", updates);
      expect(result).toEqual(updatedPet);
    });
  });

  describe("delete", () => {
    it("deve deletar um pet", async () => {
      (api.delete as jest.Mock).mockResolvedValue({});

      await PetService.delete(1);

      expect(api.delete).toHaveBeenCalledWith("/v1/pets/1");
    });
  });

  describe("uploadPhoto", () => {
    it("deve fazer upload de foto", async () => {
      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      (api.post as jest.Mock).mockResolvedValue({});

      await PetService.uploadPhoto(1, file);

      expect(api.post).toHaveBeenCalledWith(
        "/v1/pets/1/fotos",
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
