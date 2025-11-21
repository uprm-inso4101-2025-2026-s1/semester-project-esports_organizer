import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../lib/firebase"; // Adjust path if needed
import { signInWithEmailAndPassword } from "firebase/auth";

export async function loginUser(emailOrUsername, password) {
  const input = emailOrUsername.trim().toLowerCase();

  try {
    let emailToUse = input;

    // if there is no @ we assume is a username
    if (!input.includes("@")) {
      const usersRef = collection(db, "User");
      const q = query(usersRef, where("Username", "==", input));
      const snap = await getDocs(q);

      if (snap.empty) {
        return {
          success: false,
          error: "No account found with that E-mail or Username.",
        };
      }

      const userData = snap.docs[0].data();
      if (!userData.Email) {
        return {
          success: false,
          error: "No account found with that E-mail or Username.",
        };
      }

      emailToUse = userData.Email.toLowerCase();
    }

    // We use Firebase Auth for login
    const cred = await signInWithEmailAndPassword(auth, emailToUse, password);
    console.log("✅ loginUser: logged in as", cred.user.email);

    // We save uid
    localStorage.setItem("currentUserUid", cred.user.uid);

    
    let userData = { email: cred.user.email, uid: cred.user.uid };
    const userSnap = await getDocs(
      query(collection(db, "User"), where("uid", "==", cred.user.uid))
    );
    if (!userSnap.empty) {
      userData = userSnap.docs[0].data();
    }

    return { success: true, user: userData };
  } catch (error) {
    console.error("⚠ loginUser error:", error);

    let message = "There was a problem logging in. Please try again.";

    if (error.code === "auth/user-not-found") {
      message = "No account found with that E-mail or Username.";
    } else if (error.code === "auth/wrong-password") {
      message = "Incorrect password.";
    } else if (error.code === "auth/invalid-credential") {
      message = "Email or password is incorrect.";
    }

    return {
      success: false,
      error: message,
      rawError: error,
    };
  }
}