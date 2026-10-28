import { authStore } from "@/stores/authStore";
import { useState } from "react";
import toast from "react-hot-toast";
import { FiLock, FiUser } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ModoDemo from "@/components/ModoDemo";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface LoginModalProps {
    onLoginSuccess: () => void;
}

export default function LoginModal({ onLoginSuccess }: LoginModalProps) {
    const [usuario, setUsuario] = useState("admin");
    const [senha, setSenha] = useState("admin");
    const [loading, setLoading] = useState(false);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            await authStore.login(usuario, senha);
            toast.success("Login realizado com sucesso!");
            onLoginSuccess();
        } catch (error) {
            toast.error("Usuário ou senha inválidos.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-cyan-50 via-white to-cyan-100">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                        <FiLock size={32} />
                    </div>
                    <CardTitle className="text-2xl">Autenticação Necessária</CardTitle>
                    <CardDescription>Por favor, faça login para acessar o sistema.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="usuario">Usuário</Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                                    <FiUser />
                                </div>
                                <Input
                                    id="usuario"
                                    type="text"
                                    required
                                    className="pl-10"
                                    value={usuario}
                                    onChange={(e) => setUsuario(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="senha">Senha</Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                                    <FiLock />
                                </div>
                                <Input
                                    id="senha"
                                    type="password"
                                    required
                                    className="pl-10"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? "Entrando..." : "Acessar Sistema"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex-col gap-3">
                    <ModoDemo className="rounded-md" />
                    <p className="text-xs text-muted-foreground"> Ambiente Seguro • Pet Manager </p>
                </CardFooter>
            </Card>
        </div>
    );
}
