import Link from "next/link";

export default function NotFound() {
  return (
    <main className="setup-screen">
      <section className="setup-card">
        <p className="eyebrow">Página não encontrada</p>
        <h1>Esse caminho ainda não existe.</h1>
        <p>Volte para a visão geral e siga pela navegação do sistema.</p>
        <Link className="text-link" href="/">Ir para a visão geral</Link>
      </section>
    </main>
  );
}
