import { db } from "../lib/firebase";

import { collection, query, where, getDocs } from "firebase/firestore";

// Checks if a user is banned by username or email
export async function isUserBanned(identifier) {
    if (!identifier) {
        console.error("Identifier (username or email) is required");
        return false;
    }

    const bannedUsersRef = collection(db, "BannedUsers");

    // Search by email field
    let qEmail = query(bannedUsersRef, where("Email", "==", identifier));
    let emailSnapshot = await getDocs(qEmail);
    if (!emailSnapshot.empty) {
        return true;
    }

    // Search by username field
    let qUsername = query(bannedUsersRef, where("Username", "==", identifier));
    let usernameSnapshot = await getDocs(qUsername);
    if (!usernameSnapshot.empty) {
        return true;
    }

    return false;
}