import { PetService } from "@/services/petService";
import { Pet } from "@/types";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiArrowLeft, FiSave, FiUpload, FiLoader, FiX } from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isValidImageUrl, getFotoUrl } from "@/lib/utils";

interface PetForm {
    nome: string;
    raca: string;
    idade: string;
}

export default function CadastroPet() {
    const router = useRouter();
    const { id } = router.query;
    const isEditing = !!id;

    const [formData, setFormData] = useState<PetForm>({
        nome: "",
        raca: "",
        idade: "",
    });

    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setPhoto(file);
            setPhotoPreview((prev) => {
                if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
                return URL.createObjectURL(file);
            });
        }
        e.target.value = "";
    }

    useEffect(() => {
        async function loadPet() {
            if (isEditing && id) {
                try {
                    const petId = Number(id);
                    if (isNaN(petId)) return;

                    const data = await PetService.getById(petId);
                    setFormData({
                        nome: data.nome,
                        raca: data.raca,
                        idade: data.idade.toString(),
                    });
                    const fotoUrl = getFotoUrl(data.foto);
                    if (fotoUrl && isValidImageUrl(fotoUrl)) {
                        setPhotoPreview(fotoUrl);
                    }
                } catch (error) {
                    toast.error("Erro ao carregar dados do pet.");
                    console.error(error);
                }
            }
        }
        loadPet();
    }, [id, isEditing]);

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
            const petPayload = {
                nome: formData.nome,
                raca: formData.raca,
                idade: Number(formData.idade),
            };

            let petId = Number(id);

            // Salvar ou atualizar pet
            if (isEditing) {
                await PetService.update(petId, petPayload);
                toast.success("Pet atualizado com sucesso!");
            } else {
                const newPet = await PetService.create(petPayload);
                petId = newPet.id;
                toast.success("Pet cadastrado com sucesso!");
            }

            // Upload photo if exists (tratamento separado para não afetar o sucesso do cadastro)
            if (photo && petId) {
                try {
                    await PetService.uploadPhoto(petId, photo);
                    toast.success("Foto enviada com sucesso!");
                } catch (uploadError) {
                    console.error("Erro ao fazer upload da foto:", uploadError);
                    toast.error("Pet salvo, mas houve erro ao enviar a foto.");
                }
            }

            router.push("/");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar pet. Verifique os dados.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Head>
                <title>{isEditing ? "Editar Pet" : "Novo Pet"} - Pet Manager</title>
            </Head>
            <main className="w-full max-w-3xl px-4 mx-auto mt-10 pb-10">
                <Link href="/" className="inline-flex items-center text-cyan-600 hover:text-cyan-800 mb-6 transition">
                    <FiArrowLeft className="mr-2" /> Voltar
                </Link>

                <h1 className="text-3xl font-bold text-slate-800 mb-6">{isEditing ? "Editar Pet" : "Cadastrar Novo Pet"}</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>{isEditing ? "Editar Pet" : "Dados do Pet"}</CardTitle>
                        <CardDescription>
                            {isEditing ? "Atualize as informações do pet" : "Preencha os dados para cadastrar um novo pet"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="nome">Nome do Pet</Label>
                                <Input
                                    id="nome"
                                    type="text"
                                    required
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="raca">Raça</Label>
                                <Input
                                    id="raca"
                                    type="text"
                                    required
                                    value={formData.raca}
                                    onChange={(e) => setFormData({ ...formData, raca: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="idade">Idade (anos)</Label>
                                <Input
                                    id="idade"
                                    type="number"
                                    required
                                    min="0"
                                    step="1"
                                    className="w-full md:w-1/3"
                                    value={formData.idade}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        // Apenas permite números positivos
                                        if (value === "" || (!isNaN(Number(value)) && Number(value) >= 0)) {
                                            setFormData({ ...formData, idade: value });
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        // Previne entrada de caracteres não numéricos (exceto backspace, delete, tab, etc)
                                        if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="foto">Foto do Pet</Label>
                                <input
                                    id="foto"
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    aria-label="Selecionar foto do pet"
                                    onChange={handleFileChange}
                                />
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
                                        <div className="absolute top-2 right-2 z-10 flex gap-2">
                                            <Label
                                                htmlFor="foto"
                                                className="inline-flex items-center justify-center rounded-full bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-lg cursor-pointer hover:bg-primary/90 transition-colors"
                                            >
                                                <FiUpload className="mr-2 size-4" />
                                                Trocar foto
                                            </Label>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => {
                                                    setPhoto(null);
                                                    if (photoPreview.startsWith("blob:")) {
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
                                    <Label
                                        htmlFor="foto"
                                        className="flex border-2 border-dashed border-input rounded-lg p-8 flex-col items-center justify-center text-muted-foreground hover:border-primary hover:bg-primary/5 cursor-pointer transition-all duration-200 group"
                                    >
                                        <div className="bg-primary/10 p-4 rounded-full mb-3 group-hover:bg-primary/20 transition-colors">
                                            <FiUpload size={28} className="text-primary" />
                                        </div>
                                        <p className="font-medium">Clique para selecionar uma foto</p>
                                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG ou GIF (máx. 10MB)</p>
                                    </Label>
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
                                        <FiSave className="mr-2" /> Salvar Pet
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
