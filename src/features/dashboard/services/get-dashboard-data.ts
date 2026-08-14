import type { DashboardData } from "@/features/dashboard/types/dashboard";

const dashboardData: DashboardData = {
  metrics: [
    {
      key: "applications",
      label: "Total de candidaturas",
      value: 24,
      supportingText: "+4 neste mês",
    },
    {
      key: "sent",
      label: "Candidaturas enviadas",
      value: 16,
      supportingText: "67% do total",
    },
    {
      key: "interviews",
      label: "Entrevistas",
      value: 5,
      supportingText: "+2 esta semana",
    },
    {
      key: "offers",
      label: "Propostas recebidas",
      value: 2,
      supportingText: "8% de conversão",
    },
  ],
  pipeline: [
    { label: "Salvas", value: 8, percentage: 100 },
    { label: "Aplicadas", value: 16, percentage: 80 },
    { label: "Triagem", value: 7, percentage: 48 },
    { label: "Entrevistas", value: 5, percentage: 34 },
    { label: "Propostas", value: 2, percentage: 16 },
  ],
  recentApplications: [
    {
      id: "app-01",
      company: "Nubank",
      role: "Product Designer",
      status: "Entrevista",
      date: "12 ago 2026",
    },
    {
      id: "app-02",
      company: "Vercel",
      role: "Frontend Engineer",
      status: "Triagem",
      date: "10 ago 2026",
    },
    {
      id: "app-03",
      company: "Acme Labs",
      role: "Full Stack Developer",
      status: "Aplicada",
      date: "08 ago 2026",
    },
    {
      id: "app-04",
      company: "Orbit",
      role: "Software Engineer",
      status: "Proposta",
      date: "04 ago 2026",
    },
  ],
};

export async function getDashboardData(): Promise<DashboardData> {
  return dashboardData;
}
