// Only publisher-owned image hosts explicitly used by the configured RSS feeds.
/** @param {unknown} value @param {string} host */
export function allowedFeedImage(value, host) {
  try {
    const url = new URL(String(value));
    const allowed = [host, ...(host === 'cbc.ca' ? ['i.cbc.ca'] : host === 'bbc.co.uk' ? ['ichef.bbci.co.uk'] : [])];
    return url.protocol === 'https:' && allowed.includes(url.hostname.replace(/^www\./, '')) ? url.href : undefined;
  } catch { return undefined; }
}
