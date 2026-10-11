export type FieldOption = { value: string; label: string };

export type WorkspaceField = {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "number" | "date" | "datetime-local" | "select" | "textarea" | "checkbox";
  required?: boolean;
  step?: string;
  min?: string;
  placeholder?: string;
  defaultValue?: string;
  options?: FieldOption[];
};

export type WorkspaceRow = {
  id: string;
  cells: string[];
  status?: string;
  statusOptions?: FieldOption[];
  action?: "order-status" | "production-status" | "complete-production" | "payment";
};

export type AgendaEvent = {
  id: string;
  date: string;
  title: string;
  subtitle: string;
  time: string;
  status: string;
  kind: "order" | "production";
};

export type WorkspaceData = {
  title: string;
  description: string;
  fields: WorkspaceField[];
  columns: string[];
  rows: WorkspaceRow[];
  metric?: { label: string; value: string; detail?: string };
  emptyMessage: string;
  mode?: "create" | "none";
  recordKind?: string;
  secondaryFields?: WorkspaceField[];
  secondaryKind?: string;
  agendaEvents?: AgendaEvent[];
  agendaToday?: string;
};
