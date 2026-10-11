"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireMembership } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type WorkspaceActionState = { ok: boolean; message: string };
const initialState: WorkspaceActionState = { ok: false, message: "" };
const optionalText = z.string().trim().optional().transform((value) => value || null);
const positive = z.coerce.number().positive();
const nonNegative = z.coerce.number().nonnegative();

async function context() {
  const access = await requireMembership();
  if (access.status !== "ready") return null;
  const supabase = await createClient();
  if (!supabase) return null;
  return { supabase, organizationId: access.membership.organizationId, userId: access.user.id, role: access.membership.role };
}

function value(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function flag(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

function localDateTime(valueText: string) {
  if (!valueText) return null;
  const date = new Date(valueText);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function localDate(valueText: string) {
  return valueText ? `${valueText}T12:00:00-03:00` : new Date().toISOString();
}

function firstIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "Confira os dados informados.";
}

export async function createWorkspaceRecord(
  _previous: WorkspaceActionState = initialState,
  formData: FormData,
): Promise<WorkspaceActionState> {
  void _previous;
  const ctx = await context();
  if (!ctx) return { ok: false, message: "Entre novamente para continuar." };
  const kind = value(formData, "kind");
  const adminOnly = new Set(["category", "supplier", "ingredient", "product", "recipe", "purchase", "expense", "campaign", "settings"]);
  if (adminOnly.has(kind) && ctx.role !== "admin") return { ok: false, message: "Esta ação é permitida somente para administradores." };

  try {
    let errorMessage: string | null = null;
    switch (kind) {
      case "category": {
        const input = z.object({ name: z.string().trim().min(2).max(80), journey: z.enum(["experiment", "gift", "celebrate"]), is_seasonal: z.boolean() }).safeParse({ name: value(formData, "name"), journey: value(formData, "journey") || "experiment", is_seasonal: flag(formData, "is_seasonal") });
        if (!input.success) return { ok: false, message: firstIssue(input.error) };
        const result = await ctx.supabase.from("categories").insert({ ...input.data, organization_id: ctx.organizationId }); errorMessage = result.error?.message ?? null; break;
      }
      case "supplier": {
        const input = z.object({ name: z.string().trim().min(2).max(120), phone: optionalText, email: z.union([z.email(), z.literal("")]).optional().transform((email) => email || null), notes: optionalText }).safeParse({ name: value(formData, "name"), phone: value(formData, "phone"), email: value(formData, "email"), notes: value(formData, "notes") });
        if (!input.success) return { ok: false, message: firstIssue(input.error) };
        const result = await ctx.supabase.from("suppliers").insert({ ...input.data, organization_id: ctx.organizationId }); errorMessage = result.error?.message ?? null; break;
      }
      case "ingredient": {
        const input = z.object({ name: z.string().trim().min(2).max(120), kind: z.enum(["ingredient", "packaging"]), unit: z.enum(["g", "kg", "ml", "l", "un"]), package_quantity: positive, package_cost: nonNegative, stock_quantity: nonNegative, minimum_quantity: nonNegative, supplier_id: optionalText }).safeParse({ name: value(formData, "name"), kind: value(formData, "kind") || "ingredient", unit: value(formData, "unit"), package_quantity: value(formData, "package_quantity"), package_cost: value(formData, "package_cost"), stock_quantity: value(formData, "stock_quantity") || "0", minimum_quantity: value(formData, "minimum_quantity") || "0", supplier_id: value(formData, "supplier_id") });
        if (!input.success) return { ok: false, message: firstIssue(input.error) };
        const result = await ctx.supabase.from("ingredients").insert({ ...input.data, supplier_id: input.data.supplier_id, organization_id: ctx.organizationId }); errorMessage = result.error?.message ?? null; break;
      }
      case "product": {
        const input = z.object({ name: z.string().trim().min(2).max(140), category_id: optionalText, journey: z.enum(["experiment", "gift", "celebrate"]), sale_price: nonNegative, yield_quantity: positive, labor_minutes: z.coerce.number().int().nonnegative(), labor_cost: nonNegative, other_cost: nonNegative, image_url: optionalText, description: optionalText, is_seasonal: z.boolean(), is_personalizable: z.boolean() }).safeParse({ name: value(formData, "name"), category_id: value(formData, "category_id"), journey: value(formData, "journey") || "gift", sale_price: value(formData, "sale_price") || "0", yield_quantity: value(formData, "yield_quantity") || "1", labor_minutes: value(formData, "labor_minutes") || "0", labor_cost: value(formData, "labor_cost") || "0", other_cost: value(formData, "other_cost") || "0", image_url: value(formData, "image_url"), description: value(formData, "description"), is_seasonal: flag(formData, "is_seasonal"), is_personalizable: flag(formData, "is_personalizable") });
        if (!input.success) return { ok: false, message: firstIssue(input.error) };
        const result = await ctx.supabase.from("products").insert({ ...input.data, organization_id: ctx.organizationId }); errorMessage = result.error?.message ?? null; break;
      }
      case "recipe": {
        const input = z.object({ product_id: z.uuid(), ingredient_id: z.uuid(), quantity: positive }).safeParse({ product_id: value(formData, "product_id"), ingredient_id: value(formData, "ingredient_id"), quantity: value(formData, "quantity") });
        if (!input.success) return { ok: false, message: firstIssue(input.error) };
        const result = await ctx.supabase.from("recipe_items").upsert({ ...input.data, organization_id: ctx.organizationId }, { onConflict: "product_id,ingredient_id" }); errorMessage = result.error?.message ?? null; break;
      }
      case "customer": {
        const input = z.object({ name: z.string().trim().min(2).max(140), phone: optionalText, email: z.union([z.email(), z.literal("")]).optional().transform((email) => email || null), birthday: z.union([z.iso.date(), z.literal("")]).optional().transform((date) => date || null), notes: optionalText }).safeParse({ name: value(formData, "name"), phone: value(formData, "phone"), email: value(formData, "email"), birthday: value(formData, "birthday"), notes: value(formData, "notes") });
        if (!input.success) return { ok: false, message: firstIssue(input.error) };
        const result = await ctx.supabase.from("customers").insert({ ...input.data, organization_id: ctx.organizationId }); errorMessage = result.error?.message ?? null; break;
      }
      case "order":
      case "sale": {
        const input = z.object({ product_id: z.uuid(), customer_id: optionalText, quantity: positive, discount: nonNegative, due_at: z.union([z.iso.datetime(), z.literal("")]).optional().transform((date) => date || null), delivery_type: z.enum(["pickup", "delivery"]), notes: optionalText, payment_amount: nonNegative, payment_method: z.enum(["pix", "cash", "debit", "credit", "transfer", "other"]) }).safeParse({ product_id: value(formData, "product_id"), customer_id: value(formData, "customer_id"), quantity: value(formData, "quantity"), discount: value(formData, "discount") || "0", due_at: localDateTime(value(formData, "due_at")) ?? "", delivery_type: value(formData, "delivery_type") || "pickup", notes: value(formData, "notes"), payment_amount: value(formData, "payment_amount") || "0", payment_method: value(formData, "payment_method") || "pix" });
        if (!input.success) return { ok: false, message: firstIssue(input.error) };
        const { error } = await ctx.supabase.rpc("register_sale", { p_organization_id: ctx.organizationId, p_product_id: input.data.product_id, p_quantity: input.data.quantity, p_customer_id: input.data.customer_id, p_discount: kind === "sale" ? input.data.discount : 0, p_due_at: input.data.due_at, p_delivery_type: input.data.delivery_type, p_notes: input.data.notes, p_is_sale: kind === "sale", p_payment_amount: input.data.payment_amount, p_payment_method: input.data.payment_method });
        errorMessage = error?.message ?? null; break;
      }
      case "purchase": {
        const input = z.object({ ingredient_id: z.uuid(), supplier_id: optionalText, package_quantity: positive, package_cost: nonNegative, notes: optionalText }).safeParse({ ingredient_id: value(formData, "ingredient_id"), supplier_id: value(formData, "supplier_id"), package_quantity: value(formData, "package_quantity"), package_cost: value(formData, "package_cost"), notes: value(formData, "notes") });
        if (!input.success) return { ok: false, message: firstIssue(input.error) };
        const { error } = await ctx.supabase.rpc("register_purchase", { p_organization_id: ctx.organizationId, p_ingredient_id: input.data.ingredient_id, p_package_quantity: input.data.package_quantity, p_package_cost: input.data.package_cost, p_supplier_id: input.data.supplier_id, p_notes: input.data.notes });
        errorMessage = error?.message ?? null; break;
      }
      case "inventory": {
        const input = z.object({ ingredient_id: z.uuid(), quantity_delta: z.coerce.number().refine((number) => number !== 0), notes: z.string().trim().min(2).max(300) }).safeParse({ ingredient_id: value(formData, "ingredient_id"), quantity_delta: value(formData, "quantity_delta"), notes: value(formData, "notes") });
        if (!input.success) return { ok: false, message: firstIssue(input.error) };
        const { error } = await ctx.supabase.rpc("adjust_inventory", { p_organization_id: ctx.organizationId, p_ingredient_id: input.data.ingredient_id, p_quantity_delta: input.data.quantity_delta, p_notes: input.data.notes });
        errorMessage = error?.message ?? null; break;
      }
      case "production": {
        const input = z.object({ product_id: z.uuid(), planned_for: z.iso.datetime(), planned_quantity: positive, notes: optionalText }).safeParse({ product_id: value(formData, "product_id"), planned_for: localDateTime(value(formData, "planned_for")), planned_quantity: value(formData, "planned_quantity"), notes: value(formData, "notes") });
        if (!input.success) return { ok: false, message: firstIssue(input.error) };
        const result = await ctx.supabase.from("production_batches").insert({ ...input.data, organization_id: ctx.organizationId, created_by: ctx.userId }); errorMessage = result.error?.message ?? null; break;
      }
      case "expense": {
        const input = z.object({ description: z.string().trim().min(2).max(160), category: z.string().trim().min(2).max(60), amount: positive, paid_at: z.iso.datetime(), payment_method: z.enum(["pix", "cash", "debit", "credit", "transfer", "other"]), notes: optionalText }).safeParse({ description: value(formData, "description"), category: value(formData, "category") || "other", amount: value(formData, "amount"), paid_at: localDate(value(formData, "paid_at")), payment_method: value(formData, "payment_method") || "other", notes: value(formData, "notes") });
        if (!input.success) return { ok: false, message: firstIssue(input.error) };
        const result = await ctx.supabase.from("expenses").insert({ ...input.data, organization_id: ctx.organizationId, created_by: ctx.userId }); errorMessage = result.error?.message ?? null; break;
      }
      case "campaign": {
        const input = z.object({ name: z.string().trim().min(2).max(120), starts_on: z.iso.date(), ends_on: z.iso.date(), goal_revenue: nonNegative, notes: optionalText }).refine((data) => data.ends_on >= data.starts_on, { message: "O término deve ocorrer no mesmo dia ou depois do início." }).safeParse({ name: value(formData, "name"), starts_on: value(formData, "starts_on"), ends_on: value(formData, "ends_on"), goal_revenue: value(formData, "goal_revenue") || "0", notes: value(formData, "notes") });
        if (!input.success) return { ok: false, message: firstIssue(input.error) };
        const result = await ctx.supabase.from("campaigns").insert({ ...input.data, organization_id: ctx.organizationId }); errorMessage = result.error?.message ?? null; break;
      }
      case "settings": {
        if (ctx.role !== "admin") return { ok: false, message: "Somente administradores podem alterar as configurações." };
        const input = z.object({ organization_name: z.string().trim().min(2).max(120), full_name: z.string().trim().min(2).max(120) }).safeParse({ organization_name: value(formData, "organization_name"), full_name: value(formData, "full_name") });
        if (!input.success) return { ok: false, message: firstIssue(input.error) };
        const organizationResult = await ctx.supabase.from("organizations").update({ name: input.data.organization_name }).eq("id", ctx.organizationId);
        if (organizationResult.error) return { ok: false, message: "Não foi possível atualizar a confeitaria." };
        const profileResult = await ctx.supabase.from("profiles").update({ full_name: input.data.full_name }).eq("user_id", ctx.userId);
        errorMessage = profileResult.error?.message ?? null; break;
      }
      default:
        return { ok: false, message: "Ação não reconhecida." };
    }
    if (errorMessage) return { ok: false, message: "Não foi possível salvar. Confira os dados e tente novamente." };
    revalidatePath("/", "layout");
    return { ok: true, message: "Registro salvo." };
  } catch (error) {
    console.error("workspace mutation failed", error);
    return { ok: false, message: "Ocorreu um erro ao salvar. Tente novamente." };
  }
}

export async function updateOrderStatus(_previous: WorkspaceActionState, formData: FormData): Promise<WorkspaceActionState> {
  const ctx = await context();
  if (!ctx) return { ok: false, message: "Entre novamente para continuar." };
  const input = z.object({ id: z.uuid(), status: z.enum(["quote", "awaiting_confirmation", "confirmed", "in_production", "ready", "delivered", "cancelled"]) }).safeParse({ id: value(formData, "id"), status: value(formData, "status") });
  if (!input.success) return { ok: false, message: firstIssue(input.error) };
  const result = await ctx.supabase.from("orders").update({ status: input.data.status }).eq("id", input.data.id).eq("organization_id", ctx.organizationId);
  if (result.error) return { ok: false, message: "Não foi possível atualizar o pedido." };
  revalidatePath("/", "layout");
  return { ok: true, message: "Pedido atualizado." };
}

export async function startProduction(_previous: WorkspaceActionState, formData: FormData): Promise<WorkspaceActionState> {
  const ctx = await context();
  if (!ctx) return { ok: false, message: "Entre novamente para continuar." };
  const input = z.uuid().safeParse(value(formData, "id"));
  if (!input.success) return { ok: false, message: "Lote inválido." };
  const result = await ctx.supabase.from("production_batches").update({ status: "in_progress" }).eq("id", input.data).eq("organization_id", ctx.organizationId).eq("status", "planned");
  if (result.error) return { ok: false, message: "Não foi possível iniciar o lote." };
  revalidatePath("/", "layout");
  return { ok: true, message: "Produção iniciada." };
}

export async function completeProduction(_previous: WorkspaceActionState, formData: FormData): Promise<WorkspaceActionState> {
  const ctx = await context();
  if (!ctx) return { ok: false, message: "Entre novamente para continuar." };
  const input = z.object({ id: z.uuid(), produced_quantity: positive, loss_quantity: nonNegative }).safeParse({ id: value(formData, "id"), produced_quantity: value(formData, "produced_quantity"), loss_quantity: value(formData, "loss_quantity") || "0" });
  if (!input.success) return { ok: false, message: firstIssue(input.error) };
  const { error } = await ctx.supabase.rpc("complete_production", { p_batch_id: input.data.id, p_produced_quantity: input.data.produced_quantity, p_loss_quantity: input.data.loss_quantity });
  if (error) return { ok: false, message: error.message.includes("Estoque insuficiente") ? "Estoque insuficiente para consumir a receita deste lote." : "Não foi possível concluir a produção." };
  revalidatePath("/", "layout");
  return { ok: true, message: "Lote concluído e estoque atualizado." };
}
