import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase"; // Adjust path if needed

export async function makeTeam(init) {
  if (!init.teamName.trim())
    return { success: false, error: "Please input a team name" };
  if (!init.mainGame.trim())
    return { success: false, error: "Please pick a main game (or just pick your favorite!)" };

  const q = query(collection(db, 'Teams'), where('teamName', '==', init.teamName));
  const existing = await getDocs(q);
  if (!existing.empty) {
    return { success: false, error: "This team name is already being used!" };
  }

  await addDoc(collection(db, 'Teams'), init);
}
