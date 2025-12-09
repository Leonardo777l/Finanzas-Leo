
import { useAuth } from '../hooks/useAuth';
import { GlassCard } from '../components/ui/GlassCard';


export function LoginPage() {
    const { loginWithGoogle } = useAuth();

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black pointer-events-none" />

            <GlassCard className="w-full max-w-md p-8 flex flex-col items-center gap-6 z-10">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        Bienvenido
                    </h1>
                    <p className="text-muted-foreground">
                        Inicia sesión para sincronizar tus finanzas
                    </p>
                </div>

                <button
                    onClick={loginWithGoogle}
                    className="w-full flex items-center justify-center gap-3 bg-white text-black font-medium py-3 px-4 rounded-xl hover:bg-white/90 transition-colors"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                    Continuar con Google
                </button>

                <div className="text-xs text-muted-foreground text-center">
                    Al continuar, aceptas nuestros términos y condiciones.
                </div>
            </GlassCard>
        </div>
    );
}
