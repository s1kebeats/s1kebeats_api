import request from 'supertest';
import assert from 'assert';
import app from '../../build/app.js';
import { createMockContext } from '../context.js'

beforeEach(() => {
  mockCtx = createMockContext()
  ctx = mockCtx;
})

describe('register endpoint', () => {
  test('post only', () => {
    return request(app).get('/register')
    .then(res => assert.equal(res.statusCode, 404))
  });
});
  