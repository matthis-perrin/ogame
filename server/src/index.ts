import {createServer} from 'http';

import {port} from '@src/server';
import {get, set} from '@src/storage';

createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.end();
    return;
  }
  if (req.url !== undefined) {
    if (req.method === 'GET') {
      const key = req.url.substr(1);
      // eslint-disable-next-line no-null/no-null
      res.write(JSON.stringify({data: get(key)}));
      res.end();
      return;
    }
    if (req.method === 'POST') {
      const key = req.url.substr(1);
      let data = '';
      req.on('data', chunk => (data += String(chunk)));
      req.on('end', () => {
        set(key, data);
        res.end();
        return;
      });
    }
  }
  res.end();
}).listen(port, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${port}`);
});
