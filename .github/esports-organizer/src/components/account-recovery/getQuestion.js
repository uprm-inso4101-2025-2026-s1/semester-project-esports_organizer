import { getDocs, collection } from "firebase/firestore";
import { db } from '../../lib/firebase.js';

/**
 * Returns the security question associated with the given email or username (case-insensitive).
 * Only returns the question for the first matching user.
 * Returns: { found: true/false, question }
 */
async function getQuestion(inputEmailOrUsername) {
    try {
        const normalizedInput = inputEmailOrUsername.trim().toLowerCase();
        const allUsersSnapshot = await getDocs(collection(db, "User"));

        let found = false;
        let question = null;
        // First, try to find by email
        for (const doc of allUsersSnapshot.docs) {
            const data = doc.data();
            if (data.Email && data.Email.toLowerCase() === normalizedInput) {
                found = true;
                question = data.Question || null;
                break;
            }
        }
        // If not found by email, try by username
        if (!found) {
            for (const doc of allUsersSnapshot.docs) {
                const data = doc.data();
                if (data.Username && data.Username.toLowerCase() === normalizedInput) {
                    found = true;
                    question = data.Question || null;
                    break;
                }
            }
        }
        return { found, question };
    } catch (error) {
        console.error("Error in getQuestion:", error);
        throw error;
    }
}

export { getQuestion };