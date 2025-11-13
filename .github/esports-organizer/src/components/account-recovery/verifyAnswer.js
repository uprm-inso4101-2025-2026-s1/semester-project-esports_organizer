import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from '../../lib/firebase.js';

/**
 * Verifies the answer to the security question for a given email or username field.
 * Returns: { answerCorrect: true/false }
 */

async function verifyAnswer(inputEmailOrUsername, userAnswer) {
    try {
        console.log("Verifying answer for email/username:", inputEmailOrUsername, "with answer:", userAnswer);

        // Try to find by email (case-insensitive)
        const emailQ = query(collection(db, "User"), where("Email", "==", inputEmailOrUsername.trim().toLowerCase()));
        let querySnapshot = await getDocs(emailQ);

        // If not found by email, try by username (case-insensitive)
        if (querySnapshot.empty) {
            const allUsers = await getDocs(collection(db, "User"));
            const match = allUsers.docs.find(
                doc => doc.data().Username && doc.data().Username.trim().toLowerCase() === inputEmailOrUsername.trim().toLowerCase()
            );
            if (match) {
                querySnapshot = { docs: [match] };
            }
        }

        if (querySnapshot.empty || querySnapshot.docs.length === 0) {
            console.log("No user found for email/username:", inputEmailOrUsername);
            return { answerCorrect: false };
        }

        // Only one user per email/username
        const userData = querySnapshot.docs[0].data();
        console.log("Security question from Firestore:", userData.Question);
        console.log("Correct answer from Firestore:", userData.Answer);
        console.log("User provided answer:", userAnswer);

        const answerCorrect =
            userData.Answer &&
            userAnswer &&
            userData.Answer.trim().toLowerCase() === userAnswer.trim().toLowerCase();

        console.log("Answer correct:", answerCorrect);

        return { answerCorrect };
    } catch (error) {
        console.error("Error in verifyAnswer:", error);
        throw error;
    }
}

export { verifyAnswer };
