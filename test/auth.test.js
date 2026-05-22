import test, { after, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import supertest from 'supertest';

let app;
let connectDB;
let UserModel;
let mongoMemoryServer;

function ensureTestEnv() {
    process.env.NODE_ENV ??= 'test';
    process.env.MODE ??= 'test';

    // JWT settings are required by src/configs/config.js
    process.env.JWT_SECRET ??= 'test_jwt_secret';
    process.env.ACCESS_JWT_EXPIRES_IN ??= '15m';
    process.env.REFRESH_JWT_EXPIRES_IN ??= '7d';
}

before(async () => {
    ensureTestEnv();

    // Prefer a real MongoDB if provided (e.g. GitHub Actions service container).
    // Otherwise, start an in-memory MongoDB for local/dev runs.
    if (!process.env.MONGO_URI) {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongoMemoryServer = await MongoMemoryServer.create();
        process.env.MONGO_URI = mongoMemoryServer.getUri();
    }

    ({ default: connectDB } = await import('../src/db.js'));
    await connectDB();

    ({ default: app } = await import('../src/app.js'));
    ({ default: UserModel } = await import('../src/models/user.model.js'));
});

beforeEach(async () => {
    await UserModel.deleteMany({});
});

after(async () => {
    await mongoose.connection.close(true);

    if (mongoMemoryServer) {
        await mongoMemoryServer.stop();
    }
});

test('server can listen and respond', async () => {
    const server = app.listen(0);

    try {
        const res = await supertest(server).get('/api/auth/get-me');
        assert.equal(res.status, 401);
    } finally {
        await new Promise((resolve) => server.close(resolve));
    }
});

test('POST /api/auth/register registers a user and returns an access token', async () => {
    const agent = supertest.agent(app);

    const res = await agent.post('/api/auth/register').send({
        username: 'rayyan_test',
        email: 'rayyan_test@example.com',
        password: 'Passw0rd1',
    });

    assert.equal(res.status, 201);
    assert.equal(res.body?.message, 'User registered successfully');
    assert.equal(res.body?.data?.email, 'rayyan_test@example.com');
    assert.ok(res.body?.accesstoken);

    const setCookie = res.headers['set-cookie'] ?? [];
    assert.ok(
        Array.isArray(setCookie) && setCookie.some((c) => c.startsWith('refreshtoken=')),
        'Expected refresh token cookie to be set'
    );
});

test('GET /api/auth/get-me returns 401 when no token is provided', async () => {
    const res = await supertest(app).get('/api/auth/get-me');
    assert.equal(res.status, 401);
    assert.equal(res.body?.message, 'Unauthorized');
});

test('GET /api/auth/get-me returns user info with a valid token', async () => {
    const agent = supertest.agent(app);

    const registerRes = await agent.post('/api/auth/register').send({
        username: 'rayyan_me',
        email: 'rayyan_me@example.com',
        password: 'Passw0rd1',
    });

    assert.equal(registerRes.status, 201);
    const accessToken = registerRes.body?.accesstoken;
    assert.ok(accessToken);

    const meRes = await agent
        .get('/api/auth/get-me')
        .set('Authorization', `Bearer ${accessToken}`);

    assert.equal(meRes.status, 200);
    assert.equal(meRes.body?.user?.email, 'rayyan_me@example.com');
    assert.equal(meRes.body?.user?.username, 'rayyan_me');
});

test('GET /api/auth/refresh-token returns a new access token when cookie exists', async () => {
    const agent = supertest.agent(app);

    const registerRes = await agent.post('/api/auth/register').send({
        username: 'rayyan_refresh',
        email: 'rayyan_refresh@example.com',
        password: 'Passw0rd1',
    });

    assert.equal(registerRes.status, 201);

    const refreshRes = await agent.get('/api/auth/refresh-token');

    assert.equal(refreshRes.status, 200);
    assert.equal(refreshRes.body?.message, 'Access token refreshed successfully');
    assert.ok(refreshRes.body?.accesstoken);
});

test('POST /api/auth/register rejects duplicate users', async () => {
    const agent = supertest.agent(app);

    const payload = {
        username: 'rayyan_dup',
        email: 'rayyan_dup@example.com',
        password: 'Passw0rd1',
    };

    const first = await agent.post('/api/auth/register').send(payload);
    assert.equal(first.status, 201);

    const second = await agent.post('/api/auth/register').send(payload);
    assert.equal(second.status, 400);
    assert.equal(second.body?.message, 'User with this email or username already exists');
});
