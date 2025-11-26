import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

//Makes it so we could add or update a user's permissions dynamically through
// the application without needing to go to Firestore
export async function addPermissionToRole(uid, permission, value) {
  if (!uid || !permission) return console.log("UID and permission required");

  const ref = doc(db, "User", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    // create new user if it doesn't exist
    await setDoc(ref, {
      role: { type: "Player", permissions: { [permission]: value } },
    },
    { merge: true });
    console.log(`🆕 Created user ${uid} with permission ${permission}: ${value}`);
  } else {
    // update existing user
    await updateDoc(ref, {
      [`role.permissions.${permission}`]: value,
    });
    console.log(`✅ Updated ${permission} to ${value} for ${uid}`);
  }
}
