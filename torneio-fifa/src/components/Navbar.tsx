"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdmin } from "./AdminContext";

const links = [
  { href: "/", label: "Início" },
  { href: "/grupos", label: "Grupos" },
  { href: "/mata-mata", label: "Mata-mata" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { isAdmin, logout } = useAdmin();
  const router = useRouter();

  return (
    <header className="flex flex-col gap-4 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-3xl leading-none tracking-wide text-chalk">
            APITO<span className="text-amber">FINAL</span>
          </span>
        </Link>
        {isAdmin && (
          <span className="ml-3 rounded-full border border-amber/40 bg-amber/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest2 text-amber sm:hidden">
            Admin
          </span>
        )}
      </div>

      <nav className="flex items-center gap-1 rounded-full border border-line bg-surface p-1">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-pitch text-chalk"
                  : "text-muted hover:text-chalk"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="hidden items-center gap-3 sm:flex">
        {isAdmin ? (
          <>
            <span className="rounded-full border border-amber/40 bg-amber/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest2 text-amber">
              Admin
            </span>
            <button
              onClick={() => logout()}
              className="text-sm text-muted transition-colors hover:text-chalk"
            >
              Sair
            </button>
          </>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="text-sm text-muted transition-colors hover:text-chalk"
          >
            Entrar como admin
          </button>
        )}
      </div>

      {!isAdmin ? (
        <button
          onClick={() => router.push("/login")}
          className="text-sm text-muted underline decoration-dotted underline-offset-4 sm:hidden"
        >
          Entrar como admin
        </button>
      ) : (
        <button
          onClick={() => logout()}
          className="text-sm text-muted underline decoration-dotted underline-offset-4 sm:hidden"
        >
          Sair da sessão admin
        </button>
      )}
    </header>
  );
}
