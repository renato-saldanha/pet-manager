import { TutorService } from "@/services/tutorService";
import { useAuth } from "@/context/AuthContext";
import { PetService } from "@/services/petService";
import { Tutor, Pet } from "@/types";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiArrowLeft, FiSave, FiTrash2, FiPlus, FiX, FiLoader, FiAlertCircle, FiInbox, FiUpload } from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";
import { MaskedInput } from "@/components/MaskedInput";
import { isValidImageUrl, getFotoUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DetalhesTutor() {
    const router = useRouter();
    const { id } = router.query;

    const [tutor, setTutor] = useState<Tutor | null>(null);
    const [formData, setFormData] = useState({ nome: "", telefone: "", endereco: "", email: "", cpf: "" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Photo upload state
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    // Linking Pets State
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [searchPetTerm, setSearchPetTerm] = useState("");
    const [foundPets, setFoundPets] = useState<Pet[]>([]);
    const [linking, setLinking] = useState(false);

    // Load Tutor Data
    const { isAuthenticated } = useAuth();

    const loadTutor = useCallback(async () => {
        if (!id) return;
        try {
            const data = await TutorService.getById(Number(id));
            setTutor(data);
            setFormData({
                nome: data.nome,
                telefone: data.telefone,
                endereco: data.endereco,
                email: data.email || "",
                cpf: data.cpf || "",
            });
            // Carregar foto existente se houver
            const fotoUrl = getFotoUrl(data.foto);
            if (fotoUrl) {
                setPhotoPreview(fotoUrl);
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar dados do tutor.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (isAuthenticated && id) {
            loadTutor();
        }
    }, [isAuthenticated, id, loadTutor]);

    // Cleanup para revogar URL do objeto quando componente desmontar
    useEffect(() => {
        return () => {
            if (photoPreview && photoPreview.startsWith('blob:')) {
                URL.revokeObjectURL(photoPreview);
            }
        };
    }, [photoPreview]);

    async function handleUpdate(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            await TutorService.update(Number(id), formData);
            toast.success("Tutor atualizado!");
            loadTutor(); // reload to be sure
        } catch (error) {
            toast.error("Erro ao atualizar.");
        } finally {
            setSaving(false);
        }
    }

    async function handleUploadPhoto() {
        if (!photo || !id) return;
        setUploadingPhoto(true);
        try {
            await TutorService.uploadPhoto(Number(id), photo);
            toast.success("Foto enviada com sucesso!");
            setPhoto(null);
            loadTutor(); // Recarregar para mostrar a nova foto
        } catch (error) {
            console.error("Erro ao fazer upload da foto:", error);
            toast.error("Erro ao enviar foto.");
        } finally {
            setUploadingPhoto(false);
        }
    }

    async function handleSearchPets() {
        if (!searchPetTerm) return;
        const res = await PetService.getAll(0, 5, searchPetTerm);
        // Handle pageable or array
        if (res && res.content) setFoundPets(res.content);
        else if (Array.isArray(res)) setFoundPets(res);
        else setFoundPets([]);
    }

    async function handleLinkPet(petId: number) {
        setLinking(true);
        try {
            await TutorService.linkPet(Number(id), petId);
            toast.success("Pet vinculado!");
            setShowLinkModal(false);
            loadTutor(); // Reload to see new pet in list (assuming API returns pets)
        } catch (error) {
            toast.error("Erro ao vincular pet.");
        } finally {
            setLinking(false);
        }
    }

    async function handleUnlinkPet(petId: number) {
        if (!confirm("Tem certeza que deseja desvincular este pet?")) return;
        try {
            await TutorService.unlinkPet(Number(id), petId);
            toast.success("Pet desvinculado.");
            loadTutor();
        } catch (error) {
            toast.error("Erro ao desvincular.");
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <FiLoader className="animate-spin text-cyan-600 text-4xl mb-4" />
                <p className="text-gray-600 text-lg">Carregando dados do tutor...</p>
            </div>
        );
    }
    if (!tutor) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <FiAlertCircle className="text-red-500 text-4xl mb-4" />
                <p className="text-red-600 text-lg font-semibold">Tutor não encontrado.</p>
                <Link href="/tutores" className="mt-4 text-cyan-600 hover:text-cyan-800 transition">
                    Voltar para lista de tutores
                </Link>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>{tutor.nome} - Gerenciar</title>
            </Head>
            <main className="w-full max-w-6xl px-4 mx-auto mt-10 pb-20">
                <Link href="/tutores" className="inline-flex items-center text-cyan-600 hover:text-cyan-800 mb-6 transition">
                    <FiArrowLeft className="mr-2" /> Voltar
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Column 1: Edit Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Dados Pessoais</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdate} className="space-y-4">
                                {/* Foto do Tutor */}
                                <div className="space-y-2">
                                    <Label htmlFor="foto-tutor">Foto do Tutor</Label>
                                    {isValidImageUrl(photoPreview) ? (
                                        <div className="relative w-full rounded-lg overflow-hidden border-2 border-input bg-gray-100">
                                            <div className="relative w-full aspect-square max-h-64">
                                                {photoPreview.startsWith("blob:") ? (
                                                    <Image
                                                        src={photoPreview}
                                                        alt="Preview da foto"
                                                        fill
                                                        unoptimized
                                                        className="object-cover"
                                                        sizes="(max-width: 768px) 100vw, 50vw"
                                                    />
                                                ) : (
                                                    <Image
                                                        src={photoPreview}
                                                        alt="Foto do tutor"
                                                        fill
                                                        className="object-cover"
                                                        sizes="(max-width: 768px) 100vw, 50vw"
                                                    />
                                                )}
                                            </div>
                                            <div className="absolute top-2 right-2 z-10">
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => {
                                                        setPhoto(null);
                                                        if (photoPreview.startsWith('blob:')) {
                                                            URL.revokeObjectURL(photoPreview);
                                                        }
                                                        setPhotoPreview(null);
                                                    }}
                                                    className="rounded-full shadow-lg"
                                                >
                                                    <FiX />
                                                </Button>
                                            </div>
                                            <div className="p-3 bg-card border-t border-input">
                                                <p className="text-sm text-muted-foreground text-center mb-2">
                                                    {photo ? photo.name : "Foto carregada"}
                                                </p>
                                                {photo && (
                                                    <Button
                                                        type="button"
                                                        onClick={handleUploadPhoto}
                                                        disabled={uploadingPhoto}
                                                        className="w-full"
                                                        size="sm"
                                                    >
                                                        {uploadingPhoto ? (
                                                            <>
                                                                <FiLoader className="animate-spin mr-2" /> Enviando...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FiUpload className="mr-2" /> Enviar Foto
                                                            </>
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="border-2 border-dashed border-input rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:bg-primary/5 cursor-pointer transition-all duration-200 relative group">
                                            <input
                                                id="foto-tutor"
                                                type="file"
                                                accept="image/*"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setPhoto(file);
                                                        setPhotoPreview(URL.createObjectURL(file));
                                                    }
                                                }}
                                            />
                                            <div className="bg-primary/10 p-3 rounded-full mb-2 group-hover:bg-primary/20 transition-colors">
                                                <FiUpload size={24} className="text-primary" />
                                            </div>
                                            <p className="font-medium text-sm">Clique para selecionar uma foto</p>
                                            <p className="text-xs text-muted-foreground mt-1">PNG, JPG ou GIF (máx. 10MB)</p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="nome">Nome</Label>
                                    <Input 
                                        id="nome"
                                        type="text" 
                                        value={formData.nome} 
                                        onChange={e => setFormData({ ...formData, nome: e.target.value })} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="telefone">Telefone</Label>
                                    <MaskedInput
                                        id="telefone"
                                        mask="(99) 99999-9999"
                                        value={formData.telefone}
                                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <MaskedInput
                                        id="email"
                                        mask="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="exemplo@email.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cpf">CPF</Label>
                                    <MaskedInput
                                        id="cpf"
                                        mask="999.999.999-99"
                                        value={formData.cpf}
                                        onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                                        placeholder="000.000.000-00"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endereco">Endereço</Label>
                                    <Textarea 
                                        id="endereco"
                                        rows={3}
                                        value={formData.endereco} 
                                        onChange={e => setFormData({ ...formData, endereco: e.target.value })} 
                                    />
                                </div>
                                <Button type="submit" disabled={saving}>
                                    <FiSave className="mr-2" /> {saving ? "Salvando..." : "Salvar Alterações"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Column 2: Linked Pets */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Pets Vinculados</CardTitle>
                                <Button onClick={() => setShowLinkModal(true)} variant="default" size="sm">
                                    <FiPlus className="mr-1" /> Vincular Pet
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>

                            {tutor.pets && tutor.pets.length > 0 ? (
                                <div className="space-y-3">
                                    {tutor.pets.map(pet => (
                                        <div key={pet.id} className="flex justify-between items-center border p-3 rounded hover:bg-gray-50">
                                            <div>
                                                <p className="font-bold text-slate-700">{pet.nome}</p>
                                                <p className="text-sm text-gray-500">{pet.raca}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Link href={`/pets/${pet.id}?from=tutor&tutorId=${id}`} className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold">
                                                    Ver
                                                </Link>
                                                <Button onClick={() => handleUnlinkPet(pet.id)} variant="ghost" size="sm" className="text-red-500 hover:text-red-700" title="Desvincular">
                                                    <FiTrash2 />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <FiInbox className="text-gray-400 text-4xl mb-3" />
                                    <p className="text-gray-500 font-medium">Nenhum pet vinculado a este tutor.</p>
                                    <p className="text-gray-400 text-sm mt-1">Use o botão acima para vincular pets.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Modal Link Pet */}
                {showLinkModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <Card className="w-full max-w-md">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>Vincular Pet</CardTitle>
                                    <Button variant="ghost" size="sm" onClick={() => setShowLinkModal(false)}>
                                        <FiX size={20} />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2 mb-4">
                                    <Input
                                        type="text"
                                        placeholder="Buscar nome do pet..."
                                        value={searchPetTerm}
                                        onChange={(e) => setSearchPetTerm(e.target.value)}
                                    />
                                    <Button onClick={handleSearchPets}>
                                        Buscar
                                    </Button>
                                </div>

                                <div className="max-h-60 overflow-y-auto space-y-2">
                                    {foundPets.map(pet => (
                                        <div key={pet.id} className="flex justify-between items-center border p-2 rounded">
                                            <span>{pet.nome} — {pet.raca}</span>
                                            <Button
                                                onClick={() => handleLinkPet(pet.id)}
                                                disabled={linking}
                                                variant="outline"
                                                size="sm"
                                                className="bg-green-50 text-green-700 hover:bg-green-100"
                                            >
                                                Vincular
                                            </Button>
                                        </div>
                                    ))}
                                    {foundPets.length === 0 && searchPetTerm && (
                                        <div className="flex flex-col items-center justify-center py-6 text-center">
                                            <FiInbox className="text-gray-400 text-2xl mb-2" />
                                            <p className="text-sm text-gray-500">Nenhum pet encontrado.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

            </main>
        </>
    );
}
