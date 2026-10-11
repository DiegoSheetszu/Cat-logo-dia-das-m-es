"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ChartNoAxesCombined,
  ChefHat,
  ClipboardList,
  Command,
  Menu,
  Package2,
  PanelLeftClose,
  Plus,
  ShoppingBag,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { useState } from "react";

const desktopGroups = [
  {
    title: "Rotina",
    links: [
      { label: "Visão geral", href: "/", icon: Command },
      { label: "Pedidos", href: "/orders", icon: ClipboardList },
      { label: "Agenda", href: "/agenda", icon: CalendarDays },
      { label: "Produção", href: "/production", icon: ChefHat },
    ],
  },
  {
    title: "Produtos",
    links: [
      { label: "Catálogo", href: "/products", icon: Package2 },
      { label: "Categorias", href: "/categories", icon: Package2 },
      { label: "Fichas técnicas", href: "/technical-sheets", icon: ClipboardList },
      { label: "Insumos", href: "/supplies", icon: ShoppingBag },
      { label: "Fornecedores", href: "/suppliers", icon: ShoppingBag },
      { label: "Estoque", href: "/inventory", icon: ShoppingBag },
      { label: "Compras", href: "/purchases", icon: ShoppingBag },
    ],
  },
  {
    title: "Gestão",
    links: [
      { label: "Clientes", href: "/customers", icon: UsersRound },
      { label: "Campanhas", href: "/campaigns", icon: CalendarDays },
      { label: "Vendas", href: "/sales", icon: WalletCards },
      { label: "Receitas", href: "/revenue", icon: WalletCards },
      { label: "Despesas", href: "/expenses", icon: WalletCards },
      { label: "Fluxo de caixa", href: "/cash-flow", icon: WalletCards },
      { label: "Análises", href: "/analytics", icon: ChartNoAxesCombined },
    ],
  },
];

const mobileLinks = [
  { label: "Início", href: "/", icon: Command },
  { label: "Pedidos", href: "/orders", icon: ClipboardList },
  { label: "Agenda", href: "/agenda", icon: CalendarDays },
  { label: "Produção", href: "/production", icon: ChefHat },
];

const quickActions = [
  { label: "Nova encomenda", href: "/orders/new" },
  { label: "Nova venda", href: "/sales/new" },
  { label: "Nova produção", href: "/production/new" },
  { label: "Nova compra", href: "/purchases/new" },
  { label: "Nova despesa", href: "/expenses/new" },
];

type AppShellProps = {
  children: React.ReactNode;
  userName: string;
  organizationName: string;
  signOutAction: () => Promise<void>;
};

export function AppShell({ children, userName, organizationName, signOutAction }: AppShellProps) {
  const pathname = usePathname();
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className={`app-frame ${sidebarCollapsed ? "is-sidebar-collapsed" : ""}`}>
      <aside className="sidebar">
        <Link className="sidebar-brand" href="/">
          <Image
            src="/brand/logo-docuras-da-lara.jpeg"
            alt="Doçuras da Lara"
            width={48}
            height={48}
            priority
          />
          <span>
            <strong>Doçuras da Lara</strong>
            <small>Gestão da confeitaria</small>
          </span>
        </Link>

        <div className="workspace-switcher">
          <span className="workspace-avatar">DL</span>
          <span>
            <strong>{organizationName}</strong>
            <small>Espaço de trabalho</small>
          </span>
        </div>

        <nav className="desktop-nav" aria-label="Navegação principal">
          {desktopGroups.map((group) => (
            <div className="nav-group" key={group.title}>
              <p>{group.title}</p>
              {group.links.map(({ label, href, icon: Icon }) => (
                <Link
                  className={`nav-link ${pathname === href ? "is-active" : ""}`}
                  href={href}
                  key={href}
                  aria-current={pathname === href ? "page" : undefined}
                >
                  <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <p>Conta conectada</p>
          <strong>{userName}</strong>
          <form action={signOutAction}>
            <button className="signout-button" type="submit">Sair da conta</button>
          </form>
        </div>
      </aside>

      <div className="app-column">
        <header className="app-header">
          <button
            aria-label={sidebarCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
            aria-pressed={sidebarCollapsed}
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
            type="button"
          >
            {sidebarCollapsed ? <Menu size={19} /> : <PanelLeftClose size={19} />}
          </button>
          <div className="mobile-brand-lockup">
            <Image
              src="/brand/logo-docuras-da-lara.jpeg"
              alt=""
              width={38}
              height={38}
              priority
            />
            <span>Doçuras da Lara</span>
          </div>
          <div className="header-context">
            <span className="status-dot" />
            <span>{organizationName}</span>
          </div>
          <Link className="header-user" href="/settings">{userName}</Link>
          <form action={signOutAction} className="header-signout-form">
            <button aria-label="Sair da conta" className="header-signout" type="submit">Sair</button>
          </form>
        </header>

        <main className="page-content">{children}</main>
      </div>

      <div className="quick-action-wrap">
        {quickActionsOpen && (
          <div className="quick-action-menu" aria-label="Ações rápidas">
            {quickActions.map((action) => (
              <Link href={action.href} key={action.href} onClick={() => setQuickActionsOpen(false)}>
                {action.label}
              </Link>
            ))}
          </div>
        )}
        <button
          aria-expanded={quickActionsOpen}
          aria-label={quickActionsOpen ? "Fechar ações rápidas" : "Abrir ações rápidas"}
          className="quick-action-button"
          onClick={() => setQuickActionsOpen((isOpen) => !isOpen)}
          type="button"
        >
          <Plus size={23} aria-hidden="true" />
        </button>
      </div>

      <nav className="mobile-nav" aria-label="Navegação móvel">
        {mobileLinks.map(({ label, href, icon: Icon }) => (
          <Link
            className={pathname === href ? "is-active" : ""}
            href={href}
            key={href}
            aria-current={pathname === href ? "page" : undefined}
          >
            <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        ))}
        <button
          aria-expanded={quickActionsOpen}
          aria-label={quickActionsOpen ? "Fechar ações rápidas" : "Criar novo registro"}
          className={`mobile-nav-new ${quickActionsOpen ? "is-active" : ""}`}
          onClick={() => setQuickActionsOpen((isOpen) => !isOpen)}
          type="button"
        >
          <Plus size={19} strokeWidth={2} aria-hidden="true" />
          <span>Novo</span>
        </button>
        <Link className={pathname === "/more" ? "is-active" : ""} href="/more" aria-current={pathname === "/more" ? "page" : undefined}>
          <Package2 size={19} strokeWidth={1.8} aria-hidden="true" />
          <span>Mais</span>
        </Link>
      </nav>
    </div>
  );
}
