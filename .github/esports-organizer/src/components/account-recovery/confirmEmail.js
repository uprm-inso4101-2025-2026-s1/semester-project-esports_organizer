import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from '../../lib/firebase.js';

/**
 * Checks if a user with the given email exists in Firestore.
 * Returns: { exists: true/false }
 */

// Console.log is for debugging purposes and it will be reflected in the browser console.
async function confirmEmail(inputEmail) {
    try {
        // console.log("Checking existence for email:", inputEmail);
        const q = query(collection(db, "Users"), where("Email", "==", inputEmail));
        const querySnapshot = await getDocs(q);

        const exists = !querySnapshot.empty;
        // console.log("User exists:", exists);

        return { exists };
    } catch (error) {
        console.error("Error in confirmEmail:", error);
        throw error;
    }
}

export { confirmEmail };
