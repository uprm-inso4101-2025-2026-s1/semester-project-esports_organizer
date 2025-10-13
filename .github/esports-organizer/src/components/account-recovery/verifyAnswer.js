import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from '../../lib/firebase.js';

/**
 * Verifies the answer to the security question for a given email field.
 * Returns: { answerCorrect: true/false }
 */

// Console.log is for debugging purposes and it will be reflected in the browser console.

async function verifyAnswer(inputEmail, userAnswer) {
    try {
        console.log("Verifying answer for email:", inputEmail, "with answer:", userAnswer);
        const q = query(collection(db, "Users"), where("Email", "==", inputEmail));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            // console.log("No user found for email:", inputEmail);
            return { answerCorrect: false };
        }

        // Only one user per email
        const userData = querySnapshot.docs[0].data();
        // console.log("Security question from Firestore:", userData.Question);
        // console.log("Correct answer from Firestore:", userData.Answer);
        // console.log("User provided answer:", userAnswer);

        const answerCorrect =
          userData.Answer &&
          userAnswer &&
          userData.Answer.trim().toLowerCase() === userAnswer.trim().toLowerCase();

        // console.log("Answer correct:", answerCorrect);

        return { answerCorrect };
    } catch (error) {
        console.error("Error in verifyAnswer:", error);
        throw error;
    }
}

export { verifyAnswer };
