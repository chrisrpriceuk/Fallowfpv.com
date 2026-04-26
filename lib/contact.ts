export type ContactFormPayload = {
  name: string;
  email: string;
  project?: string;
  message: string;
  company?: string; // honeypot
};

export function normalizeContactPayload(
  input: Partial<ContactFormPayload> | null | undefined
): ContactFormPayload {
  const r = input ?? {};
  return {
    name: String(r.name ?? "").trim(),
    email: String(r.email ?? "").trim(),
    project: String(r.project ?? "").trim(),
    message: String(r.message ?? "").trim(),
    company: String(r.company ?? "").trim(),
  };
}

export function validateContactPayload(payload: ContactFormPayload): string | null {
  if (payload.company) return "Spam blocked.";
  if (payload.name.length < 2) return "Please provide your name.";
  if (payload.name.length > 120) return "Name is too long.";
  if (payload.email.length < 5 || payload.email.length > 200) {
    return "Please provide a valid email.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return "Please provide a valid email.";
  }
  if (payload.project && payload.project.length > 240) {
    return "Project field is too long.";
  }
  if (payload.message.length < 10) return "Message is too short.";
  if (payload.message.length > 5000) return "Message is too long.";
  return null;
}
