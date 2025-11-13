import { getDocs, updateDoc, collection, query, where } from "firebase/firestore";
import { db } from '../../lib/firebase.js';

async function resetPassword(emailOrUsername, newPassword) {
    try {
        const input = emailOrUsername.trim().toLowerCase();

        // Try to find by email (case-insensitive)
        const emailQuery = query(collection(db, "User"), where("Email", "==", input));
        let querySnapshot = await getDocs(emailQuery);

        // If not found by email, try by username (case-insensitive)
        if (querySnapshot.empty) {
            const allUsers = await getDocs(collection(db, "User"));
            const match = allUsers.docs.find(
                doc => doc.data().Username && doc.data().Username.trim().toLowerCase() === input
            );
            if (match) {
                querySnapshot = { docs: [match] };
            }
        }

        if (querySnapshot.empty || querySnapshot.docs.length === 0) {
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
