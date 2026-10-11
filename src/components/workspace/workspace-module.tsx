"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  completeProduction,
  createWorkspaceRecord,
  startProduction,
  updateOrderStatus,
  type WorkspaceActionState,
} from "@/app/actions/workspace";
import type { WorkspaceData, WorkspaceField, WorkspaceRow } from "@/lib/workspace/types";
import { AgendaCalendar } from "@/components/workspace/agenda-calendar";
import { InstallAppCard } from "@/components/shared/install-app-card";

const initialState: WorkspaceActionState = { ok: false, message: "" };

function FormField({ field }: { field: WorkspaceField }) {
  const id = `field-${field.name}`;
  if (field.type === "checkbox") {
    return (
      <label className="workspace-checkbox" htmlFor={id}>
        <input id={id} name={field.name} type="checkbox" />
        <span>{field.label}</span>
      </label>
    );
  }
  if (field.type === "textarea") {
    return <label className="workspace-field workspace-field-wide" htmlFor={id}>{field.label}<textarea id={id} name={field.name} required={field.required} defaultValue={field.defaultValue} placeholder={field.placeholder} rows={3} /></label>;
  }
  return (
    <label className="workspace-field" htmlFor={id}>
      {field.label}
      {field.type === "select" ? (
        <select id={id} name={field.name} required={field.required} defaultValue={field.options?.[0]?.value ?? ""}>
          {(field.options ?? []).map((option) => <option key={option.value || "empty"} value={option.value}>{option.label}</option>)}
        </select>
      ) : (
        <input id={id} name={field.name} type={field.type} required={field.required} step={field.step} min={field.min} defaultValue={field.defaultValue} placeholder={field.placeholder} />
      )}
    </label>
  );
}

function RecordForm({ kind, fields, heading }: { kind: string; fields: WorkspaceField[]; heading: string }) {
  const [state, formAction, pending] = useActionState(createWorkspaceRecord, initialState);
  return (
    <section className="workspace-form-panel">
      <div className="workspace-section-heading">
        <div><p className="eyebrow">Novo registro</p><h2>{heading}</h2></div>
      </div>
      <form action={formAction} className="workspace-form">
        <input name="kind" type="hidden" value={kind} />
        <div className="workspace-form-grid">{fields.map((item) => <FormField field={item} key={item.name} />)}</div>
        <div className="workspace-form-footer">
          <p aria-live="polite" className={state.ok ? "form-feedback is-success" : "form-feedback is-error"}>{state.message}</p>
          <button className="primary-button" disabled={pending} type="submit">{pending ? "Salvando…" : "Salvar registro"}</button>
        </div>
      </form>
    </section>
  );
}

function OrderControls({ row }: { row: WorkspaceRow }) {
  const [state, formAction, pending] = useActionState(updateOrderStatus, initialState);
  return (
    <form action={formAction} className="row-action-form">
      <input name="id" type="hidden" value={row.id} />
      <select aria-label="Atualizar status do pedido" defaultValue={row.status} name="status">
        {(row.statusOptions ?? []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <button className="subtle-button" disabled={pending} type="submit">Atualizar</button>
      {state.message && <span aria-live="polite" className="row-feedback">{state.message}</span>}
    </form>
  );
}

function ProductionControls({ row }: { row: WorkspaceRow }) {
  const [startState, startAction, startPending] = useActionState(startProduction, initialState);
  const [finishState, finishAction, finishPending] = useActionState(completeProduction, initialState);
  if (row.status === "planned") {
    return <form action={startAction} className="row-action-form"><input name="id" type="hidden" value={row.id} /><button className="subtle-button" disabled={startPending} type="submit">{startPending ? "Iniciando…" : "Iniciar lote"}</button>{startState.message && <span className="row-feedback">{startState.message}</span>}</form>;
  }
  return (
    <form action={finishAction} className="row-action-form production-finish-form">
      <input name="id" type="hidden" value={row.id} />
      <label>Produzido<input aria-label="Quantidade produzida" min="0.001" name="produced_quantity" step="0.001" required type="number" defaultValue={row.cells[2]} /></label>
      <label>Perda<input aria-label="Quantidade perdida" min="0" name="loss_quantity" step="0.001" type="number" defaultValue="0" /></label>
      <button className="subtle-button" disabled={finishPending} type="submit">{finishPending ? "Concluindo…" : "Concluir"}</button>
      {finishState.message && <span aria-live="polite" className="row-feedback">{finishState.message}</span>}
    </form>
  );
}

function RecordTable({ data }: { data: WorkspaceData }) {
  if (!data.rows.length) return <p className="workspace-empty">{data.emptyMessage}</p>;
  return (
    <div className="workspace-table-wrap">
      <table className="workspace-table">
        <thead><tr>{data.columns.map((column) => <th key={column} scope="col">{column}</th>)}{data.rows.some((row) => row.action) && <th scope="col">Ação</th>}</tr></thead>
        <tbody>{data.rows.map((row) => (
          <tr key={row.id}>
            {row.cells.map((cell, index) => <td data-label={data.columns[index]} key={`${row.id}-${index}`}>{cell}</td>)}
            {data.rows.some((item) => item.action) && <td className="workspace-row-action" data-label="Ação">{row.action === "order-status" ? <OrderControls row={row} /> : row.action === "production-status" ? <ProductionControls row={row} /> : null}</td>}
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

export function WorkspaceModule({ data }: { data: WorkspaceData }) {
  if (data.title === "Agenda" && data.agendaEvents && data.agendaToday) {
    return (
      <div className="workspace-module">
        <header className="workspace-page-heading">
          <div><p className="eyebrow">Rotina</p><h1>Agenda</h1><p>Visualize pedidos e produções por data, mês a mês.</p></div>
          {data.metric && <div className="workspace-metric"><span>{data.metric.label}</span><strong>{data.metric.value}</strong><small>{data.metric.detail}</small></div>}
        </header>
        <AgendaCalendar events={data.agendaEvents} todayKey={data.agendaToday} />
      </div>
    );
  }
  if (data.title === "Mais módulos") {
    return (
      <div className="workspace-module">
        <header className="workspace-page-heading"><div><p className="eyebrow">Navegação</p><h1>Mais módulos</h1><p>Cadastros e ferramentas de gestão da confeitaria.</p></div></header>
        <InstallAppCard />
        <section className="workspace-list-panel"><div className="workspace-hub-grid">
          {[["Produtos", "/products"], ["Categorias", "/categories"], ["Fichas técnicas", "/technical-sheets"], ["Insumos", "/supplies"], ["Fornecedores", "/suppliers"], ["Estoque", "/inventory"], ["Compras", "/purchases"], ["Clientes", "/customers"], ["Campanhas", "/campaigns"], ["Pedidos", "/orders"], ["Vendas", "/sales"], ["Produção", "/production"], ["Agenda", "/agenda"], ["Receitas", "/revenue"], ["Despesas", "/expenses"], ["Fluxo de caixa", "/cash-flow"], ["Análises", "/analytics"], ["Configurações", "/settings"]].map(([label, href]) => <Link href={href} key={href}>{label}<span aria-hidden="true">↗</span></Link>)}
        </div></section>
      </div>
    );
  }
  return (
    <div className="workspace-module">
      <header className="workspace-page-heading">
        <div><p className="eyebrow">Operação</p><h1>{data.title}</h1><p>{data.description}</p></div>
        {data.metric && <div className="workspace-metric"><span>{data.metric.label}</span><strong>{data.metric.value}</strong>{data.metric.detail && <small>{data.metric.detail}</small>}</div>}
      </header>
      {data.fields.length > 0 && data.recordKind && <RecordForm fields={data.fields} heading={data.title === "Produtos" ? "Adicionar produto" : data.title === "Pedidos e encomendas" ? "Novo pedido" : data.title === "Vendas" ? "Registrar venda" : `Adicionar ${data.title.toLocaleLowerCase("pt-BR")}`} kind={data.recordKind} />}
      {data.secondaryFields && data.secondaryKind && <RecordForm fields={data.secondaryFields} heading="Adicionar fornecedor" kind={data.secondaryKind} />}
      <section className="workspace-list-panel">
        <div className="workspace-section-heading"><div><p className="eyebrow">Registros</p><h2>{data.rows.length} {data.rows.length === 1 ? "registro" : "registros"}</h2></div></div>
        <RecordTable data={data} />
      </section>
    </div>
  );
}
