import { getDocs, updateDoc, collection, query, where } from "firebase/firestore";
import { db } from '../../lib/firebase.js';

async function resetPassword(emailOrUsername, newPassword) {
    try {
        const emailQuery = query(collection(db, "User"), where("Email", "==", emailOrUsername.toLowerCase()));
        let querySnapshot = await getDocs(emailQuery);

        // If not found by email, try by username
        if (querySnapshot.empty) {
            const usernameQuery = query(collection(db, "User"), where("Username", "==", emailOrUsername.toLowerCase()));
            querySnapshot = await getDocs(usernameQuery);
        }

        if (querySnapshot.empty) {
            console.log("No user found for email/username:", emailOrUsername);
            return { success: false, message: "User not found." };
        }

        const userDoc = querySnapshot.docs[0];
        await updateDoc(userDoc.ref, {
            Password: newPassword
        });

        console.log("Password reset successful for user:", emailOrUsername);
        return { success: true, message: "Password reset successful." };
    } catch (error) {
        console.error("Error in resetPassword:", error);
        return { success: false, message: "Error resetting password." };
    }
}

export { resetPassword };
