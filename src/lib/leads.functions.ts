import { createServerFn } from "@tanstack/react-start";
import { leadsRepository } from "@/server/repositories/leads.repository";
import { sanitizeText } from "./reviews.shared";

export const submitLeadFn = createServerFn({ method: "POST" })
  .validator(
    (input: {
      email: string;
      fullName?: string;
      source?: string;
      page?: string;
      message?: string;
    }) => ({
      email: sanitizeText(input.email, 160).toLowerCase(),
      fullName: sanitizeText(input.fullName, 120),
      source: sanitizeText(input.source, 60),
      page: sanitizeText(input.page, 100),
      message: sanitizeText(input.message, 2000),
    }),
  )
  .handler(async ({ data }): Promise<{ success: boolean; id: string }> => {
    if (!data.email) throw new Error("Email address is required.");

    const saved = await leadsRepository.insertLead({
      email: data.email,
      full_name: data.fullName || null,
      source: data.source || "contact_page",
      page: data.page || "/contact",
      message: data.message || null,
    });

    return { success: true, id: saved.id };
  });
