
import Link from "next/link";
import { ArrowRight, Camera, CircleUserRound } from "lucide-react";
import { auth } from "@/auth";

type PortalShellProps = {
  children: React.ReactNode;
  active?: "catalog" | "rentals" | "admin";
};

export async function PortalShell({
  children,
  active = "catalog",
}: PortalShellProps) {
  const session = await auth();
  const isSignedIn = !!session?.user;

  return (
    <div className="portal-shell">
      <header className="topbar">
        <Link aria-label="Campus Gear home" className="brand" href="/">
          <span className="brand-mark">
            <Camera size={19} strokeWidth={2.2} />
          </span>
          <span>
            campus<span className="brand-light">gear</span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="main-nav">
          <Link
            className={active === "catalog" ? "nav-active" : ""}
            href="/catalog"
          >
            Catalog
          </Link>
          <Link href="/catalog#how-it-works">How it works</Link>
          <Link
            className={active === "rentals" ? "nav-active" : ""}
            href="/my-rentals"
          >
            My bookings
          </Link>
          {session?.user?.role === "admin" && session.user.status === "active" && (
            <Link
              className={active === "admin" ? "nav-active" : ""}
              href="/admin"
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="account-actions">
          {!isSignedIn && (
            <>
              <Link className="signin-link" href="/login">
                Sign in
              </Link>
              <Link
                className="account-button"
                href="/login"
                aria-label="Sign in to your account"
              >
                <CircleUserRound size={19} />
              </Link>
            </>
          )}

          {isSignedIn && (
            <span className="account-welcome">
              {session.user.name ?? session.user.email}
            </span>
          )}
        </div>
      </header>

      {children}

      <footer className="portal-footer">
        <span>
          Campus Gear Library{" "}
          <span className="footer-separator">/</span>{" "}
          Made for campus creators
        </span>
        <Link href="/catalog#accessibility">
          Accessibility <ArrowRight size={12} />
        </Link>
      </footer>
    </div>
  );
}
