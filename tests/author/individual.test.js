import request from 'supertest';
import assert from 'assert';
import app from '../../build/app.js';

// Author for tests: { username: 's1kebeats', beats: 4 }
describe('Author individual data', () => {
    it('Only GET', async () => {
        const res = await request(app).post('/api/author/s1kebeats');
        assert.equal(res.statusCode, 404);
    });
    it('Not existing author', async () => {
        const res = await request(app).get('/api/author/NotExistingAuthor');
        assert.equal(res.statusCode, 404);
    });
    it('Success', async () => {
        const res = await request(app).get('/api/author/s1kebeats');
        assert.equal(res.statusCode, 200);
        assert.equal(res.body.username, 's1kebeats');
        assert.equal(res.body.beats.length, 4);
    });
});
