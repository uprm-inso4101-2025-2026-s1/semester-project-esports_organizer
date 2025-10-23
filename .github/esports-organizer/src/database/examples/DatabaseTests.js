import { Database } from './Database.js';

// This test file avoids calling real Firebase services by injecting mocks into Database.

// Utility function to run tests
async function runTests() {
    console.log('Starting signUpUser tests...\n');
    let testsPassed = 0;
    let totalTests = 0;

    function assert(condition, message) {
        totalTests++;
        if (condition) {
            console.log('✅ Test passed:', message);
            testsPassed++;
        } else {
            console.log('❌ Test failed:', message);
        }
    }

    // Initialize database with mocks to avoid real Firebase network calls
    const mockAuth = { /* placeholder auth object */ };

    // Track created users in-memory
    const inMemoryUsers = {};

    // Mock createUserWithEmailAndPassword: returns a userCredential-like object or throws
    async function mockCreateUserWithEmailAndPassword(auth, email, password) {
        // basic validation to simulate Firebase behavior
        if (!email.includes('@')) throw new Error('auth/invalid-email');
        if (password.length < 6) throw new Error('auth/weak-password');
        if (inMemoryUsers[email]) throw new Error('auth/email-already-in-use');

        const uid = 'uid_' + Math.random().toString(36).slice(2, 10);
        const user = {
            uid,
            email,
            displayName: null,
            updateProfile: async function ({ displayName }) { this.displayName = displayName; },
            delete: async function () { delete inMemoryUsers[email]; }
        };

        inMemoryUsers[email] = { uid, email, displayName: null };

        return { user };
    }

    // Mock Firestore functions used by Database
    const mockFirestore = {};

    // Create Database instance with injected mocks
    const database = new Database({
        app: {},
        firestore: mockFirestore,
        auth: mockAuth,
        createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
        signInWithEmailAndPassword: async () => { throw new Error('not-implemented'); },
        onAuthStateChanged: () => {}
    });

    // Stub out methods that would call Firestore so they don't perform network operations
    database.addUserToDatabase = async function (user) {
        // store minimal user info
        this.users.push(user);
        inMemoryUsers[user.email] = { uid: user.uID, email: user.email, displayName: user.displayName };
    };

    database.updateUserProfile = async function (userID, profileData) {
        // attach profile to in-memory user
        for (const k of Object.keys(inMemoryUsers)) {
            if (inMemoryUsers[k].uid === userID) {
                inMemoryUsers[k].profile = profileData;
                return;
            }
        }
    };

    // Test 1: Test successful user signup
    try {
        const email = 'test@example.com';
        const password = 'Test123!';
        const username = 'testuser';

        const newUser = await database.signUpUser(email, password, username);
        assert(
            newUser !== null && newUser.email === email,
            'Should successfully create a new user'
        );
    } catch (error) {
        assert(false, 'User signup should not throw an error: ' + error.message);
    }

    // Test 2: Test invalid email format
    try {
        const invalidEmail = 'invalid-email';
        const password = 'Test123!';
        const username = 'testuser';

        const result = await database.signUpUser(invalidEmail, password, username);
        assert(
            result === null,
            'Should handle invalid email format gracefully'
        );
    } catch (error) {
        assert(true, 'Invalid email was correctly rejected');
    }

    // Test 3: Test weak password
    try {
        const email = 'test2@example.com';
        const weakPassword = '123';
        const username = 'testuser2';

        const result = await database.signUpUser(email, weakPassword, username);
        assert(
            result === null,
            'Should reject weak passwords'
        );
    } catch (error) {
        assert(true, 'Weak password was correctly rejected');
    }

    // Test 4: Test duplicate email
    try {
        const email = 'test@example.com'; // Same email as Test 1
        const password = 'Test123!';
        const username = 'testuser3';

        const result = await database.signUpUser(email, password, username);
        assert(
            result === null,
            'Should handle duplicate email signup attempt'
        );
    } catch (error) {
        assert(true, 'Duplicate email was correctly rejected');
    }

    // Print test summary
    console.log('\nTest Summary:');
    console.log(`Passed: ${testsPassed}/${totalTests} tests`);
    console.log(`Success rate: ${(testsPassed/totalTests * 100).toFixed(2)}%`);
}

// Run the tests
runTests()
    .then(() => console.log('\nAll tests completed.'))
    .catch(error => console.error('Test execution failed:', error));