import { Pet, Pageable } from "@/types";
import { PetService } from "@/services/petService";
import { useAuth } from "@/context/AuthContext";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FiSearch, FiLoader, FiInbox, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { isValidImageUrl, getFotoUrl } from "@/lib/utils";

export default function Home() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageInfo, setPageInfo] = useState<Pageable<Pet> | null>(null);
  const pageSize = 10;

  const { isAuthenticated } = useAuth();

  async function fetchPets(page: number = 0, nome: string = "") {
    setLoading(true);
    try {
      const data = await PetService.getAll(page, pageSize, nome);

      if (data && typeof data === "object" && "content" in data && Array.isArray(data.content)) {
        setPets(data.content);
        setPageInfo(data);
      } else if (Array.isArray(data)) {
        setPets(data);
        setPageInfo(null);
      } else {
        setPets([]);
        setPageInfo(null);
      }
    } catch (error) {
      console.error("Erro ao buscar pets:", error);
      setPets([]);
      setPageInfo(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchPets(currentPage, searchTerm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, currentPage]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setCurrentPage(0); // Reset para primeira página ao buscar
    fetchPets(0, searchTerm);
  }

  function handlePreviousPage() {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleNextPage() {
    const totalPages = pageInfo?.pageCount || pageInfo?.totalPages || 0;
    if (pageInfo && totalPages > 0 && currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // A API pode retornar pageCount/total ou totalPages/totalElements
  const totalPages = pageInfo?.pageCount || pageInfo?.totalPages || 0;
  const totalElements = pageInfo?.total || pageInfo?.totalElements || 0;
  const hasNextPage = pageInfo && totalPages > 0 ? currentPage < totalPages - 1 : false;
  const hasPreviousPage = currentPage > 0;

  return (
    <>
      <Head>
        <title>Pet Manager - Governo de MT</title>
      </Head>
      <main className="w-full max-w-7xl px-4 mx-auto mt-10 pb-12">
        <div className="mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div className="space-y-2">
              <h1 className="text-slate-800">Pets Registrados</h1>
              <p className="text-gray-600 text-base">Gerencie e visualize todos os pets cadastrados</p>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
              <Input
                type="text"
                placeholder="Buscar por nome..."
                className="w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button type="submit">
                <FiSearch className="mr-2" /> Buscar
              </Button>
            </form>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <Skeleton className="w-full h-48 rounded-t-lg" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {pets.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {pets.map(pet => (
                    <Card key={pet.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group border-2 border-transparent hover:border-primary/20">
                      <div className="relative w-full h-56 bg-gradient-to-br from-primary/10 via-primary/5 to-gray-50 overflow-hidden">
                        {(() => {
                          const fotoUrl = getFotoUrl(pet.foto);
                          return isValidImageUrl(fotoUrl) ? (
                            <Image
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              src={fotoUrl}
                              alt={pet.nome}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                              <div className="text-6xl mb-2">🐾</div>
                              <p className="text-xs text-gray-400">Sem foto</p>
                            </div>
                          );
                        })()}
                        <div className="absolute top-3 right-3">
                          <span className="bg-primary/90 text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm">
                            {pet.raca}
                          </span>
                        </div>
                      </div>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">{pet.nome}</CardTitle>
                        <CardDescription className="font-medium text-gray-600">
                          {pet.raca}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0 pb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-semibold">Idade:</span>
                          <span>{pet.idade} {pet.idade === 1 ? 'ano' : 'anos'}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <Button asChild variant="default" className="w-full">
                          <Link href={`/pets/${pet.id}`}>
                            Ver Detalhes
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                {/* Paginação */}
                {pageInfo && totalPages > 0 && (
                  <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="text-sm text-gray-600 font-medium">
                      Mostrando <span className="font-semibold text-gray-800">{(currentPage * pageSize) + 1}</span> até{' '}
                      <span className="font-semibold text-gray-800">
                        {Math.min((currentPage + 1) * pageSize, totalElements)}
                      </span>{' '}
                      de <span className="font-semibold text-gray-800">{totalElements}</span> pets
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={!hasPreviousPage || loading}
                        className="gap-2"
                      >
                        <FiChevronLeft />
                        Anterior
                      </Button>
                      <div className="flex items-center gap-2 px-4">
                        <span className="text-sm text-gray-600 font-medium">
                          Página <span className="font-semibold text-gray-800">{currentPage + 1}</span> de{' '}
                          <span className="font-semibold text-gray-800">{totalPages}</span>
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={!hasNextPage || loading}
                        className="gap-2"
                      >
                        Próxima
                        <FiChevronRight />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
                <FiInbox className="text-gray-400 text-5xl mb-2" />
                <h3 className="text-gray-700">Nenhum pet encontrado.</h3>
                <p className="text-gray-500 text-base">Tente ajustar sua busca ou cadastre um novo pet.</p>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
