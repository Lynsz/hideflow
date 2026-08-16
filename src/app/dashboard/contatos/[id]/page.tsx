import { ArrowLeft, ExternalLink, Mail, Pencil, Phone } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { buttonStyles } from "@/components/ui/button";
import { FormFeedback } from "@/components/ui/form-feedback";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { formatStatus } from "@/features/applications/services/application-formatters";
import { DeleteContactButton } from "@/features/contacts/components/delete-contact-button";
import { formatContactType } from "@/features/contacts/constants";
import { getContactById } from "@/features/contacts/services/contact-service";

export default async function ContactDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ feedback?: string }>;
}) {
  const [{ id }, { feedback }, user] = await Promise.all([
    params,
    searchParams,
    getCurrentUser(),
  ]);
  const contact = await getContactById(user!.id, id);
  if (!contact) notFound();
  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <Link
        href="/dashboard/contatos"
        className={buttonStyles({ variant: "ghost", className: "-ml-3" })}
      >
        <ArrowLeft className="size-4" />
        Voltar para contatos
      </Link>
      {feedback && (
        <div className="mt-5">
          <FormFeedback
            kind="success"
            message={
              feedback === "created"
                ? "Contato criado com sucesso."
                : "Contato atualizado com sucesso."
            }
          />
        </div>
      )}
      <header className="mt-6 flex flex-col justify-between gap-4 sm:flex-row">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">{contact.name}</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {contact.role || formatContactType(contact.contact_type)} ·{" "}
            {contact.company.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/contatos/${id}/editar`}
            className={buttonStyles({ variant: "secondary" })}
          >
            <Pencil className="size-4" />
            Editar
          </Link>
          <DeleteContactButton contactId={id} name={contact.name} />
        </div>
      </header>
      <div className="mt-7 grid gap-4 md:grid-cols-2">
        <section className="border-border bg-surface rounded-xl border p-5">
          <h2 className="font-medium">Dados do contato</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-muted-foreground text-xs">Tipo</dt>
              <dd className="mt-1">
                {formatContactType(contact.contact_type)}
              </dd>
            </div>
            {contact.email && (
              <div>
                <dt className="text-muted-foreground text-xs">Email</dt>
                <dd className="mt-1">
                  <a
                    className="text-accent inline-flex items-center gap-2"
                    href={`mailto:${contact.email}`}
                  >
                    <Mail className="size-4" />
                    {contact.email}
                  </a>
                </dd>
              </div>
            )}
            {contact.phone && (
              <div>
                <dt className="text-muted-foreground text-xs">Telefone</dt>
                <dd className="mt-1">
                  <a
                    className="text-accent inline-flex items-center gap-2"
                    href={`tel:${contact.phone}`}
                  >
                    <Phone className="size-4" />
                    {contact.phone}
                  </a>
                </dd>
              </div>
            )}
            {contact.linkedin_url && (
              <div>
                <dt className="text-muted-foreground text-xs">LinkedIn</dt>
                <dd className="mt-1">
                  <a
                    className="text-accent inline-flex items-center gap-2"
                    href={contact.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Abrir perfil
                    <ExternalLink className="size-4" />
                  </a>
                </dd>
              </div>
            )}
          </dl>
          {contact.notes && (
            <p className="border-border text-muted-foreground mt-5 border-t pt-5 text-sm whitespace-pre-wrap">
              {contact.notes}
            </p>
          )}
        </section>
        <section className="border-border bg-surface rounded-xl border p-5">
          <h2 className="font-medium">Candidaturas associadas</h2>
          {contact.applications.length ? (
            <ul className="mt-4 space-y-3">
              {contact.applications.map((application) => (
                <li key={application.id}>
                  <Link
                    className="hover:bg-muted block rounded-lg p-3"
                    href={`/dashboard/candidaturas/${application.id}`}
                  >
                    <span className="text-sm font-medium">
                      {application.job_title}
                    </span>
                    <span className="text-muted-foreground mt-1 block text-xs">
                      {formatStatus(application.status)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground mt-4 text-sm">
              Nenhuma candidatura associada.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
