import { collection, getDocs } from "firebase/firestore";
import { db } from '../lib/firebase.js';



// All console logs are for debugging purposes to understand the Firestore data and see if we are fetching it correctly. :)
// The debugging would be seen in the browser console.
async function getParticipatedTournaments() {
    const querySnapshot = await getDocs(collection(db, "User"));
    
    console.log("=== FIRESTORE DATA STRUCTURE ===");
    console.log("Total documents:", querySnapshot.size);
    
    querySnapshot.forEach((doc) => {
      console.log("Document ID:", doc.id);
      console.log("Document data:", doc.data());
      console.log("All fields in this document:", Object.keys(doc.data()));
      console.log("---");
    });
    
    const User = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return User;
}

export default getParticipatedTournaments;