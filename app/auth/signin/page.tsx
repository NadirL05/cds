import { SignInForm } from "./signin-form";

interface SignInPageProps {
  searchParams: Promise<{ error?: string; message?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const error = params.error;
  const message = params.message;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">CDS Sport</h1>
          <p className="mt-2 text-slate-600">Connectez-vous à votre compte</p>
        </div>
        
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-4">
            <p className="text-sm font-medium text-red-800">
              Erreur de connexion: {error}
            </p>
            {message && (
              <p className="mt-1 text-sm text-red-600">{message}</p>
            )}
          </div>
        )}
        
        <SignInForm />
      </div>
    </div>
  );
}
