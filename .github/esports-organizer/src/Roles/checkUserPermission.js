import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

//Checks if a user can perform a certain action in the app
//If the user has the permission to do the action, the function returns true. If not, the function returns false

export async function checkUserPermission(uid, action) {
  if (!uid || !action) {
    console.error("❌ UID and action are required");
    return false;
  }

  try {

    // Get the user document from Firestore
    const userRef = doc(db, "User", uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      console.warn("⚠️ User document not found in Firestore");
      return false;
    }

    const userData = snap.data();
    const role = userData.role.type;
    const permissions = userData.role.permissions;

    console.log(`User Role: ${role}`);
    console.log(`Checking permission for: ${action}`);

    // Check if permission exists and is true
    if (permissions[action] === true) {
      console.log(`✅ Permission granted: ${action}`);
      return true;
    } 

    else {
      console.log(`🚫 Permission denied: ${action}`);
      return false;
    }
  } catch (err) {
    console.error("❌ Error checking permissions:", err.message);
    return false;
  }
}
