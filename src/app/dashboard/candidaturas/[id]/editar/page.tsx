import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { buttonStyles } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { ApplicationForm } from "@/features/applications/components/application-form";
import { getApplicationById } from "@/features/applications/services/application-service";
import { getCompanyOptions } from "@/features/companies/services/company-service";
import { SUPPORTED_CURRENCIES } from "@/features/settings/constants";

export default async function EditApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, user] = await Promise.all([params, getCurrentUser()]);
  const [application, companies] = await Promise.all([
    getApplicationById(user!.id, id),
    getCompanyOptions(user!.id),
  ]);
  if (!application) notFound();

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <Link
        href={`/dashboard/candidaturas/${application.id}`}
        className={buttonStyles({ variant: "ghost", className: "-ml-3" })}
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Voltar para detalhes
      </Link>
      <header className="mt-5 mb-7">
        <h1 className="text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
          Editar candidatura
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Atualize os dados de {application.job_title}.
        </p>
      </header>
      <ApplicationForm
        companies={companies}
        applicationId={application.id}
        defaultValues={{
          companyId: application.company_id,
          jobTitle: application.job_title,
          jobUrl: application.job_url ?? "",
          location: application.location ?? "",
          workMode: application.work_mode ?? "",
          employmentType: application.employment_type ?? "",
          salaryMin: application.salary_min?.toString() ?? "",
          salaryMax: application.salary_max?.toString() ?? "",
          currency: SUPPORTED_CURRENCIES.includes(
            application.currency as (typeof SUPPORTED_CURRENCIES)[number],
          )
            ? (application.currency as (typeof SUPPORTED_CURRENCIES)[number])
            : "BRL",
          appliedAt: application.applied_at ?? "",
          source: application.source ?? "",
          status: application.status,
          description: application.description ?? "",
          notes: application.notes ?? "",
        }}
      />
    </main>
  );
}
