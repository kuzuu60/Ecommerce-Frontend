const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });

const testFetch = async () => {
  try {
    console.log('Testing example.com...');
    const r1 = await fetch('https://example.com');
    console.log('example.com status', r1.status);
    const text1 = await r1.text();
    console.log('example.com body slice:', text1.slice(0, 60));
  } catch (err) {
    console.error('example.com error', err);
  }

  try {
    console.log('Testing Hugging Face endpoint...');
    const model = process.env.HUGGINGFACE_MODEL || 'google/flan-t5-small';
    const url = `https://router.huggingface.co/hf-inference/models/${model}`;
    const r2 = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`
      },
      body: JSON.stringify({ inputs: 'test' })
    });
    console.log('huggingface status', r2.status);
    const text2 = await r2.text();
    console.log('huggingface body slice:', text2.slice(0, 200));
  } catch (err) {
    console.error('huggingface fetch error', err);
  }
};

testFetch();
