import { TutorService } from "@/services/tutorService";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FiArrowLeft, FiSave, FiLoader, FiUpload, FiX } from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";
import { MaskedInput } from "@/components/MaskedInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isValidImageUrl } from "@/lib/utils";

export default function CadastroTutor() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        nome: "",
        telefone: "",
        endereco: "",
        email: "",
        cpf: "",
    });
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Cleanup para revogar URL do objeto quando componente desmontar
    useEffect(() => {
        return () => {
            if (photoPreview && photoPreview.startsWith('blob:')) {
                URL.revokeObjectURL(photoPreview);
            }
        };
    }, [photoPreview]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            // Criar tutor primeiro
            const newTutor = await TutorService.create(formData);
            toast.success("Tutor cadastrado com sucesso!");

            // Upload photo if exists (tratamento separado para não afetar o sucesso do cadastro)
            if (photo && newTutor.id) {
                try {
                    await TutorService.uploadPhoto(newTutor.id, photo);
                    toast.success("Foto enviada com sucesso!");
                } catch (uploadError) {
                    console.error("Erro ao fazer upload da foto:", uploadError);
                    toast.error("Tutor salvo, mas houve erro ao enviar a foto.");
                }
            }

            router.push(`/tutores/${newTutor.id}`); // Redirect to details to add pets
        } catch (error) {
            console.error(error);
            toast.error("Erro ao cadastrar tutor.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Head>
                <title>Novo Tutor - Pet Manager</title>
            </Head>
            <main className="w-full max-w-2xl px-4 mx-auto mt-10">
                <Link href="/tutores" className="inline-flex items-center text-cyan-600 hover:text-cyan-800 mb-6 transition">
                    <FiArrowLeft className="mr-2" /> Voltar
                </Link>

                <h1 className="text-3xl font-bold text-slate-800 mb-6">Cadastrar Novo Tutor</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>Dados do Tutor</CardTitle>
                        <CardDescription>Preencha as informações para cadastrar um novo tutor</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="nome">Nome Completo</Label>
                                <Input
                                    id="nome"
                                    type="text"
                                    required
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="telefone">Telefone</Label>
                                <MaskedInput
                                    id="telefone"
                                    mask="(99) 99999-9999"
                                    value={formData.telefone}
                                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                    required
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
                                    required
                                    value={formData.endereco}
                                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="foto">Foto do Tutor</Label>
                                {isValidImageUrl(photoPreview) ? (
                                    <div className="relative w-full rounded-lg overflow-hidden border-2 border-input bg-gray-100">
                                        <div className="relative w-full aspect-square max-h-96">
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
                                                    alt="Preview da foto"
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
                                            <p className="text-sm text-muted-foreground text-center">
                                                {photo ? photo.name : "Foto carregada"}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-input rounded-lg p-8 flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:bg-primary/5 cursor-pointer transition-all duration-200 relative group">
                                        <input
                                            id="foto"
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
                                        <div className="bg-primary/10 p-4 rounded-full mb-3 group-hover:bg-primary/20 transition-colors">
                                            <FiUpload size={28} className="text-primary" />
                                        </div>
                                        <p className="font-medium">Clique para selecionar uma foto</p>
                                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG ou GIF (máx. 10MB)</p>
                                    </div>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full"
                            >
                                {loading ? (
                                    <>
                                        <FiLoader className="animate-spin mr-2" /> Salvando...
                                    </>
                                ) : (
                                    <>
                                        <FiSave className="mr-2" /> Salvar Tutor
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </>
    );
}
