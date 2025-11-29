import { getDocs, collection } from "firebase/firestore";
import { db } from '../../lib/firebase.js';

/**
 * Checks if a user with the given email or username exists in Firestore (case-insensitive).
 * Returns: { exists: true/false }
 */

async function confirmUser(inputEmailOrUsername) {
    try {
        // Convert input to lowercase for case-insensitive comparison and trim whitespace
        const inputLower = inputEmailOrUsername.trim().toLowerCase();

        // Fetch all users
        const allUsersSnapshot = await getDocs(collection(db, "User"));
        let foundUser = null;
        let foundBy = null;
        // First, try to find by email
        allUsersSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.Email && data.Email.toLowerCase() === inputLower) {
                foundUser = { id: doc.id, ...data };
                foundBy = "email";
            }
        });
        // If not found by email, try by username
        if (!foundUser) {
            allUsersSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.Username && data.Username.toLowerCase() === inputLower) {
                    foundUser = { id: doc.id, ...data };
                    foundBy = "username";
                }
            });
        }
        console.log("Input value:", inputEmailOrUsername);
        console.log("Found user:", foundUser);
        console.log("Found by:", foundBy);
        return { exists: !!foundUser, user: foundUser, foundBy };
    } catch (error) {
        console.error("Error in confirmUser:", error);
        throw error;
    }
}

export { confirmUser };
