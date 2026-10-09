import Link from "next/link";
import { ArrowLeft, Camera, UserRoundPlus } from "lucide-react";
import { AuthForm } from "@/components/auth-form";

export default function SignUpPage() {
  return (
    <main className="auth-page">
      <Link className="auth-back" href="/"><ArrowLeft size={15} /> Back to catalog</Link>
      <section className="auth-card auth-card-signup">
        <Link aria-label="Campus Gear home" className="brand auth-brand" href="/"><span className="brand-mark"><Camera size={19} /></span><span>campus<span className="brand-light">gear</span></span></Link>
        <div className="auth-icon"><UserRoundPlus size={20} /></div>
        <span className="collection-kicker">JOIN THE GEAR LIBRARY</span>
        <h1>Create your account</h1>
        <p className="auth-intro">Use your campus details to get started.</p>
        <AuthForm mode="sign-up" />
        <p className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></p>
      </section>
    </main>
  );
}