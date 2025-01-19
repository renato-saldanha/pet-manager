import { authStore } from "@/stores/authStore";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import LoginModal from "@/components/LoginModal";
import type { AuthState } from "@/stores/authStore";

interface AuthContextData {
    isAuthenticated: boolean;
    showLoginModal: (show: boolean) => void;
    logout: () => void;
}

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>(authStore.getState());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);

    // Subscribe to authStore changes
    useEffect(() => {
        const subscription = authStore.state$.subscribe((state) => {
            setAuthState(state);
            if (!state.isAuthenticated) {
                setIsModalOpen(true);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Function to handle unauthorized events from API
    const handleUnauthorized = () => {
        authStore.logout();
        setIsModalOpen(true);
    };

    useEffect(() => {
        let isMounted = true;
        
        async function checkAuth() {
            setCheckingAuth(true);
            const state = authStore.getState();

            if (state.token && state.refreshToken) {
                try {
                    // Attempt to refresh to verify validity
                    const newToken = await authStore.refreshToken();
                    if (isMounted) {
                        if (newToken) {
                            // State will be updated via subscription
                        } else {
                            throw new Error("Token refresh failed");
                        }
                    }
                } catch (e) {
                    if (isMounted) {
                        authStore.logout();
                        setIsModalOpen(true);
                    }
                }
            } else {
                if (isMounted) {
                    authStore.logout();
                    setIsModalOpen(true);
                }
            }
            if (isMounted) {
                setCheckingAuth(false);
            }
        }

        checkAuth();
        
        // Listen for custom 401 event
        window.addEventListener("auth:unauthorized", handleUnauthorized);

        return () => {
            isMounted = false;
            window.removeEventListener("auth:unauthorized", handleUnauthorized);
        };
    }, []);

    function loginSuccess() {
        console.log("[AUTH] loginSuccess chamado");
        // State will be updated via subscription from authStore
        setIsModalOpen(false);
    }

    function logout() {
        authStore.logout();
        setIsModalOpen(true);
    }

    const isAuthenticated = authState.isAuthenticated;

    // Show full-screen login when not authenticated or still checking
    if (checkingAuth || !isAuthenticated) {
        return (
            <AuthContext.Provider value={{ isAuthenticated, showLoginModal: setIsModalOpen, logout }}>
                <LoginModal onLoginSuccess={loginSuccess} />
            </AuthContext.Provider>
        );
    }

    // Only render app content when authenticated
    return (
        <AuthContext.Provider value={{ isAuthenticated, showLoginModal: setIsModalOpen, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
