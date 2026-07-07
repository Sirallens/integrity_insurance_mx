var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker.ts
import { EmailMessage } from "cloudflare:email";
var SENDER_ADDRESS = "noreply@integritymexicoinsurance.com";
var SENDER_NAME = "Integrity Mexico Insurance";
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/contact") {
      if (request.method === "POST") {
        return handleContactForm(request, env);
      }
      return jsonResponse({ ok: false, error: "Method not allowed" }, 405);
    }
    return env.ASSETS.fetch(request);
  }
};
async function handleContactForm(request, env) {
  const contentType = request.headers.get("Content-Type") ?? "";
  if (!contentType.includes("application/json")) {
    return jsonResponse({ ok: false, error: "Expected application/json" }, 400);
  }
  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON body" }, 400);
  }
  if (payload.website) {
    return jsonResponse({ ok: true }, 200);
  }
  const validationError = validatePayload(payload);
  if (validationError) {
    return jsonResponse({ ok: false, error: validationError }, 400);
  }
  const safe = {
    name: payload.name.trim().slice(0, 80),
    email: payload.email.trim().slice(0, 254).toLowerCase(),
    phone: (payload.phone ?? "").trim().slice(0, 20),
    policy: (payload.policy ?? "").trim().slice(0, 30),
    topic: (payload.topic ?? "General Inquiry").trim().slice(0, 100),
    message: payload.message.trim().slice(0, 2e3)
  };
  const recipients = parseRecipients(env.RECIPIENT_EMAILS);
  if (recipients.length === 0) {
    console.error("RECIPIENT_EMAILS is not configured or empty.");
    return jsonResponse({ ok: false, error: "Email service is not configured." }, 500);
  }
  const subject = `[Contact Form] ${safe.topic} \u2014 ${safe.name}`;
  const toHeader = recipients.join(", ");
  const rawMime = buildMimeMessage(SENDER_ADDRESS, SENDER_NAME, toHeader, subject, safe);
  const results = await Promise.allSettled(
    recipients.map(async (recipient) => {
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(rawMime));
          controller.close();
        }
      });
      const message = new EmailMessage(SENDER_ADDRESS, recipient, stream);
      await env.SEND_EMAIL.send(message);
      return recipient;
    })
  );
  const successes = results.filter((res) => res.status === "fulfilled");
  const failures = results.filter((res) => res.status === "rejected");
  failures.forEach((fail) => {
    console.error("Failed to dispatch email to a recipient:", fail.reason);
  });
  if (successes.length === 0 && recipients.length > 0) {
    console.error("All email dispatches failed.");
    return jsonResponse({ ok: false, error: "Failed to send email. Please try again." }, 500);
  }
  return jsonResponse({ ok: true }, 200);
}
__name(handleContactForm, "handleContactForm");
function validatePayload(payload) {
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
__name(validatePayload, "validatePayload");
function parseRecipients(raw) {
  if (!raw) return [];
  return raw.split(",").map((addr) => addr.trim()).filter((addr) => addr.length > 0 && EMAIL_RE.test(addr));
}
__name(parseRecipients, "parseRecipients");
function buildMimeMessage(from, fromName, toHeader, subject, payload) {
  const boundary = `boundary_${generateBoundaryId()}`;
  const now = (/* @__PURE__ */ new Date()).toUTCString();
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
    `--${boundary}--`
  ];
  return parts.join("\r\n");
}
__name(buildMimeMessage, "buildMimeMessage");
function buildPlainText(p) {
  return [
    `New contact form submission received via integritymexicoinsurance.com`,
    ``,
    `\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500`,
    `Name:    ${p.name}`,
    `Email:   ${p.email}`,
    `Phone:   ${p.phone || "Not provided"}`,
    `Policy:  ${p.policy || "Not provided"}`,
    `Topic:   ${p.topic}`,
    `\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500`,
    ``,
    `Message:`,
    p.message,
    ``,
    `\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500`,
    `This message was sent from the contact form.`,
    `Do not reply to this email \u2014 reply directly to: ${p.email}`
  ].join("\n");
}
__name(buildPlainText, "buildPlainText");
function buildHtml(p) {
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
                To reply, use the customer's email address above \u2014 do not reply to this message directly.
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
__name(buildHtml, "buildHtml");
function detailRow(label, value) {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:13px;font-weight:600;color:#64748b;width:130px;vertical-align:top;">${label}</td>
    <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#1e293b;">${value}</td>
  </tr>`;
}
__name(detailRow, "detailRow");
function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
__name(jsonResponse, "jsonResponse");
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
__name(escapeHtml, "escapeHtml");
function generateBoundaryId() {
  return crypto.randomUUID().replace(/-/g, "");
}
__name(generateBoundaryId, "generateBoundaryId");

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-Du8mtN/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-Du8mtN/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map
