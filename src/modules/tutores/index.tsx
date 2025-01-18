// Módulo de Tutores - Carregado dinamicamente
// Este módulo agrupa todas as funcionalidades relacionadas a Tutores
import { ReactNode } from "react";

interface TutoresModuleProps {
  children: ReactNode;
}

export default function TutoresModule({ children }: TutoresModuleProps) {
  // Este componente wrapper permite lazy loading do módulo de Tutores
  // O Next.js fará code splitting automático quando este módulo for importado
  return <>{children}</>;
}
