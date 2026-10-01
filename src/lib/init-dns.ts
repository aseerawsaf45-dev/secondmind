import dns from 'node:dns';
import net from 'node:net';

/**
 * High-reliability fixed DNS resolvers:
 * 1. Google Public DNS: 8.8.8.8, 8.8.4.4
 * 2. Cloudflare Public DNS: 1.1.1.1, 1.0.0.1
 */
const DEFAULT_DNS_SERVERS = ['8.8.8.8', '1.1.1.1', '8.8.4.4', '1.0.0.1'];

interface DnsRecord {
  address: string;
  family: number;
}

interface CacheEntry {
  records: DnsRecord[];
  expiresAt: number;
}

const GLOBAL_FLAG = Symbol.for('__secondmind_fixed_dns_initialized__');
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache TTL
const MAX_CACHE_SIZE = 1000;

export function getFixedDnsServers(): string[] {
  const envServers = process.env.FIXED_DNS_SERVERS || process.env.DNS_SERVERS;
  if (envServers) {
    const parsed = envServers
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (parsed.length > 0) {
      return parsed;
    }
  }
  return DEFAULT_DNS_SERVERS;
}

export function setupFixedDns(): void {
  // Only execute in Node.js server environments
  if (typeof window !== 'undefined') {
    return;
  }

  const globalRef = globalThis as unknown as Record<symbol, boolean | undefined>;
  if (globalRef[GLOBAL_FLAG]) {
    return;
  }
  globalRef[GLOBAL_FLAG] = true;

  const servers = getFixedDnsServers();

  try {
    // 1. Force IPv4 first to eliminate Windows / ISP IPv6 resolution delays & connection aborts
    if (typeof dns.setDefaultResultOrder === 'function') {
      dns.setDefaultResultOrder('ipv4first');
    }

    // 2. Configure global Node.js DNS servers
    if (typeof dns.setServers === 'function') {
      dns.setServers(servers);
    }
  } catch (err) {
    console.warn('[DNS] Failed to set default result order or DNS servers:', err);
  }

  // 3. Create a dedicated resolver using the fixed DNS servers
  const resolver = new dns.promises.Resolver({ timeout: 3500, tries: 2 });
  try {
    resolver.setServers(servers);
  } catch (err) {
    console.warn('[DNS] Failed to set servers on dedicated resolver:', err);
  }

  const dnsCache = new Map<string, CacheEntry>();

  function pruneCacheIfFull() {
    if (dnsCache.size > MAX_CACHE_SIZE) {
      const now = Date.now();
      for (const [key, entry] of dnsCache.entries()) {
        if (entry.expiresAt <= now) {
          dnsCache.delete(key);
        }
      }
      // If still too large, delete oldest half
      if (dnsCache.size > MAX_CACHE_SIZE) {
        let count = 0;
        for (const key of dnsCache.keys()) {
          dnsCache.delete(key);
          count++;
          if (count >= MAX_CACHE_SIZE / 2) break;
        }
      }
    }
  }

  async function resolveHostname(hostname: string, family: number): Promise<DnsRecord[]> {
    const cacheKey = `${hostname}:${family}`;
    const now = Date.now();
    const cached = dnsCache.get(cacheKey);

    if (cached && cached.expiresAt > now) {
      return cached.records;
    }

    let records: DnsRecord[] = [];

    if (family === 6) {
      const v6 = await resolver.resolve6(hostname);
      records = v6.map((addr) => ({ address: addr, family: 6 }));
    } else if (family === 4) {
      const v4 = await resolver.resolve4(hostname);
      records = v4.map((addr) => ({ address: addr, family: 4 }));
    } else {
      // family 0 or unspecified: prioritize IPv4, fallback to IPv6
      try {
        const v4 = await resolver.resolve4(hostname);
        records = v4.map((addr) => ({ address: addr, family: 4 }));
      } catch {
        const v6 = await resolver.resolve6(hostname);
        records = v6.map((addr) => ({ address: addr, family: 6 }));
      }
    }

    if (records.length > 0) {
      pruneCacheIfFull();
      dnsCache.set(cacheKey, {
        records,
        expiresAt: now + CACHE_TTL_MS,
      });
    }

    return records;
  }

  // 4. Hook dns.lookup so that global fetch, undici, https, http, and net sockets use fixed DNS
  const origLookup = dns.lookup;
  const origPromisesLookup = dns.promises?.lookup;

  function isLocalOrIp(hostname: string): boolean {
    if (!hostname) return true;
    if (hostname === 'localhost' || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
      return true;
    }
    if (net.isIP(hostname) !== 0) {
      return true;
    }
    return false;
  }

  // Type definitions for dns.lookup signature
  type LookupCallback = (
    err: NodeJS.ErrnoException | null,
    address: string | DnsRecord[],
    family?: number
  ) => void;

  function parseFamily(family: unknown): number {
    if (family === 6 || family === 'IPv6') return 6;
    if (family === 4 || family === 'IPv4') return 4;
    if (typeof family === 'number') return family;
    return 0;
  }

  const patchedLookup = function (
    hostname: string,
    optionsOrCallback: dns.LookupOptions | number | LookupCallback,
    maybeCallback?: LookupCallback
  ): void {
    let callback: LookupCallback;
    let options: dns.LookupOptions = {};

    if (typeof optionsOrCallback === 'function') {
      callback = optionsOrCallback;
    } else {
      callback = maybeCallback as LookupCallback;
      if (typeof optionsOrCallback === 'number') {
        options = { family: optionsOrCallback };
      } else if (optionsOrCallback) {
        options = optionsOrCallback;
      }
    }

    if (!hostname || isLocalOrIp(hostname)) {
      Reflect.apply(origLookup, dns, [hostname, options, callback]);
      return;
    }

    const all = Boolean(options.all);
    const family = parseFamily(options.family);

    resolveHostname(hostname, family)
      .then((records) => {
        if (!records || records.length === 0) {
          Reflect.apply(origLookup, dns, [hostname, options, callback]);
          return;
        }
        if (all) {
          callback(null, records);
        } else {
          callback(null, records[0].address, records[0].family);
        }
      })
      .catch(() => {
        // Fall back gracefully to original lookup if custom resolver encounters an error
        Reflect.apply(origLookup, dns, [hostname, options, callback]);
      });
  };

  const lookupWithPromisify = patchedLookup as typeof patchedLookup & {
    __promisify__?: unknown;
  };
  const origWithPromisify = origLookup as typeof origLookup & {
    __promisify__?: unknown;
  };
  if (origWithPromisify.__promisify__) {
    lookupWithPromisify.__promisify__ = origWithPromisify.__promisify__;
  }

  Object.defineProperty(dns, 'lookup', {
    value: lookupWithPromisify,
    writable: true,
    configurable: true,
  });

  if (dns.promises && origPromisesLookup) {
    const patchedPromisesLookup = async function (
      hostname: string,
      options?: dns.LookupOptions | number
    ): Promise<DnsRecord | DnsRecord[]> {
      let opts: dns.LookupOptions = {};
      if (typeof options === 'number') {
        opts = { family: options };
      } else if (options) {
        opts = options;
      }

      if (!hostname || isLocalOrIp(hostname)) {
        return Reflect.apply(origPromisesLookup, dns.promises, [hostname, opts]);
      }

      const all = Boolean(opts.all);
      const family = parseFamily(opts.family);

      try {
        const records = await resolveHostname(hostname, family);
        if (!records || records.length === 0) {
          return Reflect.apply(origPromisesLookup, dns.promises, [hostname, opts]);
        }
        if (all) {
          return records;
        }
        return records[0];
      } catch {
        return Reflect.apply(origPromisesLookup, dns.promises, [hostname, opts]);
      }
    };

    Object.defineProperty(dns.promises, 'lookup', {
      value: patchedPromisesLookup,
      writable: true,
      configurable: true,
    });
  }

  console.log(`[DNS] Fixed DNS enabled (${servers.join(', ')}) with IPv4 first`);
}

// Auto-initialize on module load if in server environment
if (typeof window === 'undefined') {
  setupFixedDns();
}
