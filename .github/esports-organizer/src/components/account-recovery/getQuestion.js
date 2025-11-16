import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from '../../lib/firebase.js';

/**
 * Returns the security question associated with the given email.
 * Returns: { found: true/false, question }
 */
async function getQuestion(inputEmail) {
    try {
        const normalizedEmail = inputEmail.trim().toLowerCase();
        const q = query(collection(db, "Users"), where("Email", "==", normalizedEmail));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            // console.log("No user found for email:", normalizedEmail);
            return { found: false, question: null };
        }

        const userData = querySnapshot.docs[0].data();
        const question = userData.Question || null;
        // console.log("Security question for", normalizedEmail, ":", question);

        return { found: true, question };
    } catch (error) {
        console.error("Error in getQuestion:", error);
        throw error;
    }
}

export { getQuestion };