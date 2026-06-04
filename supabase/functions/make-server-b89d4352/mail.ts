const ADMIN_EMAIL = "juliezhu.ziyang@gmail.com";

export async function sendResendEmail(opts: {
  subject: string;
  html: string;
  attachments?: { filename: string; content: string }[];
}): Promise<void> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY not configured");
  }

  const body: Record<string, unknown> = {
    from: "Chirp <onboarding@resend.dev>",
    to: [ADMIN_EMAIL],
    subject: opts.subject,
    html: opts.html,
  };
  if (opts.attachments?.length) {
    body.attachments = opts.attachments;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend failed: ${text}`);
  }
}
