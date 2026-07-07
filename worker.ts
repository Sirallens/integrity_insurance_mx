/**
 * worker.ts — Cloudflare Worker entry point for Integrity Mexico Insurance.
 *
 * Routing:
 *   POST /api/contact  →  handleContactForm()  →  Cloudflare Email Workers
 *   Everything else    →  env.ASSETS (static ./dist build)
 *
 * Required environment bindings (wrangler.jsonc):
 *   ASSETS       — static asset serving (Fetcher)
 *   SEND_EMAIL   — Email Workers binding (SendEmail)
 *
 * Required secrets (wrangler secret put):
 *   RECIPIENT_EMAILS — comma-separated list of recipient addresses
 *                      e.g. "it@somosintegrity.mx,contact@somosintegrity.mx"
 */

import { EmailMessage } from "cloudflare:email";

// ---------------------------------------------------------------------------
// Environment interface
// ---------------------------------------------------------------------------

interface Env {
  /** Static asset binding — serves ./dist for non-API requests. */
  ASSETS: Fetcher;
  /** Email Workers binding — declared in wrangler.jsonc as "SEND_EMAIL". */
  SEND_EMAIL: SendEmail;
  /**
   * Comma-separated recipient addresses.
   * Set in production via: wrangler secret put RECIPIENT_EMAILS
   * Set locally in .dev.vars
   */
  RECIPIENT_EMAILS: string;
}

// ---------------------------------------------------------------------------
// Payload shape (mirrors ContactForm.svelte fields)
// ---------------------------------------------------------------------------

interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  policy?: string;
  topic?: string;
  message: string;
  website?: string; // honeypot field — must be absent or empty
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SENDER_ADDRESS = "noreply@integritymexicoinsurance.com";
const SENDER_NAME = "Integrity Mexico Insurance";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------------------------------------------------------------------------
// Worker entry point
// ---------------------------------------------------------------------------

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact") {
      if (request.method === "POST") {
        return handleContactForm(request, env);
      }
      // Reject non-POST methods on this route
      return jsonResponse({ ok: false, error: "Method not allowed" }, 405);
    }

    // Fall through to static assets for every other request
    return env.ASSETS.fetch(request);
  },
};

// ---------------------------------------------------------------------------
// Contact form handler
// ---------------------------------------------------------------------------

async function handleContactForm(request: Request, env: Env): Promise<Response> {
  // 1. Enforce JSON content type
  const contentType = request.headers.get("Content-Type") ?? "";
  if (!contentType.includes("application/json")) {
    return jsonResponse({ ok: false, error: "Expected application/json" }, 400);
  }

  // 2. Parse body
  let payload: ContactPayload;
  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON body" }, 400);
  }

  // 3. Honeypot check — silent 200 to confuse bots
  if (payload.website) {
    return jsonResponse({ ok: true }, 200);
  }

  // 4. Server-side validation
  const validationError = validatePayload(payload);
  if (validationError) {
    return jsonResponse({ ok: false, error: validationError }, 400);
  }

  // 5. Sanitize inputs
  const safe: Required<Omit<ContactPayload, "website">> = {
    name: payload.name.trim().slice(0, 80),
    email: payload.email.trim().slice(0, 254).toLowerCase(),
    phone: (payload.phone ?? "").trim().slice(0, 20),
    policy: (payload.policy ?? "").trim().slice(0, 30),
    topic: (payload.topic ?? "General Inquiry").trim().slice(0, 100),
    message: payload.message.trim().slice(0, 2000),
  };

  // 6. Parse recipients from env secret
  const recipients = parseRecipients(env.RECIPIENT_EMAILS);
  if (recipients.length === 0) {
    console.error("RECIPIENT_EMAILS is not configured or empty.");
    return jsonResponse({ ok: false, error: "Email service is not configured." }, 500);
  }

  // 7. Build MIME message (shared across all recipients)
  const subject = `[Contact Form] ${safe.topic} — ${safe.name}`;
  const toHeader = recipients.join(", ");
  const rawMime = buildMimeMessage(SENDER_ADDRESS, SENDER_NAME, toHeader, subject, safe);

  // 8. Send one EmailMessage per recipient (Cloudflare delivers per-address) using Promise.allSettled for resilience
  const results = await Promise.allSettled(
    recipients.map(async (recipient) => {
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(rawMime));
          controller.close();
        },
      });
      const message = new EmailMessage(SENDER_ADDRESS, recipient, stream);
      await env.SEND_EMAIL.send(message);
      return recipient;
    })
  );

  const successes = results.filter((res) => res.status === "fulfilled") as PromiseFulfilledResult<string>[];
  const failures = results.filter((res) => res.status === "rejected") as PromiseRejectedResult[];

  failures.forEach((fail) => {
    console.error("Failed to dispatch email to a recipient:", fail.reason);
  });

  // Only fail the user-facing request if ALL recipients failed to receive the email
  if (successes.length === 0 && recipients.length > 0) {
    console.error("All email dispatches failed.");
    return jsonResponse({ ok: false, error: "Failed to send email. Please try again." }, 500);
  }

  return jsonResponse({ ok: true }, 200);
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validatePayload(payload: ContactPayload): string | null {
  const name = payload.name?.trim() ?? "";
  const email = payload.email?.trim() ?? "";
  const message = payload.message?.trim() ?? "";

  if (!name) return "Name is required.";
  if (name.length < 2) return "Name must be at least 2 characters.";

  if (!email) return "Email is required.";
  if (!EMAIL_RE.test(email)) return "Please enter a valid email address.";

  if (!message) return "Message is required.";
  if (message.length < 10) return "Message must be at least 10 characters.";

  return null;
}

// ---------------------------------------------------------------------------
// Recipients parsing
// ---------------------------------------------------------------------------

function parseRecipients(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((addr) => addr.trim())
    .filter((addr) => addr.length > 0 && EMAIL_RE.test(addr));
}

// ---------------------------------------------------------------------------
// MIME message construction (no external dependencies)
// ---------------------------------------------------------------------------

function buildMimeMessage(
  from: string,
  fromName: string,
  toHeader: string,
  subject: string,
  payload: Required<Omit<ContactPayload, "website">>
): string {
  const boundary = `boundary_${generateBoundaryId()}`;
  const now = new Date().toUTCString();
  const messageId = `<${generateBoundaryId()}@integritymexicoinsurance.com>`;

  const textBody = buildPlainText(payload);
  const htmlBody = buildHtml(payload);

  const parts = [
    `MIME-Version: 1.0`,
    `Date: ${now}`,
    `Message-ID: ${messageId}`,
    `From: ${fromName} <${from}>`,
    `To: ${toHeader}`,
    `Subject: ${subject}`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset=utf-8`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    textBody,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=utf-8`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    htmlBody,
    ``,
    `--${boundary}--`,
  ];

  return parts.join("\r\n");
}

function buildPlainText(p: Required<Omit<ContactPayload, "website">>): string {
  return [
    `New contact form submission received via integritymexicoinsurance.com`,
    ``,
    `──────────────────────────────────────`,
    `Name:    ${p.name}`,
    `Email:   ${p.email}`,
    `Phone:   ${p.phone || "Not provided"}`,
    `Policy:  ${p.policy || "Not provided"}`,
    `Topic:   ${p.topic}`,
    `──────────────────────────────────────`,
    ``,
    `Message:`,
    p.message,
    ``,
    `──────────────────────────────────────`,
    `This message was sent from the contact form.`,
    `Do not reply to this email — reply directly to: ${p.email}`,
  ].join("\n");
}

function buildHtml(p: Required<Omit<ContactPayload, "website">>): string {
  const esc = escapeHtml;
  const msgHtml = esc(p.message).replace(/\n/g, "<br>");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Contact Form Submission</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1d4ed8 0%,#2563eb 100%);padding:32px 40px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-.3px;">
                New Contact Form Submission
              </h1>
              <p style="margin:6px 0 0;color:#bfdbfe;font-size:14px;">
                integritymexicoinsurance.com
              </p>
            </td>
          </tr>

          <!-- Details table -->
          <tr>
            <td style="padding:32px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                ${detailRow("Name", esc(p.name))}
                ${detailRow("Reply-to Email", `<a href="mailto:${esc(p.email)}" style="color:#2563eb;">${esc(p.email)}</a>`)}
                ${detailRow("Phone", esc(p.phone) || "<span style='color:#94a3b8;'>Not provided</span>")}
                ${detailRow("Policy #", esc(p.policy) || "<span style='color:#94a3b8;'>Not provided</span>")}
                ${detailRow("Topic", `<span style="background:#eff6ff;color:#1d4ed8;padding:2px 10px;border-radius:999px;font-size:13px;font-weight:600;">${esc(p.topic)}</span>`)}
              </table>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding:24px 40px 0;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;">Message</p>
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;font-size:15px;line-height:1.7;color:#334155;">
                ${msgHtml}
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:32px 40px;border-top:1px solid #f1f5f9;margin-top:32px;">
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
                This message was sent automatically from the contact form on
                <a href="https://integritymexicoinsurance.com" style="color:#2563eb;">integritymexicoinsurance.com</a>.<br>
                To reply, use the customer's email address above — do not reply to this message directly.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:13px;font-weight:600;color:#64748b;width:130px;vertical-align:top;">${label}</td>
    <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#1e293b;">${value}</td>
  </tr>`;
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function jsonResponse(body: object, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Generates a unique MIME boundary segment.
 * Uses crypto.randomUUID() — available in the Cloudflare Workers runtime.
 */
function generateBoundaryId(): string {
  return crypto.randomUUID().replace(/-/g, "");
}
