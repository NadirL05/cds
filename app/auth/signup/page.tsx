import { SignUpForm } from "./signup-form";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">CDS Sport</h1>
          <p className="mt-2 text-slate-600">Créez votre compte</p>
        </div>
        <SignUpForm />
      </div>
    </div>
  );
}

