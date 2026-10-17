const assert = require('assert');
const MaskingService = require('./src/services/masking.service');
const AuthService = require('./src/services/auth.service');
const pool = require('./src/config/database');
const { io } = require('socket.io-client');
const http = require('http');
const app = require('./src/app');
const { Server } = require('socket.io');
const websocketConfig = require('./src/config/websocket');
const setupSockets = require('./src/sockets');

async function runTests() {
    console.log('🧪 Starting System Verification Tests...\n');

    // 1. Test Masking Engine
    console.log('Test 1: Masking Engine...');
    const emailTest1 = MaskingService.maskEmail('john.doe@example.com');
    assert.strictEqual(emailTest1, 'j******e@example.com', `Expected j******e@example.com, got ${emailTest1}`);

    const emailTest2 = MaskingService.maskEmail('me@domain.com');
    assert.strictEqual(emailTest2, '**@domain.com', `Expected **@domain.com, got ${emailTest2}`);

    const phoneTest1 = MaskingService.maskPhone('9876543210');
    assert.strictEqual(phoneTest1, '98******10', `Expected 98******10, got ${phoneTest1}`);

    const phoneTest2 = MaskingService.maskPhone('+91 98765 43210');
    assert.ok(phoneTest2.includes('98') && phoneTest2.includes('10'), `Expected phone mask with 98 and 10, got ${phoneTest2}`);

    const combinedTest = MaskingService.maskMessage('Call me at 9876543210 or email test.user@sample.org immediately!');
    console.log('Combined masked result:', combinedTest);
    assert.ok(combinedTest.includes('98******10'), 'Phone was not masked in combined text');
    assert.ok(combinedTest.includes('t*******r@sample.org'), 'Email was not masked in combined text');
    console.log('✅ Masking Engine passed!\n');

    // 2. Test Auth Service
    console.log('Test 2: Auth Service Login...');
    const loginResult = await AuthService.login({
        email: 'alice@example.com',
        password: 'password123'
    });
    assert.ok(loginResult.token, 'Token not returned');
    assert.strictEqual(loginResult.user.email, 'alice@example.com', 'User email mismatch');
    const aliceToken = loginResult.token;
    console.log('✅ Auth Service login passed! Token generated.\n');

    // 3. Test HTTP Server & Socket.IO integration
    console.log('Test 3: WebSocket and Real-time Dispatch on ephemeral port...');
    const testServer = http.createServer(app);
    const testIo = new Server(testServer, websocketConfig);
    setupSockets(testIo);

    await new Promise((resolve) => testServer.listen(0, resolve));
    const port = testServer.address().port;
    console.log(`Ephemeral test server running on port ${port}`);

    // Login Bob as well
    const bobLogin = await AuthService.login({
        email: 'bob.smith@example.com',
        password: 'password123'
    });
    const bobToken = bobLogin.token;

    // Connect Alice Socket
    const aliceSocket = io(`http://localhost:${port}`, {
        auth: { token: aliceToken },
        transports: ['websocket']
    });

    // Connect Bob Socket
    const bobSocket = io(`http://localhost:${port}`, {
        auth: { token: bobToken },
        transports: ['websocket']
    });

    await Promise.all([
        new Promise((resolve) => aliceSocket.on('connect', resolve)),
        new Promise((resolve) => bobSocket.on('connect', resolve))
    ]);
    console.log('✅ Both Alice and Bob connected to WebSocket with valid JWTs.');

    // Test real-time message sending from Alice to Bob with PII
    const rawContent = 'Hey Bob, call my personal mobile 9876543210 or email secret@private.com';
    const messagePromise = new Promise((resolve, reject) => {
        bobSocket.on('message:receive', (msg) => {
            try {
                console.log('Bob received message:', msg);
                assert.ok(!msg.content.includes('9876543210'), 'Unmasked phone leaked to recipient!');
                assert.ok(!msg.content.includes('secret@private.com'), 'Unmasked email leaked to recipient!');
                assert.ok(msg.content.includes('98******10'), 'Masked phone missing!');
                assert.ok(msg.content.includes('s****t@private.com'), 'Masked email missing!');
                resolve(msg);
            } catch (err) {
                reject(err);
            }
        });
    });

    aliceSocket.emit('message:send', {
        recipientId: bobLogin.user.id,
        content: rawContent,
        tempId: 'test_temp_123'
    });

    await messagePromise;
    console.log('✅ Real-time message dispatch and sensitive PII masking confirmed!');

    // Cleanup
    aliceSocket.disconnect();
    bobSocket.disconnect();
    await new Promise((resolve) => setTimeout(resolve, 300));
    await new Promise((resolve) => testServer.close(resolve));
    await pool.end();

    console.log('\n🎉 ALL SYSTEM TESTS PASSED SUCCESSFULLY! 🚀');
    process.exit(0);
}

runTests().catch((err) => {
    console.error('❌ Test failed:', err);
    process.exit(1);
});
