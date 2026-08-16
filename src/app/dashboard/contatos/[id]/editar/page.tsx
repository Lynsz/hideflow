import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { buttonStyles } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { getCompanyOptions } from "@/features/companies/services/company-service";
import { ContactForm } from "@/features/contacts/components/contact-form";
import { getContactById } from "@/features/contacts/services/contact-service";

export default async function EditContactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, user] = await Promise.all([params, getCurrentUser()]);
  const [contact, companies] = await Promise.all([
    getContactById(user!.id, id),
    getCompanyOptions(user!.id),
  ]);
  if (!contact) notFound();
  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <Link
        href={`/dashboard/contatos/${id}`}
        className={buttonStyles({ variant: "ghost", className: "-ml-3" })}
      >
        <ArrowLeft className="size-4" />
        Voltar para o contato
      </Link>
      <header className="mt-5 mb-7">
        <h1 className="text-2xl font-semibold sm:text-3xl">Editar contato</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Atualize os dados de {contact.name}.
        </p>
      </header>
      <ContactForm
        contactId={id}
        companies={companies}
        defaultValues={{
          name: contact.name,
          companyId: contact.company_id,
          role: contact.role ?? "",
          contactType: contact.contact_type ?? "",
          email: contact.email ?? "",
          phone: contact.phone ?? "",
          linkedinUrl: contact.linkedin_url ?? "",
          notes: contact.notes ?? "",
        }}
      />
    </main>
  );
}
