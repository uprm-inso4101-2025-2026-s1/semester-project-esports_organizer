import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

// Assigns a role to a single user at a time
export async function assignUserRole(uid, roleType, permissions = {}) {
  if (!uid || !roleType) {
    throw new Error("UID and roleType are required");
  }

  console.log("Entered"); //Used for debugging purposes
  const userRef = doc(db, "User", uid); 
  const snap = await getDoc(userRef);

  //Checks if the user is in the database
  //If the user is not in the database, they get added
  if (!snap.exists()) {
    await setDoc(userRef, {
      role: {
        type: roleType,
        permissions,
      },
      
    });
    console.log("Wrote"); //Used for debugging purposes
    
  } 

  //If the user is in the database, their role gets updated
  else {
    await updateDoc(userRef, {
      role: {
        type: roleType,
        permissions,
      },
      
    });
    console.log("Updated role to "+roleType)
    console.log(permissions)
    
  }
  console.log("Finished"); //Used for debugging purposes
}
