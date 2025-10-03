// imports the storage management constants
const { doc, setDoc, getDoc, collection, getDocs, deleteDoc} = require("firebase/firestore");
//import database file
const Database = require("Documents/INTRO/dataBase");


class User{
  uid;
  email;
  username;
  createdAt;

  constructor(uid,email,username, createdAt = new Date()){
    this.uid = uid;
    this.email = email;
    this.username = username;
    this.createdAt = createdAt;
  }

  //Takes the user object and pushes it Firestore
  toFirestore(){
    return{
      uid: this.uid,
      email: this.email,
      username: this.username,
      createdAt: this.createdAt
    };
  }

  //Takes the user data from Firestore and turns it into an object
  static fromFirestore(data){
    return new User(data.uid, data.email, data.username, data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt);
  }
}

// Adds a new user to the database
async function addUser(db,user){
  const userRef = doc(db.firestore, "Users", user.uid);

  await setDoc(userRef, user.toFirestore());
  db.users.push(user);
  console.log("User ${user.username} added.");
}

/*
Verifies that the user is in the database and returns it
if the user isn't in the database it returns null
*/
async function getUser(db, uid){
  const user = await getDoc(doc(db.firestore, "Users", uid));
  if(user.exists()){
    return User.fromFirestore(user.data());
  }
  return null;
}

// Returns every user in the database 
async function getAllUsers(db){
  const userCollection = collection(db.firestore, "Users");
  const userSnapshot = await getDocs(userCollection);
  return userSnapshot.docs.map(doc => User.fromFirestore(doc.data()));
}


//Verifies if the user is in the database and deletes it
async function deleteUser(db,uid){
  try{
    const userRef = doc(db.firestore, "Users",uid);
    await deleteDoc(userRef);
    db.users = db.users.filter(u => u.uid !== uid);
    console.log("User ${uid} deleted.");
  }
  catch (error){
    console.error("Error deleting user:",error);
  }
}
module.exports = {User, addUser, getUser, getAllUsers, deleteUser};