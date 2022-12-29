import request from 'request';
import assert from 'assert';
import app from '../../build/app.js';

describe('Uploading media files', function () {
  it('Only POST', async () => {
    const res = await request(app).get('/media/upload');
  });
});
