import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { AgendaEvent, FieldOption, WorkspaceData, WorkspaceField } from "./types";

type Client = SupabaseClient<Database>;

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const journeyLabels: Record<string, string> = { experiment: "Experimente", gift: "Presenteie", celebrate: "Celebre" };
const orderStatusLabels: Record<string, string> = {
  quote: "Orçamento", awaiting_confirmation: "Aguardando confirmação", confirmed: "Confirmado",
  in_production: "Em produção", ready: "Pronto", delivered: "Concluído", cancelled: "Cancelado",
};

function dateLabel(value: string | null) {
  if (!value) return "Sem data";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Bahia" }).format(new Date(value));
}

function bahiaDateKey(value: string) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bahia", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(value));
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function bahiaTimeLabel(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Bahia", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function failIfError(error: { message: string } | null): void {
  if (error) throw new Error(`Não foi possível carregar os dados: ${error.message}`);
}

function base(title: string, description: string, emptyMessage: string, columns: string[], fields: WorkspaceField[] = [], recordKind?: string): WorkspaceData {
  return { title, description, emptyMessage, columns, fields, rows: [], mode: fields.length ? "create" : "none", recordKind };
}

function option(value: string | null, label: string): FieldOption {
  return { value: value ?? "", label };
}

function field(name: string, label: string, type: WorkspaceField["type"], rest: Partial<WorkspaceField> = {}): WorkspaceField {
  return { name, label, type, ...rest };
}

export async function loadWorkspaceData(
  client: Client,
  organizationId: string,
  key: string,
  userId?: string,
): Promise<WorkspaceData> {
  switch (key) {
    case "categories": {
      const data = base("Categorias", "Separe o portfólio por ocasião e etapa da jornada de compra.", "Nenhuma categoria cadastrada ainda.", ["Categoria", "Jornada", "Tipo", "Status"], [
        field("name", "Nome da categoria", "text", { required: true, placeholder: "Ex.: Presentes artesanais" }),
        field("journey", "Jornada", "select", { options: [{ value: "experiment", label: "Experimente" }, { value: "gift", label: "Presenteie" }, { value: "celebrate", label: "Celebre" }] }),
        field("is_seasonal", "Categoria sazonal", "checkbox"),
      ], "category");
      const result = await client.from("categories").select("id,name,journey,is_seasonal,is_active").eq("organization_id", organizationId).order("name");
      failIfError(result.error);
      data.rows = (result.data ?? []).map((row) => ({ id: row.id, cells: [row.name, journeyLabels[row.journey] ?? row.journey, row.is_seasonal ? "Sazonal" : "Permanente", row.is_active ? "Ativa" : "Inativa"] }));
      return data;
    }
    case "suppliers": {
      const data = base("Fornecedores", "Contatos e observações de quem abastece a confeitaria.", "Nenhum fornecedor cadastrado.", ["Fornecedor", "Telefone", "E-mail", "Status"], [
        field("name", "Nome do fornecedor", "text", { required: true }), field("phone", "Telefone / WhatsApp", "tel"),
        field("email", "E-mail", "email"), field("notes", "Observações", "textarea"),
      ], "supplier");
      const result = await client.from("suppliers").select("id,name,phone,email,is_active").eq("organization_id", organizationId).order("name");
      failIfError(result.error);
      data.rows = (result.data ?? []).map((row) => ({ id: row.id, cells: [row.name, row.phone ?? "—", row.email ?? "—", row.is_active ? "Ativo" : "Inativo"] }));
      return data;
    }
    case "supplies": {
      const data = base("Insumos e embalagens", "Cadastre unidade de medida, custo da embalagem e saldo disponível.", "Nenhum insumo cadastrado.", ["Item", "Tipo", "Saldo", "Custo da embalagem", "Custo por unidade"], [
        field("name", "Nome", "text", { required: true, placeholder: "Ex.: Chocolate meio amargo" }),
        field("kind", "Tipo", "select", { options: [{ value: "ingredient", label: "Ingrediente" }, { value: "packaging", label: "Embalagem" }] }),
        field("unit", "Unidade base", "select", { options: [{ value: "g", label: "Gramas (g)" }, { value: "kg", label: "Quilogramas (kg)" }, { value: "ml", label: "Mililitros (ml)" }, { value: "l", label: "Litros (l)" }, { value: "un", label: "Unidades (un)" }] }),
        field("package_quantity", "Quantidade na embalagem", "number", { required: true, min: "0.001", step: "0.001" }),
        field("package_cost", "Preço da embalagem (R$)", "number", { required: true, min: "0", step: "0.01" }),
        field("stock_quantity", "Saldo inicial", "number", { min: "0", step: "0.001" }),
        field("minimum_quantity", "Avisar quando abaixo de", "number", { min: "0", step: "0.001" }),
        field("supplier_id", "Fornecedor preferencial", "select", { options: [{ value: "", label: "Sem fornecedor definido" }] }),
      ], "ingredient");
      const [items, suppliers] = await Promise.all([
        client.from("ingredients").select("id,name,kind,unit,package_quantity,package_cost,stock_quantity,minimum_quantity,is_active").eq("organization_id", organizationId).order("name"),
        client.from("suppliers").select("id,name").eq("organization_id", organizationId).eq("is_active", true).order("name"),
      ]);
      failIfError(items.error); failIfError(suppliers.error);
      data.fields = data.fields.map((item) => item.name === "supplier_id" ? { ...item, options: [{ value: "", label: "Sem fornecedor definido" }, ...(suppliers.data ?? []).map((supplier) => option(supplier.id, supplier.name))] } : item);
      data.rows = (items.data ?? []).map((row) => ({ id: row.id, cells: [row.name, row.kind === "packaging" ? "Embalagem" : "Ingrediente", `${row.stock_quantity} ${row.unit}${row.stock_quantity <= row.minimum_quantity ? " · Repor" : ""}`, currency.format(row.package_cost), currency.format(row.package_cost / row.package_quantity)] }));
      data.metric = { label: "Itens cadastrados", value: String(data.rows.length), detail: `${data.rows.filter((row) => row.cells[2].includes("Repor")).length} abaixo do nível mínimo` };
      data.secondaryKind = "supplier";
      data.secondaryFields = [field("name", "Novo fornecedor", "text", { required: true }), field("phone", "Telefone", "tel"), field("email", "E-mail", "email")];
      return data;
    }
    case "products": {
      const data = base("Produtos", "Preço, composição, apresentação e rentabilidade por item.", "Cadastre o primeiro produto para começar o catálogo.", ["Produto", "Jornada", "Preço", "Custo atual", "Margem", "Status"], [
        field("name", "Nome do produto", "text", { required: true }),
        field("category_id", "Categoria", "select", { options: [{ value: "", label: "Sem categoria" }] }),
        field("journey", "Jornada comercial", "select", { options: [{ value: "experiment", label: "Experimente" }, { value: "gift", label: "Presenteie" }, { value: "celebrate", label: "Celebre" }] }),
        field("sale_price", "Preço de venda (R$)", "number", { required: true, min: "0", step: "0.01" }),
        field("yield_quantity", "Rendimento da ficha", "number", { min: "0.001", step: "0.001" }),
        field("labor_minutes", "Minutos de mão de obra", "number", { min: "0", step: "1" }),
        field("labor_cost", "Custo de mão de obra (R$)", "number", { min: "0", step: "0.01" }),
        field("other_cost", "Outros custos por unidade (R$)", "number", { min: "0", step: "0.01" }),
        field("image_url", "Endereço da foto (opcional)", "text"), field("description", "Descrição", "textarea"),
        field("is_seasonal", "Produto sazonal", "checkbox"), field("is_personalizable", "Permite personalização", "checkbox"),
      ], "product");
      const [products, categories, costs] = await Promise.all([
        client.from("products").select("id,name,category_id,journey,sale_price,is_active").eq("organization_id", organizationId).order("name"),
        client.from("categories").select("id,name").eq("organization_id", organizationId).eq("is_active", true).order("name"),
        client.from("product_costs").select("id,unit_cost,margin_percent").eq("organization_id", organizationId),
      ]);
      failIfError(products.error); failIfError(categories.error); failIfError(costs.error);
      const costMap = new Map((costs.data ?? []).map((item) => [item.id, item]));
      data.fields = data.fields.map((item) => item.name === "category_id" ? { ...item, options: [{ value: "", label: "Sem categoria" }, ...(categories.data ?? []).map((category) => option(category.id, category.name))] } : item);
      data.rows = (products.data ?? []).map((row) => {
        const cost = costMap.get(row.id);
        return { id: row.id, cells: [row.name, journeyLabels[row.journey] ?? row.journey, currency.format(row.sale_price), currency.format(cost?.unit_cost ?? 0), `${cost?.margin_percent ?? 0}%`, row.is_active ? "Ativo" : "Inativo"] };
      });
      data.metric = { label: "Produtos ativos", value: String(data.rows.filter((row) => row.cells[5] === "Ativo").length), detail: "Custos calculados a partir das fichas técnicas" };
      return data;
    }
    case "technical-sheets": {
      const data = base("Fichas técnicas", "Registre quantidades por receita para calcular o custo atualizado de cada produto.", "Adicione ingredientes às fichas dos produtos.", ["Produto", "Insumo", "Quantidade usada", "Custo atual estimado"], [
        field("product_id", "Produto", "select", { required: true, options: [] }), field("ingredient_id", "Ingrediente ou embalagem", "select", { required: true, options: [] }),
        field("quantity", "Quantidade usada na receita", "number", { required: true, min: "0.001", step: "0.001" }),
      ], "recipe");
      const [products, ingredients, recipes] = await Promise.all([
        client.from("products").select("id,name").eq("organization_id", organizationId).eq("is_active", true).order("name"),
        client.from("ingredients").select("id,name,unit,package_quantity,package_cost").eq("organization_id", organizationId).eq("is_active", true).order("name"),
        client.from("recipe_items").select("id,product_id,ingredient_id,quantity").eq("organization_id", organizationId).order("created_at", { ascending: false }),
      ]);
      failIfError(products.error); failIfError(ingredients.error); failIfError(recipes.error);
      const productMap = new Map((products.data ?? []).map((item) => [item.id, item.name]));
      const ingredientMap = new Map((ingredients.data ?? []).map((item) => [item.id, item]));
      data.fields = data.fields.map((item) => item.name === "product_id" ? { ...item, options: (products.data ?? []).map((row) => option(row.id, row.name)) } : item.name === "ingredient_id" ? { ...item, options: (ingredients.data ?? []).map((row) => option(row.id, `${row.name} (${row.unit})`)) } : item);
      data.rows = (recipes.data ?? []).map((row) => {
        const ingredient = ingredientMap.get(row.ingredient_id);
        const cost = ingredient ? row.quantity * ingredient.package_cost / ingredient.package_quantity : 0;
        return { id: row.id, cells: [productMap.get(row.product_id) ?? "Produto removido", ingredient?.name ?? "Insumo removido", `${row.quantity} ${ingredient?.unit ?? ""}`, currency.format(cost)] };
      });
      return data;
    }
    case "customers": {
      const data = base("Clientes", "Contatos e preferências para atender melhor e incentivar a recompra.", "Nenhum cliente cadastrado.", ["Cliente", "WhatsApp", "E-mail", "Aniversário", "Observações"], [
        field("name", "Nome", "text", { required: true }), field("phone", "Telefone / WhatsApp", "tel"), field("email", "E-mail", "email"),
        field("birthday", "Aniversário", "date"), field("notes", "Preferências e observações", "textarea"),
      ], "customer");
      const result = await client.from("customers").select("id,name,phone,email,birthday,notes").eq("organization_id", organizationId).order("name");
      failIfError(result.error);
      data.rows = (result.data ?? []).map((row) => ({ id: row.id, cells: [row.name, row.phone ?? "—", row.email ?? "—", row.birthday ? new Date(`${row.birthday}T12:00:00`).toLocaleDateString("pt-BR") : "—", row.notes ?? "—"] }));
      return data;
    }
    case "orders":
    case "sales": {
      const isSale = key === "sales";
      const data = base(isSale ? "Vendas" : "Pedidos e encomendas", isSale ? "Registre vendas rápidas e guarde preço e custo vigentes no momento da venda." : "Acompanhe pedidos, prazos, entrega e recebimentos em um só fluxo.", isSale ? "Nenhuma venda registrada." : "Nenhum pedido cadastrado.", ["Pedido", "Cliente", "Entrega", "Valor", "Recebido", "Status"], [
        field("customer_id", "Cliente", "select", { options: [{ value: "", label: "Cliente não informado" }] }),
        field("product_id", "Produto", "select", { required: true, options: [] }),
        field("quantity", "Quantidade", "number", { required: true, min: "0.001", step: "0.001" }),
        ...(!isSale ? [field("due_at", "Data e horário", "datetime-local")] : []),
        ...(!isSale ? [field("delivery_type", "Entrega", "select", { options: [{ value: "pickup", label: "Retirada" }, { value: "delivery", label: "Entrega" }] })] : []),
        ...(isSale ? [field("discount", "Desconto (R$)", "number", { min: "0", step: "0.01" })] : []),
        field("payment_amount", "Valor recebido agora (R$)", "number", { min: "0", step: "0.01" }),
        field("payment_method", "Forma de pagamento", "select", { options: [{ value: "pix", label: "Pix" }, { value: "cash", label: "Dinheiro" }, { value: "debit", label: "Débito" }, { value: "credit", label: "Crédito" }, { value: "transfer", label: "Transferência" }, { value: "other", label: "Outro" }] }),
        field("notes", "Observações / personalização", "textarea"),
      ], isSale ? "sale" : "order");
      const [orders, customers, products, payments] = await Promise.all([
        client.from("orders").select("id,order_number,customer_id,due_at,total,status,delivery_type").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(100),
        client.from("customers").select("id,name").eq("organization_id", organizationId).order("name"),
        client.from("products").select("id,name,sale_price").eq("organization_id", organizationId).eq("is_active", true).order("name"),
        client.from("payments").select("order_id,amount").eq("organization_id", organizationId),
      ]);
      failIfError(orders.error); failIfError(customers.error); failIfError(products.error); failIfError(payments.error);
      const customerMap = new Map((customers.data ?? []).map((item) => [item.id, item.name]));
      const paidMap = new Map<string, number>();
      (payments.data ?? []).forEach((item) => paidMap.set(item.order_id, (paidMap.get(item.order_id) ?? 0) + item.amount));
      data.fields = data.fields.map((item) => item.name === "customer_id" ? { ...item, options: [{ value: "", label: "Cliente não informado" }, ...(customers.data ?? []).map((row) => option(row.id, row.name))] } : item.name === "product_id" ? { ...item, options: (products.data ?? []).map((row) => option(row.id, `${row.name} · ${currency.format(row.sale_price)}`)) } : item);
      const listed = (orders.data ?? []).filter((order) => isSale ? order.status === "delivered" : order.status !== "delivered");
      data.rows = listed.map((row) => ({
        id: row.id,
        cells: [`#${row.order_number}`, row.customer_id ? customerMap.get(row.customer_id) ?? "Cliente" : "Venda direta", dateLabel(row.due_at), currency.format(row.total), currency.format(paidMap.get(row.id) ?? 0), orderStatusLabels[row.status] ?? row.status],
        status: row.status,
        statusOptions: ["quote", "awaiting_confirmation", "confirmed", "in_production", "ready", "delivered", "cancelled"].map((status) => option(status, orderStatusLabels[status])),
        action: "order-status",
      }));
      data.metric = { label: isSale ? "Vendas registradas" : "Pedidos em aberto", value: String(listed.length), detail: currency.format(listed.reduce((sum, row) => sum + row.total, 0)) };
      return data;
    }
    case "agenda": {
      const data = base("Agenda", "Prazos reais dos pedidos e lotes de produção, organizados pela data combinada.", "Nenhum compromisso previsto para os próximos dias.", ["Quando", "Compromisso", "Cliente / produto", "Status"], []);
      const [orders, batches, customers, products] = await Promise.all([
        client.from("orders").select("id,order_number,customer_id,due_at,status").eq("organization_id", organizationId).not("due_at", "is", null).not("status", "in", "(delivered,cancelled)").order("due_at").limit(1000),
        client.from("production_batches").select("id,product_id,planned_for,status").eq("organization_id", organizationId).neq("status", "completed").neq("status", "cancelled").order("planned_for").limit(1000),
        client.from("customers").select("id,name").eq("organization_id", organizationId),
        client.from("products").select("id,name").eq("organization_id", organizationId),
      ]);
      failIfError(orders.error); failIfError(batches.error); failIfError(customers.error); failIfError(products.error);
      const customerMap = new Map((customers.data ?? []).map((item) => [item.id, item.name]));
      const productMap = new Map((products.data ?? []).map((item) => [item.id, item.name]));
      const agendaEvents: AgendaEvent[] = [
        ...(orders.data ?? []).map((row) => ({ id: row.id, date: bahiaDateKey(row.due_at!), time: bahiaTimeLabel(row.due_at!), title: `Pedido #${row.order_number}`, subtitle: row.customer_id ? customerMap.get(row.customer_id) ?? "Cliente" : "Cliente a definir", status: orderStatusLabels[row.status] ?? row.status, kind: "order" as const })),
        ...(batches.data ?? []).map((row) => ({ id: row.id, date: bahiaDateKey(row.planned_for), time: bahiaTimeLabel(row.planned_for), title: productMap.get(row.product_id) ?? "Produção", subtitle: "Lote de produção", status: row.status === "planned" ? "Planejada" : "Em andamento", kind: "production" as const })),
      ].sort((a, b) => a.date.localeCompare(b.date));
      data.agendaEvents = agendaEvents;
      data.agendaToday = bahiaDateKey(new Date().toISOString());
      data.metric = { label: "Compromissos em aberto", value: String(agendaEvents.length), detail: `${orders.data?.length ?? 0} pedidos · ${batches.data?.length ?? 0} lotes` };
      return data;
    }
    case "production": {
      const data = base("Produção", "Planeje lotes, vincule a um pedido e registre perdas ao finalizar.", "Nenhum lote de produção cadastrado.", ["Produto", "Planejado para", "Quantidade", "Produzido", "Perdas", "Status"], [
        field("product_id", "Produto", "select", { required: true, options: [] }), field("planned_for", "Data e horário", "datetime-local", { required: true }),
        field("planned_quantity", "Quantidade planejada", "number", { required: true, min: "0.001", step: "0.001" }), field("notes", "Observações", "textarea"),
      ], "production");
      const [batches, products] = await Promise.all([
        client.from("production_batches").select("id,product_id,planned_for,planned_quantity,produced_quantity,loss_quantity,status").eq("organization_id", organizationId).order("planned_for", { ascending: false }).limit(100),
        client.from("products").select("id,name").eq("organization_id", organizationId).eq("is_active", true).order("name"),
      ]);
      failIfError(batches.error); failIfError(products.error);
      const names = new Map((products.data ?? []).map((item) => [item.id, item.name]));
      data.fields = data.fields.map((item) => item.name === "product_id" ? { ...item, options: (products.data ?? []).map((row) => option(row.id, row.name)) } : item);
      data.rows = (batches.data ?? []).map((row) => ({ id: row.id, cells: [names.get(row.product_id) ?? "Produto", dateLabel(row.planned_for), String(row.planned_quantity), String(row.produced_quantity), String(row.loss_quantity), row.status === "planned" ? "Planejada" : row.status === "in_progress" ? "Em andamento" : row.status === "completed" ? "Concluída" : "Cancelada"], status: row.status, action: row.status === "completed" || row.status === "cancelled" ? undefined : "production-status" }));
      return data;
    }
    case "purchases": {
      const data = base("Compras", "Registre reposições; o saldo, o custo atual e o histórico são atualizados juntos.", "Nenhuma compra registrada.", ["Data", "Fornecedor", "Item", "Quantidade", "Total"], [
        field("ingredient_id", "Insumo comprado", "select", { required: true, options: [] }), field("supplier_id", "Fornecedor", "select", { options: [{ value: "", label: "Sem fornecedor" }] }),
        field("package_quantity", "Quantidade adicionada", "number", { required: true, min: "0.001", step: "0.001" }), field("package_cost", "Valor pago (R$)", "number", { required: true, min: "0", step: "0.01" }),
        field("notes", "Observações", "textarea"),
      ], "purchase");
      const [purchases, ingredients, suppliers, purchaseItems] = await Promise.all([
        client.from("purchases").select("id,supplier_id,purchased_at,total").eq("organization_id", organizationId).order("purchased_at", { ascending: false }).limit(50),
        client.from("ingredients").select("id,name,unit").eq("organization_id", organizationId).eq("is_active", true).order("name"),
        client.from("suppliers").select("id,name").eq("organization_id", organizationId).order("name"),
        client.from("purchase_items").select("purchase_id,ingredient_id,package_quantity").eq("organization_id", organizationId),
      ]);
      failIfError(purchases.error); failIfError(ingredients.error); failIfError(suppliers.error); failIfError(purchaseItems.error);
      const itemMap = new Map((ingredients.data ?? []).map((item) => [item.id, item]));
      const supplierMap = new Map((suppliers.data ?? []).map((item) => [item.id, item.name]));
      const purchaseItemMap = new Map((purchaseItems.data ?? []).map((item) => [item.purchase_id, item]));
      data.fields = data.fields.map((item) => item.name === "ingredient_id" ? { ...item, options: (ingredients.data ?? []).map((row) => option(row.id, `${row.name} (${row.unit})`)) } : item.name === "supplier_id" ? { ...item, options: [{ value: "", label: "Sem fornecedor" }, ...(suppliers.data ?? []).map((row) => option(row.id, row.name))] } : item);
      data.rows = (purchases.data ?? []).map((row) => { const detail = purchaseItemMap.get(row.id); return { id: row.id, cells: [dateLabel(row.purchased_at), row.supplier_id ? supplierMap.get(row.supplier_id) ?? "Fornecedor" : "—", itemMap.get(detail?.ingredient_id ?? "")?.name ?? "Item", detail ? `${detail.package_quantity} ${itemMap.get(detail.ingredient_id)?.unit ?? ""}` : "—", currency.format(row.total)] }; });
      return data;
    }
    case "inventory": {
      const data = base("Estoque", "Consulte saldos atuais e registre ajustes com histórico auditável.", "Cadastre insumos para acompanhar o estoque.", ["Insumo", "Saldo atual", "Mínimo", "Custo unitário", "Situação"], [
        field("ingredient_id", "Insumo", "select", { required: true, options: [] }), field("quantity_delta", "Ajuste (+ entrada / − saída)", "number", { required: true, step: "0.001" }), field("notes", "Motivo do ajuste", "text", { required: true }),
      ], "inventory");
      const result = await client.from("ingredients").select("id,name,unit,stock_quantity,minimum_quantity,package_quantity,package_cost,is_active").eq("organization_id", organizationId).order("name");
      failIfError(result.error);
      data.fields = data.fields.map((item) => item.name === "ingredient_id" ? { ...item, options: (result.data ?? []).filter((row) => row.is_active).map((row) => option(row.id, `${row.name} (${row.unit})`)) } : item);
      data.rows = (result.data ?? []).map((row) => ({ id: row.id, cells: [row.name, `${row.stock_quantity} ${row.unit}`, `${row.minimum_quantity} ${row.unit}`, currency.format(row.package_cost / row.package_quantity), row.stock_quantity <= row.minimum_quantity ? "Repor" : "Disponível"] }));
      data.metric = { label: "Itens para repor", value: String(data.rows.filter((row) => row.cells[4] === "Repor").length) };
      return data;
    }
    case "expenses": {
      const data = base("Despesas", "Lance gastos realizados para acompanhar o caixa com clareza.", "Nenhuma despesa lançada.", ["Quando", "Despesa", "Categoria", "Forma", "Valor"], [
        field("description", "Descrição", "text", { required: true }), field("category", "Categoria", "select", { options: ["Insumos", "Embalagens", "Equipamentos", "Transporte", "Marketing", "Serviços", "Outros"].map((name) => ({ value: name.toLowerCase(), label: name })) }),
        field("amount", "Valor (R$)", "number", { required: true, min: "0.01", step: "0.01" }), field("paid_at", "Data do pagamento", "date"),
        field("payment_method", "Forma de pagamento", "select", { options: [{ value: "pix", label: "Pix" }, { value: "cash", label: "Dinheiro" }, { value: "debit", label: "Débito" }, { value: "credit", label: "Crédito" }, { value: "transfer", label: "Transferência" }, { value: "other", label: "Outro" }] }), field("notes", "Observações", "textarea"),
      ], "expense");
      const result = await client.from("expenses").select("id,description,category,amount,paid_at,payment_method").eq("organization_id", organizationId).order("paid_at", { ascending: false }).limit(100);
      failIfError(result.error);
      data.rows = (result.data ?? []).map((row) => ({ id: row.id, cells: [dateLabel(row.paid_at), row.description, row.category, row.payment_method, currency.format(row.amount)] }));
      data.metric = { label: "Total lançado", value: currency.format((result.data ?? []).reduce((sum, row) => sum + row.amount, 0)) };
      return data;
    }
    case "campaigns": {
      const data = base("Campanhas", "Planeje datas sazonais, metas de faturamento e aprendizados de cada ação.", "Nenhuma campanha planejada.", ["Campanha", "Período", "Meta", "Status"], [
        field("name", "Nome da campanha", "text", { required: true }), field("starts_on", "Início", "date", { required: true }), field("ends_on", "Término", "date", { required: true }),
        field("goal_revenue", "Meta de faturamento (R$)", "number", { min: "0", step: "0.01" }), field("notes", "Observações", "textarea"),
      ], "campaign");
      const result = await client.from("campaigns").select("id,name,starts_on,ends_on,goal_revenue,status").eq("organization_id", organizationId).order("starts_on", { ascending: false });
      failIfError(result.error);
      data.rows = (result.data ?? []).map((row) => ({ id: row.id, cells: [row.name, `${row.starts_on} a ${row.ends_on}`, currency.format(row.goal_revenue), row.status === "planned" ? "Planejada" : row.status === "active" ? "Ativa" : row.status === "finished" ? "Finalizada" : "Cancelada"] }));
      return data;
    }
    case "revenue":
    case "finance":
    case "cash-flow": {
      const data = base(key === "revenue" ? "Receitas" : key === "cash-flow" ? "Fluxo de caixa" : "Financeiro", "Entradas confirmadas e saídas registradas, pela data em que ocorreram.", "Ainda não há movimentações financeiras.", ["Data", "Movimento", "Categoria / forma", "Valor"]);
      const [payments, expenses] = await Promise.all([
        client.from("payments").select("id,order_id,amount,method,paid_at").eq("organization_id", organizationId).order("paid_at", { ascending: false }).limit(200),
        client.from("expenses").select("id,description,category,amount,paid_at").eq("organization_id", organizationId).order("paid_at", { ascending: false }).limit(200),
      ]);
      failIfError(payments.error); failIfError(expenses.error);
      const orders = await client.from("orders").select("id,order_number").eq("organization_id", organizationId).in("id", (payments.data ?? []).map((item) => item.order_id));
      failIfError(orders.error);
      const orderMap = new Map((orders.data ?? []).map((item) => [item.id, item.order_number]));
      const entries = [
        ...(payments.data ?? []).map((item) => ({ id: item.id, date: item.paid_at, label: `Recebimento do pedido #${orderMap.get(item.order_id) ?? "—"}`, category: item.method, amount: item.amount })),
        ...(expenses.data ?? []).map((item) => ({ id: item.id, date: item.paid_at, label: item.description, category: item.category, amount: -item.amount })),
      ].sort((a, b) => b.date.localeCompare(a.date));
      const visible = key === "revenue" ? entries.filter((item) => item.amount > 0) : key === "finance" ? entries : entries;
      data.rows = visible.map((item) => ({ id: item.id, cells: [dateLabel(item.date), item.label, item.category, `${item.amount < 0 ? "− " : "+ "}${currency.format(Math.abs(item.amount))}`] }));
      const revenue = entries.filter((item) => item.amount > 0).reduce((sum, item) => sum + item.amount, 0);
      const costs = entries.filter((item) => item.amount < 0).reduce((sum, item) => sum - item.amount, 0);
      data.metric = { label: key === "revenue" ? "Recebido" : "Saldo do período", value: currency.format(key === "revenue" ? revenue : revenue - costs), detail: `Entradas ${currency.format(revenue)} · Saídas ${currency.format(costs)}` };
      return data;
    }
    case "analytics": {
      const data = base("Análises", "Desempenho com base nos preços e custos preservados em cada venda.", "Registre vendas para começar a ver os indicadores.", ["Produto", "Unidades", "Faturamento", "Custo histórico", "Lucro bruto"]);
      const [orders, items] = await Promise.all([
        client.from("orders").select("id,status").eq("organization_id", organizationId).neq("status", "cancelled"),
        client.from("order_items").select("order_id,product_name_snapshot,quantity,line_total,unit_cost_snapshot").eq("organization_id", organizationId),
      ]);
      failIfError(orders.error); failIfError(items.error);
      const validOrders = new Set((orders.data ?? []).map((row) => row.id));
      const aggregate = new Map<string, { quantity: number; sales: number; costs: number }>();
      (items.data ?? []).filter((row) => validOrders.has(row.order_id)).forEach((row) => {
        const current = aggregate.get(row.product_name_snapshot) ?? { quantity: 0, sales: 0, costs: 0 };
        current.quantity += row.quantity; current.sales += row.line_total; current.costs += row.quantity * row.unit_cost_snapshot;
        aggregate.set(row.product_name_snapshot, current);
      });
      const ranking = [...aggregate.entries()].sort((a, b) => b[1].sales - a[1].sales);
      data.rows = ranking.map(([name, row]) => ({ id: name, cells: [name, String(row.quantity), currency.format(row.sales), currency.format(row.costs), currency.format(row.sales - row.costs)] }));
      const totals = ranking.reduce((sum, [, row]) => ({ quantity: sum.quantity + row.quantity, sales: sum.sales + row.sales, costs: sum.costs + row.costs }), { quantity: 0, sales: 0, costs: 0 });
      data.metric = { label: "Lucro bruto histórico", value: currency.format(totals.sales - totals.costs), detail: `${totals.quantity} unidades · ${currency.format(totals.sales)} vendidos` };
      return data;
    }
    case "settings": {
      const data = base("Configurações", "Dados básicos do espaço de trabalho e perfil de acesso.", "Atualize as informações da confeitaria.", ["Configuração", "Valor"], [field("organization_name", "Nome da confeitaria", "text", { required: true }), field("full_name", "Seu nome de exibição", "text", { required: true })], "settings");
      const [organization, profile] = await Promise.all([
        client.from("organizations").select("id,name").eq("id", organizationId).single(),
        userId ? client.from("profiles").select("user_id,full_name").eq("user_id", userId).single() : Promise.resolve({ data: null, error: null }),
      ]);
      failIfError(organization.error); failIfError(profile.error);
      if (!organization.data) throw new Error("Organização não encontrada.");
      data.fields = data.fields.map((item) => ({ ...item, defaultValue: item.name === "organization_name" ? organization.data.name : profile.data?.full_name ?? "" }));
      data.rows = [{ id: organizationId, cells: [["Organização", organization.data.name], ["Perfil", profile.data?.full_name ?? "Sem nome definido"]].map((item) => item.join(": ")) }];
      return data;
    }
    case "more": {
      return base("Mais módulos", "Acesse todos os cadastros e ferramentas de gestão.", "", ["Área", "Acesso"]);
    }
    default:
      throw new Error("Módulo não reconhecido.");
  }
}
