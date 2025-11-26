import { doc, getDoc, collection, query, where, getDocs, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

async function isAdmin(adminUid) {
    // Check if the user performing the action is an admin
    const adminRef = doc(db, "User", adminUid);
    const adminSnap = await getDoc(adminRef);

    if (!adminSnap.exists() || adminSnap.data().role.type !== "Admin") {
        return { success: false, error: "Permission denied." };
    }

    // Logic to send notification (to be implemented)
    console.log("User is admin");

    return { success: true };
}

// Admin Role Permissions
async function banUser(inputIdentifier, adminUid, reason) {
    // Check if the user performing the ban is an admin
    const adminRef = doc(db, "User", adminUid);
    const adminSnap = await getDoc(adminRef);

    if (!adminSnap.exists() || adminSnap.data().role.type !== "Admin") {
        return { success: false, error: "Permission denied. Only admins can ban users." };
    }

    // inputIdentifier can be email or username (case-sensitive)
    const usersRef = collection(db, "User");
    const identifier = inputIdentifier.trim();

    // Search by email (case-sensitive)
    let q = query(usersRef, where("Email", "==", identifier));
    let querySnapshot = await getDocs(q);

    // If not found by email, search by username (case-sensitive)
    if (querySnapshot.empty) {
        q = query(usersRef, where("Username", "==", identifier));
        querySnapshot = await getDocs(q);
    }

    if (querySnapshot.empty) {
        return { success: false, error: "User not found." };
    }

    // Ban only the first matching user
    const docSnap = querySnapshot.docs[0];
    await updateDoc(docSnap.ref, { Banned: true });

    // Add to BannedUsers collection
    const bannedUserRef = doc(db, "BannedUsers", docSnap.id);
    await setDoc(bannedUserRef, {
        userId: docSnap.id,
        Email: docSnap.data().Email,
        Username: docSnap.data().Username,
        bannedAt: new Date().toISOString(),
        reason: reason || "No reason provided",
    });

    return { success: true };
}


export { banUser, isAdmin };