import request from 'supertest';
import assert from 'assert';
import app from '../../build/app.js';

describe('Deleting comment', () => {
    it('Only POST', async () => {
        const res = await request(app).get('/api/comment/delete/2');
        assert.equal(res.statusCode, 404);
    });
    it('Not authorized', async () => {
        const res = await request(app).post('/api/comment/delete/2');
        assert.equal(res.statusCode, 401);
    });
    it('Not authorized', async () => {
        const res = await request(app).post('/api/comment/delete/2');
        assert.equal(res.statusCode, 401);
    });
    it('Not comment author', async () => {
        const login = await request(app).post('/api/login').send({
            login: 'hasNoBeats',
            password: 'hasNoBeats',
        });
        const accessToken = login.body.accessToken;
        const res = await request(app)
            .post('/api/comment/delete/2')
            .set('Authorization', 'Bearer ' + accessToken);
        assert.equal(res.statusCode, 401);
    });
});
