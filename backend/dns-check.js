const fetch = global.fetch;

const dohQuery = async (url) => {
  try {
    const res = await fetch(url, { headers: { Accept: 'application/dns-json' } });
    console.log('URL:', url);
    console.log('status', res.status);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('doh error', err);
  }
};

(async () => {
  await dohQuery('https://cloudflare-dns.com/dns-query?name=api-inference.huggingface.co&type=A');
  await dohQuery('https://dns.google/resolve?name=api-inference.huggingface.co&type=A');
})();
