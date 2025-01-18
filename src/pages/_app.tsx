import Header from "@/components/Header";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { AuthProvider } from "@/context/AuthContext";

// Lazy load módulos de Pets e Tutores
const PetsModule = dynamic(() => import("@/modules/pets"), {
  ssr: false,
});

const TutoresModule = dynamic(() => import("@/modules/tutores"), {
  ssr: false,
});

function AppContent({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const pathname = router.pathname;

  // Determinar qual módulo carregar baseado na rota
  const isPetsRoute = pathname.startsWith("/pets") || pathname === "/" || pathname.startsWith("/cadastro/pet");
  const isTutoresRoute = pathname.startsWith("/tutores") || pathname.startsWith("/cadastro/tutor");

  return (
    <>
      <Header />
      {isPetsRoute ? (
        <PetsModule>
          <Component {...pageProps} />
        </PetsModule>
      ) : isTutoresRoute ? (
        <TutoresModule>
          <Component {...pageProps} />
        </TutoresModule>
      ) : (
        <Component {...pageProps} />
      )}
    </>
  );
}

export default function App(props: AppProps) {
  return (
    <AuthProvider>
      <Toaster
        position="top-center"
        reverseOrder={false} />
      <AppContent {...props} />
    </AuthProvider>
  )
}
