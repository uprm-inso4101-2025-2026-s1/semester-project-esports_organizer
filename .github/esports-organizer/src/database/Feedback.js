import { db } from "../database/firebaseClient.js";
import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    limit,
    serverTimestamp
  } from "firebase/firestore";

export default class Feedback {
  constructor({ topic, category, comment, email }) {
    this.topic = topic;
    this.category = category;
    this.comment = comment;
    this.email = email || null;
  }


  // CREATE: Save feedback to Firestore

  async SubmitFeedback() {
    try {
      const col = collection(db, "feedback");
      const data = {
        topic: this.topic,
        category: this.category,
        comment: this.comment,
        email: this.email,
        createdAt: serverTimestamp()
      };
      const ref = await addDoc(col, data);
      return ref.id;
    } catch (error) {
      console.error("Error adding feedback:", error);
      throw error;
    }
  }


  // READ: Get list of all feedback entries
  static async ListFeedback(limitCount = 10) {
    const q = query(
      collection(db, "feedback"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
  }
}