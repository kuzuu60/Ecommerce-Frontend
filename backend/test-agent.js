const { Agent } = require('undici');
const { Resolver } = require('dns').promises;
const resolver = new Resolver();
resolver.setServers(['8.8.8.8', '8.8.4.4']);

const agent = new Agent({
  connect: {
    lookup: async (hostname, options) => {
      console.log('lookup called', hostname, options);
      const family = options.family === 6 ? 6 : 4;
      const records = await resolver.resolve(hostname, family === 4 ? 'A' : 'AAAA');
      console.log('resolved', records);
      return { host: Array.isArray(records) ? records[0] : records, port: options.port };
    }
  }
});

(async () => {
  try {
    const endpoint = 'https://router.huggingface.co/hf-inference/models/google/flan-t5-small';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer invalid'
      },
      body: JSON.stringify({ inputs: 'test' }),
      dispatcher: agent
    });
    console.log('fetch success', res.status);
    const text = await res.text();
    console.log(text.slice(0, 200));
  } catch (err) {
    console.error('fetch error', err);
  }
})();
