import request from 'supertest';
import assert from 'assert';
import app from '../../build/app.js';

describe('User logout', () => {
    it('Only POST', async () => {
        const res = await request(app).get('/api/logout');
        assert.equal(res.statusCode, 404);
    });
    it('No refresh token cookie', async () => {
        const res = await request(app).post('/api/logout');
        assert.equal(res.statusCode, 401);
    });
    it('Wrong refresh token cookie', async () => {
        const res = await request(app)
            .post('/api/logout')
            .set('Cookie', ['refreshToken=randomToken']);
        assert.equal(res.statusCode, 401);
    });
    it('Success', async () => {
        const login = await request(app).post('/api/login').send({
            login: 's1kebeats',
            password: 'Sbeats2005',
        });
        const refreshToken = login.body.refreshToken;
        console.log(refreshToken);
        const logout = await request(app)
            .post('/api/logout')
            .set('Cookie', ['refreshToken=' + refreshToken]);
        assert.equal(logout.statusCode, 200);
        assert.equal(logout.body.refreshToken, refreshToken);
        // token should be deleted from database
        const refreshWithDeletedToken = await request(app)
            .get('/api/refresh')
            .set('Cookie', ['refreshToken=' + refreshToken]);
        assert.equal(refreshWithDeletedToken.statusCode, 401);
    });
});
