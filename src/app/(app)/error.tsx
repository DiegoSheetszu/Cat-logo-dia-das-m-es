"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="error-screen" role="alert">
      <p className="eyebrow">Não foi possível carregar</p>
      <h1>Vamos tentar novamente.</h1>
      <p>O sistema não conseguiu buscar os dados desta tela. Tente de novo em instantes.</p>
      <button className="retry-button" onClick={() => reset()} type="button">Tentar novamente</button>
    </main>
  );
}
