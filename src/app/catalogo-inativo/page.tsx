export const metadata = {
  title: "Campanha encerrada",
  description: "O catálogo especial de Dia das Mães foi encerrado.",
};

export default function CatalogoInativoPage() {
  return (
    <main className="setup-screen">
      <section className="setup-card">
        <p className="eyebrow">Doçuras da Lara · Campanha encerrada</p>
        <h1>O catálogo de Dia das Mães foi encerrado</h1>
        <p>
          Essa campanha já passou. Em breve, você poderá conferir por aqui as
          próximas novidades e datas especiais da Doçuras da Lara.
        </p>
      </section>
    </main>
  );
}
