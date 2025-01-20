import { Tutor, Pageable } from "@/types";
import { TutorService } from "@/services/tutorService";
import { useAuth } from "@/context/AuthContext";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiPlus, FiUser, FiInbox, FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TutoresList() {
    const [tutores, setTutores] = useState<Tutor[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [pageInfo, setPageInfo] = useState<Pageable<Tutor> | null>(null);
    const pageSize = 12;

    const { isAuthenticated } = useAuth();

    async function loadTutores(page: number = 0, nome: string = "") {
        setLoading(true);
        try {
            const data = await TutorService.getAll(page, pageSize, nome);

            if (data && typeof data === "object" && "content" in data && Array.isArray(data.content)) {
                setTutores(data.content);
                setPageInfo(data);
            } else if (Array.isArray(data)) {
                setTutores(data);
                setPageInfo(null);
            } else {
                setTutores([]);
                setPageInfo(null);
            }
        } catch (error) {
            console.error("Erro ao buscar tutores:", error);
            setTutores([]);
            setPageInfo(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (isAuthenticated) {
            loadTutores(currentPage, searchTerm);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, currentPage]);

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        setCurrentPage(0); // Reset para primeira página ao buscar
        loadTutores(0, searchTerm);
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
                <title>Tutores - Pet Manager</title>
            </Head>
            <main className="w-full max-w-5xl px-4 mx-auto mt-10 pb-12">
                <div className="mb-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                        <div className="space-y-2">
                            <h1 className="text-slate-800">Tutores Registrados</h1>
                            <p className="text-gray-600 text-base">Gerencie e visualize todos os tutores cadastrados</p>
                        </div>
                        <Button asChild>
                            <Link href="/cadastro/tutor">
                                <FiPlus className="mr-2" /> Novo Tutor
                            </Link>
                        </Button>
                    </div>

                    <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto mb-6">
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

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <Card key={i}>
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-12 w-12 rounded-full" />
                                        <div className="flex-1">
                                            <Skeleton className="h-5 w-3/4 mb-2" />
                                            <Skeleton className="h-4 w-1/2" />
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <>
                        {tutores.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {tutores.map(tutor => (
                                        <Link href={`/tutores/${tutor.id}`} key={tutor.id} className="block">
                                            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden hover:-translate-y-1 border-2 border-transparent hover:border-primary/20">
                                                <CardHeader>
                                                    <div className="flex items-center gap-4">
                                                        <div className="bg-primary/10 p-3 rounded-full text-primary flex-shrink-0">
                                                            <FiUser size={24} />
                                                        </div>
                                                        <div className="min-w-0 flex-1 overflow-hidden">
                                                            <CardTitle className="truncate">{tutor.nome}</CardTitle>
                                                            <CardDescription className="truncate">
                                                                {tutor.telefone || "Sem telefone"}
                                                            </CardDescription>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                            </Card>
                                        </Link>
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
                                            de <span className="font-semibold text-gray-800">{totalElements}</span> tutores
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
                                <h3 className="text-gray-700">Nenhum tutor encontrado.</h3>
                                <p className="text-gray-500 text-base">
                                    {searchTerm ? "Tente ajustar sua busca ou cadastre um novo tutor." : "Cadastre um novo tutor para começar."}
                                </p>
                            </div>
                        )}
                    </>
                )}
            </main>
        </>
    );
}
