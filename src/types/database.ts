export type AppRole = "admin" | "operation";

type Table<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

type Entity = {
  id: string;
  organization_id: string;
  created_at: string;
};

type UpdatedEntity = Entity & { updated_at: string };

export type Database = {
  public: {
    Tables: {
      organizations: Table<{ id: string; name: string; created_by: string | null; created_at: string; updated_at: string }>;
      profiles: Table<{ user_id: string; full_name: string | null; created_at: string; updated_at: string }>;
      organization_memberships: Table<{ organization_id: string; user_id: string; role: AppRole; created_by: string | null; created_at: string }>;
      categories: Table<Entity & { name: string; journey: string; is_seasonal: boolean; is_active: boolean }>;
      suppliers: Table<Entity & { name: string; phone: string | null; email: string | null; notes: string | null; is_active: boolean }>;
      ingredients: Table<UpdatedEntity & { supplier_id: string | null; name: string; kind: string; unit: string; package_quantity: number; package_cost: number; stock_quantity: number; minimum_quantity: number; is_active: boolean }>;
      products: Table<UpdatedEntity & { category_id: string | null; name: string; description: string | null; image_url: string | null; journey: string; is_seasonal: boolean; is_personalizable: boolean; is_active: boolean; yield_quantity: number; labor_minutes: number; labor_cost: number; other_cost: number; sale_price: number }>;
      recipe_items: Table<Entity & { product_id: string; ingredient_id: string; quantity: number }>;
      customers: Table<UpdatedEntity & { name: string; phone: string | null; email: string | null; birthday: string | null; notes: string | null }>;
      orders: Table<UpdatedEntity & { order_number: number; customer_id: string | null; status: string; delivery_type: string; due_at: string | null; subtotal: number; discount: number; total: number; notes: string | null; created_by: string | null }>;
      order_items: Table<Entity & { order_id: string; product_id: string | null; product_name_snapshot: string; quantity: number; unit_price_snapshot: number; unit_cost_snapshot: number; line_total: number }>;
      payments: Table<Entity & { order_id: string; amount: number; method: string; paid_at: string; notes: string | null }>;
      expenses: Table<Entity & { description: string; category: string; amount: number; paid_at: string; payment_method: string; notes: string | null; created_by: string | null }>;
      purchases: Table<Entity & { supplier_id: string | null; purchased_at: string; total: number; notes: string | null; created_by: string | null }>;
      purchase_items: Table<Entity & { purchase_id: string; ingredient_id: string; package_quantity: number; package_cost: number }>;
      inventory_movements: Table<Entity & { ingredient_id: string; movement_type: string; quantity_delta: number; unit_cost_snapshot: number; notes: string | null; created_by: string | null }>;
      production_batches: Table<UpdatedEntity & { product_id: string; order_id: string | null; planned_for: string; planned_quantity: number; produced_quantity: number; loss_quantity: number; status: string; notes: string | null; created_by: string | null }>;
      campaigns: Table<Entity & { name: string; starts_on: string; ends_on: string; goal_revenue: number; status: string; notes: string | null }>;
    };
    Views: {
      product_costs: {
        Row: { id: string | null; organization_id: string | null; sale_price: number | null; labor_minutes: number | null; labor_cost: number | null; other_cost: number | null; unit_cost: number | null; unit_profit: number | null; margin_percent: number | null };
        Relationships: [];
      };
    };
    Functions: {
      is_org_member: { Args: { target_org: string }; Returns: boolean };
      is_org_admin: { Args: { target_org: string }; Returns: boolean };
      is_org_member_path: { Args: { target_org: string }; Returns: boolean };
      is_org_admin_path: { Args: { target_org: string }; Returns: boolean };
      register_sale: { Args: { p_organization_id: string; p_product_id: string; p_quantity: number; p_customer_id: string | null; p_discount: number; p_due_at: string | null; p_delivery_type: string; p_notes: string | null; p_is_sale: boolean; p_payment_amount: number; p_payment_method: string }; Returns: string };
      register_purchase: { Args: { p_organization_id: string; p_ingredient_id: string; p_package_quantity: number; p_package_cost: number; p_supplier_id: string | null; p_notes: string | null }; Returns: string };
      adjust_inventory: { Args: { p_organization_id: string; p_ingredient_id: string; p_quantity_delta: number; p_notes: string | null }; Returns: undefined };
      complete_production: { Args: { p_batch_id: string; p_produced_quantity: number; p_loss_quantity: number }; Returns: undefined };
    };
    Enums: { app_role: AppRole };
    CompositeTypes: Record<string, never>;
  };
};
