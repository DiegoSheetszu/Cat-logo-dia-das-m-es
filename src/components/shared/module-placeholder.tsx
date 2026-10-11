import { ArrowUpRight, CircleDashed } from "lucide-react";
import Link from "next/link";

type ModulePlaceholderProps = {
  title: string;
  description: string;
};

export function ModulePlaceholder({ title, description }: ModulePlaceholderProps) {
  return (
    <section className="module-placeholder">
      <div className="placeholder-icon"><CircleDashed size={24} aria-hidden="true" /></div>
      <p className="eyebrow">Módulo planejado</p>
      <h1>{title}</h1>
      <p>{description}</p>
      <span className="placeholder-note">Esta etapa será liberada conforme a evolução do sistema.</span>
      <ArrowUpRight className="placeholder-arrow" size={20} aria-hidden="true" />
    </section>
  );
}

const moreLinks = [
  ["Produtos", "/products"],
  ["Fichas técnicas", "/technical-sheets"],
  ["Insumos e fornecedores", "/supplies"],
  ["Compras", "/purchases"],
  ["Estoque", "/inventory"],
  ["Clientes", "/customers"],
  ["Financeiro", "/finance"],
  ["Campanhas", "/campaigns"],
  ["Análises", "/analytics"],
] as const;

export function MoreModules() {
  return (
    <section className="more-modules">
      <p className="eyebrow">Navegação</p>
      <h1>Mais módulos</h1>
      <p>Atalhos para as áreas de cadastro e gestão da confeitaria.</p>
      <div className="more-modules-grid">
        {moreLinks.map(([label, href]) => (
          <Link href={href} key={href}>
            <span>{label}</span>
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}
