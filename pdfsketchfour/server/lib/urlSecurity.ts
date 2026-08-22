import dns from 'dns/promises';
import net from 'net';
import { Agent } from 'undici';

function isPrivateIp(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (net.isIPv4(ip)) {
    const [a,b,c,d] = ip.split('.').map(Number);
    return a === 10 || a === 127 || a === 0 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127);
  }
  if (net.isIPv6(ip)) {
    return normalized === '::1' || normalized === '::' || normalized.startsWith('fc') ||
      normalized.startsWith('fd') || normalized.startsWith('fe8') || normalized.startsWith('fe9') ||
      normalized.startsWith('fea') || normalized.startsWith('feb');
  }
  return true;
}

export interface SafeUrlResult {
  url: URL;
  /** The exact IP address that was validated as non-private, per family. */
  ip: string;
  family: 4 | 6;
}

/**
 * Validates a URL is safe to fetch AND returns the specific IP address that
 * was checked. Callers must connect to THIS ip, not re-resolve the hostname
 * later — see the DNS-rebinding note on fetchSafeUrl below.
 */
export async function assertSafeHttpUrl(input: string): Promise<SafeUrlResult> {
  let url: URL;
  try { url = new URL(input); } catch { throw new Error('Invalid URL'); }
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Only HTTP and HTTPS URLs are allowed');
  if (url.username || url.password) throw new Error('URLs with embedded credentials are not allowed');

  const hostname = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local')) {
    throw new Error('Private/internal hosts are not allowed');
  }
  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) throw new Error('Private/internal IP addresses are not allowed');
    return { url, ip: hostname, family: net.isIPv6(hostname) ? 6 : 4 };
  }

  const addresses = await dns.lookup(hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(a => isPrivateIp(a.address))) {
    throw new Error('The target host resolves to a private or internal address');
  }
  const chosen = addresses[0];
  return { url, ip: chosen.address, family: chosen.family as 4 | 6 };
}

const DEFAULT_MAX_RESPONSE_BYTES = 25 * 1024 * 1024; // 25MB

/**
 * Fetches a URL after validating it's not pointed at a private/internal
 * network — with the connection PINNED to the exact IP we validated.
 *
 * Why the pinning matters: the earlier version called assertSafeHttpUrl()
 * (which does a DNS lookup) and then separately called fetch(url) (which
 * does its OWN DNS lookup internally). Between those two lookups, an
 * attacker-controlled DNS record can change what the hostname resolves to
 * ("DNS rebinding") — the validation sees a safe public IP, but the actual
 * request connects to whatever the second lookup returns, which can be a
 * private address. Pinning the socket to the specific IP we already
 * checked closes that gap: the Host header and TLS SNI still use the real
 * hostname (so virtual hosting and certificate validation are unaffected),
 * but the TCP connection itself cannot be redirected by a second lookup.
 *
 * This also enforces a hard cap on response size, since a malicious or
 * misconfigured server can send a Content-Length that doesn't match the
 * actual body (or omit it and stream indefinitely).
 */
export async function fetchSafeUrl(
  input: string,
  init: RequestInit = {},
  maxRedirects = 3,
  maxResponseBytes = DEFAULT_MAX_RESPONSE_BYTES,
): Promise<Response> {
  let current = input;
  for (let i = 0; i <= maxRedirects; i++) {
    const { url, ip, family } = await assertSafeHttpUrl(current);

    // Pin DNS resolution for this connection to the address we just
    // validated, instead of letting undici resolve the hostname again.
    const dispatcher = new Agent({
      connect: {
        lookup: (_hostname, _options, callback) => {
          callback(null, [{ address: ip, family, ttl: 0 }] as any);
        },
      },
    });

    const response = await fetch(url, {
      ...init,
      redirect: 'manual',
      // @ts-expect-error - `dispatcher` is undici's non-standard option for
      // pinning connections; Node's global fetch (built on undici) honors it.
      dispatcher,
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) throw new Error('Redirect response missing Location header');
      current = new URL(location, url).toString();
      await dispatcher.close();
      continue;
    }

    const bounded = await readBoundedResponse(response, maxResponseBytes);
    await dispatcher.close();
    return bounded;
  }
  throw new Error('Too many redirects');
}

/** Re-wraps a Response, enforcing a hard byte cap regardless of what Content-Length claims. */
async function readBoundedResponse(response: Response, maxBytes: number): Promise<Response> {
  if (!response.body) return response;
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        throw new Error(`Remote response exceeded the ${maxBytes}-byte limit`);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  return new Response(body, { status: response.status, statusText: response.statusText, headers: response.headers });
}
