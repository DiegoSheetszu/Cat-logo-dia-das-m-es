type SetupNoticeProps = {
  title: string;
  message: string;
};

export function SetupNotice({ title, message }: SetupNoticeProps) {
  return (
    <main className="setup-screen">
      <section className="setup-card">
        <p className="eyebrow">Doçuras da Lara · Configuração</p>
        <h1>{title}</h1>
        <p>{message}</p>
        <ol>
          <li>Crie um projeto no Supabase.</li>
          <li>Copie a URL e a chave anon para o arquivo <code>.env.local</code>.</li>
          <li>Execute a migration em <code>supabase/migrations</code>.</li>
          <li>Siga o README para criar o primeiro usuário administrador.</li>
        </ol>
      </section>
    </main>
  );
}
