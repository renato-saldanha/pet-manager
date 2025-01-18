// Módulo de Pets - Carregado dinamicamente
// Este módulo agrupa todas as funcionalidades relacionadas a Pets
import { ReactNode } from "react";

interface PetsModuleProps {
  children: ReactNode;
}

export default function PetsModule({ children }: PetsModuleProps) {
  // Este componente wrapper permite lazy loading do módulo de Pets
  // O Next.js fará code splitting automático quando este módulo for importado
  return <>{children}</>;
}
