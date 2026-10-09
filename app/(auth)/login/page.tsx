import Link from "next/link";
import { ArrowLeft, Camera, KeyRound } from "lucide-react";
import { AuthForm } from "@/components/auth-form";

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const query = await searchParams;
  const callbackUrl = Array.isArray(query.callbackUrl)
    ? query.callbackUrl[0]
    : query.callbackUrl;

  return (
    <main className="auth-page">
      <Link className="auth-back" href="/"><ArrowLeft size={15} /> Back to catalog</Link>
      <section className="auth-card">
        <Link aria-label="Campus Gear home" className="brand auth-brand" href="/"><span className="brand-mark"><Camera size={19} /></span><span>campus<span className="brand-light">gear</span></span></Link>
        <div className="auth-icon"><KeyRound size={20} /></div>
        <span className="collection-kicker">WELCOME BACK</span>
        <h1>Sign in to your campus account</h1>
        <p className="auth-intro">Manage your gear requests and upcoming rentals.</p>
        <AuthForm mode="login" callbackUrl={callbackUrl} />
        <p className="auth-switch">New to the gear library? <Link href="/sign-up">Create an account</Link></p>
      </section>
    </main>
  );
}