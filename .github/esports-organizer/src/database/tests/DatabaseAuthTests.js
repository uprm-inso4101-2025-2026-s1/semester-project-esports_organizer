import { Database } from '../core/Database.js';

// Framework-free tests for logInUser and logOutUser using dependency injection and in-memory mocks

async function runAuthTests() {
    console.log('Starting logInUser/logOutUser tests...\n');
    let passed = 0;
    let total = 0;

    function assert(condition, message) {
        total++;
        if (condition) {
            console.log('✅', message);
            passed++;
        } else {
            console.log('❌', message);
        }
    }

    // In-memory user store (compatible with DatabaseTests mock)
    const inMemoryUsers = {
        'existing@example.com': {
            uid: 'uid_existing',
            email: 'existing@example.com',
            displayName: 'existing',
            password: 'correcthorsebatterystaple',
            profile: { theme: 'dark' }
        }
    };

    // Mock signInWithEmailAndPassword
    async function mockSignInWithEmailAndPassword(auth, email, password) {
        const record = inMemoryUsers[email];
        if (!record) throw new Error('auth/user-not-found');
        if (record.password !== password) throw new Error('auth/wrong-password');

        const user = {
            uid: record.uid,
            email: record.email,
            displayName: record.displayName,
            _getRecaptchaConfig: () => ({})  // Add this to prevent the recaptcha error
        };

        return { user };
    }

    // Mock auth.signOut
    let signOutCalled = false;
    const mockAuth = {
        signOut: async () => { 
            signOutCalled = true; 
            return Promise.resolve();
        },
        currentUser: null,
        _getRecaptchaConfig: () => ({})  // Add this to prevent the recaptcha error
    };

    // Mock database read: getUserFromFireStore
    async function mockGetUserFromFireStore(uID) {
        for (const k of Object.keys(inMemoryUsers)) {
            if (inMemoryUsers[k].uid === uID) {
                const r = inMemoryUsers[k];
                return { uID: r.uid, email: r.email, displayName: r.displayName, profile: r.profile };
            }
        }
        return null;
    }

    // Create Database instance with injected auth mocks
    const db = new Database({
        app: {},
        firestore: {},
        auth: mockAuth,
        createUserWithEmailAndPassword: async () => { throw new Error('not-implemented'); },
        signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
        onAuthStateChanged: () => {}
    });

    // Override database.getUserFromFireStore to use mock
    db.getUserFromFireStore = mockGetUserFromFireStore;
    db.updateUserProfile = async (userID, profileData) => {
        // attach lastLogin to mock user's profile
        for (const k of Object.keys(inMemoryUsers)) {
            if (inMemoryUsers[k].uid === userID) {
                inMemoryUsers[k].profile = { ...inMemoryUsers[k].profile, ...profileData };
                return;
            }
        }
    };

    // Test 1: successful login
    try {
        const user = await db.logInUser('existing@example.com', 'correcthorsebatterystaple');
        assert(user !== null && user.email === 'existing@example.com', 'logInUser should return user on correct credentials');
        assert(inMemoryUsers['existing@example.com'].profile.lastLogin !== undefined, 'updateUserProfile should be called to set lastLogin');
    } catch (e) {
        assert(false, 'logInUser threw unexpectedly: ' + e.message);
    }

    // Test 2: wrong password
    try {
        const user = await db.logInUser('existing@example.com', 'wrongpassword');
        assert(user === null, 'logInUser should return null for wrong password');
    } catch (e) {
        assert(true, 'logInUser threw for wrong password (acceptable)');
    }

    // Test 3: non-existing user
    try {
        const user = await db.logInUser('noone@example.com', 'whatever');
        assert(user === null, 'logInUser should return null when user does not exist');
    } catch (e) {
        assert(true, 'logInUser threw for non-existing user (acceptable)');
    }

    // Test 4: log out
    try {
        signOutCalled = false;
        await db.logOutUser();
        assert(signOutCalled === true, 'logOutUser should call auth.signOut');
    } catch (e) {
        assert(false, 'logOutUser threw unexpectedly: ' + e.message);
    }

    console.log('\nAuth Test Summary:');
    console.log(`${passed}/${total} passed`);
}

runAuthTests()
    .then(() => console.log('\nAuth tests completed'))
    .catch(err => console.error('Auth tests failed:', err));
