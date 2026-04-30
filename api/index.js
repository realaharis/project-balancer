export const config = { runtime: "edge" };

const T = (p || "").replace(/\/$/, "");
const H = new Set(["host","connection","keep-alive","proxy-authenticate","proxy-authorization","te","trailer","transfer-encoding","upgrade","forwarded","x-forwarded-host","x-forwarded-proto","x-forwarded-port"]);
const S = (r) => {
  const h = new Headers();
  let c = null;
  for (const [k, v] of r.headers) {
    if (H.has(k)) continue;
    if (k.startsWith("x-vercel-")) continue;
    if (k === "x-real-ip") { c = v; continue; }
    if (k === "x-forwarded-for") { if (!c) c = v; continue; }
    h.set(k, v);
  }
  if (c) h.set("x-forwarded-for", c);
  return h;
};
const M = r => r.method;
const B = M !== "GET" && M !== "HEAD";
export default async function handler(req) {
  if (!T) return new Response("Misconfigured: TARGET_DOMAIN is not set", { status: 500 });
  try {
    const p = req.url.indexOf("/", 8);
    const t = p === -1 ? T + "/" : T + req.url.slice(p);
    const h = S(req);
    const m = M;
    const hasBody = B;
    return await fetch(t, {
      method: m,
      headers: h,
      body: hasBody ? req.body : undefined,
      duplex: "half",
      redirect: "manual",
    });
  } catch (e) {
    console.error("relay error:", e);
    return new Response("Bad Gateway: Tunnel Failed", { status: 502 });
  }
}
