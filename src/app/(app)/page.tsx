import { ArrowRight, CalendarClock } from "lucide-react";
import Link from "next/link";
import { requireMembership } from "@/lib/auth/session";

export default async function OverviewPage() {
  const access = await requireMembership();
  const displayName = access.status === "ready"
    ? access.profile.full_name?.trim() || access.user.email?.split("@")[0] || "equipe"
    : "equipe";
  const today = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "America/Bahia",
  }).format(new Date());

  return (
    <>
      <header className="page-heading">
        <div>
          <p className="eyebrow">Visão geral</p>
          <h1>Olá, {displayName}</h1>
          <p className="page-description">Um resumo claro para ajudar você a cuidar do que precisa acontecer hoje.</p>
        </div>
        <span className="heading-date">{today}</span>
      </header>

      <div className="overview-grid">
        <section className="today-panel">
          <div className="panel-heading">
            <h2>Hoje na confeitaria</h2>
            <span>Os dados aparecem quando os módulos forem ativados.</span>
          </div>
          <div className="operational-counts">
            <div className="operational-count"><strong>--</strong><span>Encomendas</span></div>
            <div className="operational-count"><strong>--</strong><span>Produções</span></div>
            <div className="operational-count"><strong>--</strong><span>Entregas e retiradas</span></div>
          </div>
        </section>

        <section className="next-panel">
          <div className="panel-heading">
            <h2>Próximo passo</h2>
            <CalendarClock size={19} aria-hidden="true" />
          </div>
          <div className="next-appointment">
            <span className="next-time">Hoje</span>
            <div>
              <strong>Comece pela agenda</strong>
              <span>Os compromissos aparecerão aqui quando o módulo de pedidos estiver ativo.</span>
            </div>
          </div>
        </section>
      </div>

      <section className="today-panel section-block">
        <div className="panel-heading">
          <h2>Roteiro de hoje</h2>
            <span>Compromissos cadastrados</span>
          </div>
        <p className="empty-inline">A agenda ainda não tem compromissos. Quando pedidos e produção estiverem ativos, os próximos horários serão organizados aqui.</p>
      </section>

      <div className="overview-grid-secondary">
        <article className="overview-card">
          <p className="eyebrow">Comece por aqui</p>
          <h2>Organize os produtos</h2>
          <p>Em breve: categorias, fotos, fichas técnicas e custos.</p>
          <Link className="catalog-link" href="/products">Ver módulo <ArrowRight size={14} /></Link>
        </article>
        <article className="overview-card">
          <p className="eyebrow">Atendimento</p>
          <h2>Cuide de cada pedido</h2>
          <p>Clientes, encomendas, pagamentos e agenda em um só fluxo.</p>
          <Link className="catalog-link" href="/orders">Ver módulo <ArrowRight size={14} /></Link>
        </article>
        <article className="overview-card">
          <p className="eyebrow">Gestão</p>
          <h2>Decida com clareza</h2>
          <p>Indicadores para enxergar vendas, margem e rentabilidade.</p>
          <Link className="catalog-link" href="/analytics">Ver módulo <ArrowRight size={14} /></Link>
        </article>
      </div>
    </>
  );
}
