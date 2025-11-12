import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase"; // Adjust path if needed

export async function loginUser(emailOrUsername, password) {
  const input = emailOrUsername.trim().toLowerCase();
  // Try email (lowercase)
  let userSnapshot = await getDocs(
    query(collection(db, "User"), where("Email", "==", input))
  );

  // Try Username (case-insensitive)
  if (userSnapshot.empty) {
    userSnapshot = await getDocs(
      query(collection(db, "User"), where("Username", "==", input))
    );
    // If still not found, try to find by lowercasing all usernames in the collection
    if (userSnapshot.empty) {
      const allUsers = await getDocs(collection(db, "User"));
      const match = allUsers.docs.find(
        (doc) => doc.data().Username && doc.data().Username.toLowerCase() === input
      );
      if (match) {
        userSnapshot = { docs: [match] };
      }
    }
  }

  if (userSnapshot.empty || userSnapshot.docs.length === 0) {
    return { success: false, error: "No account found with that E-mail or Username." };
  }

  const userData = userSnapshot.docs[0].data();
  if (userData.Password !== password) {
    return { success: false, error: "Incorrect password." };
  }

  return { success: true, user: userData };
}