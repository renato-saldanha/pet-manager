import { cn, getFotoUrl, isValidImageUrl } from "../utils";
import { FotoDto } from "@/types";

describe("utils", () => {
  describe("cn", () => {
    it("deve combinar classes CSS corretamente", () => {
      expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("deve remover classes duplicadas", () => {
      expect(cn("px-2 py-1", "px-4")).toContain("py-1");
    });

    it("deve lidar com valores condicionais", () => {
      expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
    });
  });

  describe("getFotoUrl", () => {
    it("deve retornar null quando foto é null", () => {
      expect(getFotoUrl(null)).toBeNull();
    });

    it("deve retornar null quando foto é undefined", () => {
      expect(getFotoUrl(undefined)).toBeNull();
    });

    it("deve retornar null quando foto é string vazia", () => {
      expect(getFotoUrl("")).toBeNull();
    });

    it("deve retornar null quando foto é string com apenas espaços", () => {
      expect(getFotoUrl("   ")).toBeNull();
    });

    it("deve retornar a URL quando foto é uma string válida", () => {
      const url = "https://example.com/foto.jpg";
      expect(getFotoUrl(url)).toBe(url);
    });

    it("deve retornar a URL trimada quando foto é uma string com espaços", () => {
      const url = "  https://example.com/foto.jpg  ";
      expect(getFotoUrl(url)).toBe("https://example.com/foto.jpg");
    });

    it("deve retornar null quando foto é um objeto sem propriedade url", () => {
      expect(getFotoUrl({})).toBeNull();
    });

    it("deve retornar null quando foto é um objeto com url null", () => {
      expect(getFotoUrl({ url: null })).toBeNull();
    });

    it("deve retornar null quando foto é um objeto com url undefined", () => {
      expect(getFotoUrl({ url: undefined })).toBeNull();
    });

    it("deve retornar null quando foto é um objeto com url vazia", () => {
      expect(getFotoUrl({ url: "" })).toBeNull();
    });

    it("deve retornar null quando foto é um objeto com url com apenas espaços", () => {
      expect(getFotoUrl({ url: "   " })).toBeNull();
    });

    it("deve retornar a URL quando foto é um FotoDto válido", () => {
      const fotoDto: FotoDto = {
        id: 1,
        nome: "foto.jpg",
        contentType: "image/jpeg",
        url: "https://example.com/foto.jpg",
      };
      expect(getFotoUrl(fotoDto)).toBe("https://example.com/foto.jpg");
    });

    it("deve retornar a URL trimada quando foto é um FotoDto com url com espaços", () => {
      const fotoDto: FotoDto = {
        id: 1,
        nome: "foto.jpg",
        contentType: "image/jpeg",
        url: "  https://example.com/foto.jpg  ",
      };
      expect(getFotoUrl(fotoDto)).toBe("https://example.com/foto.jpg");
    });

    it("deve retornar null quando foto é um objeto com url que não é string", () => {
      expect(getFotoUrl({ url: 123 })).toBeNull();
      expect(getFotoUrl({ url: true })).toBeNull();
      expect(getFotoUrl({ url: {} })).toBeNull();
    });
  });

  describe("isValidImageUrl", () => {
    it("deve retornar false quando url é null", () => {
      expect(isValidImageUrl(null)).toBe(false);
    });

    it("deve retornar false quando url é undefined", () => {
      expect(isValidImageUrl(undefined)).toBe(false);
    });

    it("deve retornar false quando url é string vazia", () => {
      expect(isValidImageUrl("")).toBe(false);
    });

    it("deve retornar true quando url começa com http://", () => {
      expect(isValidImageUrl("http://example.com/foto.jpg")).toBe(true);
    });

    it("deve retornar true quando url começa com https://", () => {
      expect(isValidImageUrl("https://example.com/foto.jpg")).toBe(true);
    });

    it("deve retornar true quando url começa com blob:", () => {
      expect(isValidImageUrl("blob:http://localhost:3000/abc123")).toBe(true);
    });

    it("deve retornar true quando url começa com /", () => {
      expect(isValidImageUrl("/images/foto.jpg")).toBe(true);
    });

    it("deve retornar false quando url não começa com http, https, blob ou /", () => {
      expect(isValidImageUrl("ftp://example.com/foto.jpg")).toBe(false);
      expect(isValidImageUrl("file:///path/to/foto.jpg")).toBe(false);
      expect(isValidImageUrl("invalid-url")).toBe(false);
    });

    it("deve retornar true quando recebe um FotoDto com URL válida", () => {
      const fotoDto: FotoDto = {
        id: 1,
        nome: "foto.jpg",
        contentType: "image/jpeg",
        url: "https://example.com/foto.jpg",
      };
      expect(isValidImageUrl(fotoDto)).toBe(true);
    });

    it("deve retornar false quando recebe um FotoDto com URL inválida", () => {
      const fotoDto: FotoDto = {
        id: 1,
        nome: "foto.jpg",
        contentType: "image/jpeg",
        url: "ftp://example.com/foto.jpg",
      };
      expect(isValidImageUrl(fotoDto)).toBe(false);
    });

    it("deve retornar false quando recebe um FotoDto com URL vazia", () => {
      const fotoDto: FotoDto = {
        id: 1,
        nome: "foto.jpg",
        contentType: "image/jpeg",
        url: "",
      };
      expect(isValidImageUrl(fotoDto)).toBe(false);
    });

    it("deve retornar true quando recebe uma string com URL blob válida", () => {
      expect(isValidImageUrl("blob:http://localhost:3000/abc-123-def")).toBe(true);
    });

    it("deve retornar true quando recebe uma string com URL relativa válida", () => {
      expect(isValidImageUrl("/static/images/foto.jpg")).toBe(true);
    });
  });
});
