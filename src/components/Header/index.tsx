import Link from "next/link";
import { Button } from "@/components/ui/button";
import ModoDemo from "@/components/ModoDemo";

export default function Header() {
  return (
    <header className="bg-cyan-600 shadow-lg">
      <ModoDemo className="border-0 border-b" />
      <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between text-white">
        <Link href="/" className="font-bold text-2xl flex items-center gap-2 hover:opacity-90 transition-opacity duration-200">
          🐾 Pet Manager
        </Link>

        <div className="flex items-center gap-4">
          <Link 
            href="/" 
            className="font-medium text-white/95 hover:text-white transition-colors duration-200 px-2 py-1 rounded-md hover:bg-white/10"
          >
            Pets
          </Link>
          <Link 
            href="/tutores" 
            className="font-medium text-white/95 hover:text-white transition-colors duration-200 px-2 py-1 rounded-md hover:bg-white/10"
          >
            Tutores
          </Link>
          <Button asChild variant="secondary" size="default" className="bg-white text-cyan-600 hover:bg-cyan-50 hover:text-cyan-700">
            <Link href="/cadastro/pet">
              + Novo Pet
            </Link>
          </Button>
        </div>
      </nav>
    </header>
  )
}