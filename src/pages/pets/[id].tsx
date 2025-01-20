import { Pet } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { PetService } from "@/services/petService";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FiArrowLeft, FiUser, FiCalendar, FiTag, FiPhone, FiMapPin, FiLoader, FiAlertCircle, FiEdit, FiMail, FiCreditCard } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isValidImageUrl, getFotoUrl } from "@/lib/utils";

export default function PetDetails() {
    const router = useRouter();
    const { id, from, tutorId } = router.query;
    const [pet, setPet] = useState<Pet | null>(null);
    const [loading, setLoading] = useState(true);

    const { isAuthenticated } = useAuth();

    // Função para determinar a URL de retorno
    const getBackUrl = () => {
        if (from === 'tutor' && tutorId) {
            return `/tutores/${tutorId}`;
        }
        return '/';
    };

    useEffect(() => {
        async function loadData() {
            if (!id) return;
            try {
                const petData = await PetService.getById(Number(id));
                setPet(petData);
            } catch (error) {
                console.error("Erro ao buscar detalhes do pet:", error);
            } finally {
                setLoading(false);
            }
        }

        if (isAuthenticated && id) {
            loadData();
        }
    }, [id, isAuthenticated]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <FiLoader className="animate-spin text-cyan-600 text-4xl mb-4" />
                <p className="text-gray-600 text-lg">Carregando detalhes do pet...</p>
            </div>
        );
    }
    if (!pet) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <FiAlertCircle className="text-red-500 text-4xl mb-4" />
                <p className="text-red-600 text-lg font-semibold">Pet não encontrado.</p>
                <Link href="/" className="mt-4 text-cyan-600 hover:text-cyan-800 transition">
                    Voltar para lista de pets
                </Link>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>{pet.nome} - Detalhes</title>
            </Head>
            <main className="w-full max-w-5xl px-4 mx-auto mt-10 pb-10">
                <div className="flex justify-between items-center mb-6">
                    <Button variant="ghost" asChild>
                        <Link href={getBackUrl()}>
                            <FiArrowLeft className="mr-2" /> {from === 'tutor' ? 'Voltar para o tutor' : 'Voltar para a lista'}
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={`/cadastro/pet?id=${pet.id}`}>
                            <FiEdit className="mr-2" /> Editar Pet
                        </Link>
                    </Button>
                </div>

                <Card className="overflow-hidden shadow-lg">
                    <div className="flex flex-col md:flex-row">
                        {/* Coluna da Foto */}
                        <div className="w-full md:w-1/2 relative bg-gradient-to-br from-primary/10 via-primary/5 to-gray-50 min-h-[400px] md:min-h-[500px]">
                            {(() => {
                                const fotoUrl = getFotoUrl(pet.foto);
                                return isValidImageUrl(fotoUrl) ? (
                                    <Image
                                        src={fotoUrl}
                                        alt={pet.nome}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                        <div className="text-8xl mb-4">🐾</div>
                                        <p className="text-sm text-gray-500">Foto não disponível</p>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Coluna das Informações */}
                        <CardContent className="w-full md:w-1/2 p-8 md:p-10">
                            <div className="mb-6">
                                <CardTitle className="text-5xl font-extrabold mb-3 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                                    {pet.nome}
                                </CardTitle>
                                <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                                    {pet.raca}
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <Card className="border-2 border-gray-100 hover:border-primary/30 transition-colors">
                                    <CardContent className="p-4 flex items-center">
                                        <div className="bg-primary/10 p-3 rounded-lg mr-4">
                                            <FiTag className="text-primary text-xl" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">Raça</p>
                                            <p className="text-lg font-semibold text-gray-800">{pet.raca}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                                
                                <Card className="border-2 border-gray-100 hover:border-primary/30 transition-colors">
                                    <CardContent className="p-4 flex items-center">
                                        <div className="bg-primary/10 p-3 rounded-lg mr-4">
                                            <FiCalendar className="text-primary text-xl" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">Idade</p>
                                            <p className="text-lg font-semibold text-gray-800">{pet.idade} {pet.idade === 1 ? 'ano' : 'anos'}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Dados dos Tutores */}
                            {pet.tutores && pet.tutores.length > 0 ? (
                                <Card className="bg-primary/5 border-primary/20 overflow-hidden">
                                    <CardHeader>
                                        <CardTitle className="text-xl flex items-center">
                                            <FiUser className="mr-2" /> {pet.tutores.length === 1 ? 'Tutor Responsável' : 'Tutores Responsáveis'}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {pet.tutores.map((tutor) => (
                                            <div key={tutor.id} className="border-b border-primary/10 pb-4 last:border-0 last:pb-0 overflow-hidden">
                                                <p className="text-gray-800 font-medium text-lg mb-2 truncate">{tutor.nome}</p>
                                                <div className="text-gray-600 space-y-1">
                                                    {tutor.telefone && (
                                                        <p className="flex items-center min-w-0">
                                                            <FiPhone className="mr-2 text-sm flex-shrink-0" />
                                                            <span className="truncate">{tutor.telefone}</span>
                                                        </p>
                                                    )}
                                                    {tutor.endereco && (
                                                        <p className="flex items-center min-w-0">
                                                            <FiMapPin className="mr-2 text-sm flex-shrink-0" />
                                                            <span className="truncate">{tutor.endereco}</span>
                                                        </p>
                                                    )}
                                                    {tutor.email && (
                                                        <p className="flex items-center min-w-0">
                                                            <FiMail className="mr-2 text-sm flex-shrink-0" />
                                                            <span className="truncate">{tutor.email}</span>
                                                        </p>
                                                    )}
                                                    {tutor.cpf && (
                                                        <p className="flex items-center min-w-0">
                                                            <FiCreditCard className="mr-2 text-sm flex-shrink-0" />
                                                            <span className="truncate">{tutor.cpf}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className="bg-muted">
                                    <CardContent className="pt-6">
                                        <p className="text-muted-foreground italic">Este pet ainda não possui tutores vinculados.</p>
                                    </CardContent>
                                </Card>
                            )}
                        </CardContent>
                    </div>
                </Card>
            </main>
        </>
    );
}
