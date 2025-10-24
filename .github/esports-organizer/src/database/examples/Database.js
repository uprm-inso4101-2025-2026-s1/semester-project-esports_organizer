/* Class Imports */
import Team from "./Teams.js";
import Event from "./Events.js";
import User from "./UsersColection.js";
import { app, db } from "./firebase.js";

/* For storage management */
import {
    doc,
    setDoc,
    getDoc,
    collection,
    getDocs,
    deleteDoc
} from "firebase/firestore";

/* Authentication imports */
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "firebase/auth";

/* Cloud database configuration. */
// const firebaseConfig = {
//     apiKey: "AIzaSyD5pc3hP6U0UiaNTFJSgth8AfPKbX5IFwA",
//     authDomain: "test-4c574.firebaseapp.com",
//     projectId: "test-4c574",
//     storageBucket: "test-4c574.firebasestorage.app",
//     messagingSenderId: "249358592983",
//     appId: "1:249358592983:web:f1c18cf81afebf0c1f3992",
//     measurementId: "G-QPCTG80HT4"
// };

/*
!IMPORTANT/IMPORTANT/IMPORTANT/IMPORTANT/IMPORTANT/IMPORTANT/IMPORTANT/IMPORTANT/IMPORTANT/IMPORTANT/IMPORTANT
'await' keyword MUST be used before ANY function call that alters or retrieves data from the database. Keep in mind
that the 'await' keyword can only be used inside async functions.
*/
export class Database {
    app;
    firestore;
    auth;           // Authentication object.
    user = null;    // Currently logged in user.

    constructor() {
        /* App and database initialization*/
        // this.app = initializeApp(firebaseConfig);
        // this.firestore = getFirestore(this.app);

        this.app = app;
        this.firestore = db;

        // This allows us to interact will all of the authentication methods
        this.auth = getAuth(this.app);

        //keeps track of the current user logged in, and checks if its signed in or out, \
        // the logic for this function is implemented at the bottom 
        this.listenToAuthChanges();
    }

    /* Use this function instead of the constructor to create a database object, this one retrieves data previously stored in the database */
    static async createDatabase() {
        const db = new Database();
        // No need to build local lists. All queries go to Firestore.
        return db;
    }
    /* Functions related to Teams and their management */

    /* Checks if a given team is in the database. */
    isTeamInDataBase(team) {
        // Checks Firestore for existence of team by name
        return this.getTeamFromFirestore(team.name).then(result => !!result);
    }

    /* Given a Team object, adds a key value pair array to the database. Team names must be unique. */
    async addTeamToDatabase(team) {
        const existing = await this.getTeamFromFirestore(team.name);
        if (!existing) {
            await setDoc(doc(this.firestore, "Teams", team.name), team.toFireStore());
        } else {
            console.log("Team name already exists.");
        }
    }

    /* 
    Given a Team name, searches for the Team and returns it if found and returns null if not. 
    NOTE: Team names must be unique in order for this function to work properly.
    */
    async getTeamFromFirestore(teamID) {
        const snap = await getDoc(doc(this.firestore, "Teams", teamID));

        if (snap.exists()) {
            const loadedTeam = Team.fromFirestore(snap.data());
            return loadedTeam;
        }

        return null;
    }

    /* Returns teams created by a given user from their id. */
    filterTeamsByOrganizer(organizerID) {
        // Refactored to fetch from Firestore
        return this.getAllTeamsFromDatabase().then(teams => teams.filter(t => t.organizer === organizerID));
    }

    /* Returns teams by user participation from a given user id. */
    filterTeamsByMember(memberID) {
        // Refactored to fetch from Firestore
        return this.getAllTeamsFromDatabase().then(teams => teams.filter(t => t.members && t.members.includes(memberID)));
    }

    /* Adds a given member to the a given team if it is contained in the database. */
    async addMembertToTeam(team, member) {
        const existing = await this.getTeamFromFirestore(team.name);
        if (existing) {
            existing.addMember(member);
            const teamReference = doc(this.firestore, "Teams", team.name);
            await setDoc(teamReference, existing.toFireStore());
        } else {
            console.log("Team is not in database.");
        }
    }

    /* 
    Removes a member from a team and updates the team in the database. 
    Team is given as a Team object and member is currently taken as a string. 
    */
    async removeMemberFromTeam(team, member) {
        const existing = await this.getTeamFromFirestore(team.name);
        if (existing) {
            existing.removeMember(member);
            const teamReference = doc(this.firestore, "Teams", team.name);
            await setDoc(teamReference, existing.toFireStore());
        } else {
            console.log("Team is not in database.");
        }
    }

    /* Updates a team rank by a given score if the team is found in the database. */
    async updateTeamRank(team, score) {
        const existing = await this.getTeamFromFirestore(team.name);
        if (existing) {
            existing.increaseRank(score);
            const teamReference = doc(this.firestore, "Teams", team.name);
            await setDoc(teamReference, existing.toFireStore());
        } else {
            console.log("Team is not in database.");
        }
    }

    /* Retrieves teams from Firestore. Not needed to have the team list; simply database.teams will sufice. */
    async getAllTeamsFromDatabase() {
        const teamCollection = collection(this.firestore, "Teams");
        const teamsSnapshot = await getDocs(teamCollection);
        const teamList = teamsSnapshot.docs.map(Team.fromFirestore);
        return teamList;
    }

    /* Deletes a Team given its ID/Name. Proper cleanup should be in place in order to avoid users accessing null Team values. */
    async deleteTeam(teamID) {
        try {
            const teamReference = doc(this.firestore, "Teams", teamID);
            await deleteDoc(teamReference);
            console.log(`Team ${teamID} deleted successfully.`);
        } catch (error) {
            console.error("Error deleting Team: ", error);
        }
    }

    /* Functions related to Events and their management */

    /* Checks if a given team is in the database. */
    isEventInDataBase(event) {
        // Checks Firestore for existence of event by name
        return this.getEventFromFirestore(event.name).then(result => !!result);
    }

    /* Given an Event object, adds a key value pair array to the database. Event names must be unique. */
    async addEventToDatabase(event) {
        const existing = await this.getEventFromFirestore(event.name);
        if (!existing) {
            await setDoc(doc(this.firestore, "Events", event.name), event.toFirestore());
        } else {
            console.log("Event name already exists.");
        }
    }

    /*
    Given an Event title/name, searches for the Event and returns it if it was found and returns null if not. 
    NOTE: Event titles/names must be unique in order for this function to work properly.
    */
    async getEventFromFirestore(eventID) {
        const snap = await getDoc(doc(database, "Events", eventID));

        if (snap.exists()) {
            const loadedEvent = Event.fromFirestore(snap.data());
            return loadedEvent;
        }

        return null;
    }

    /* Returns events created by a given user from their id. */
    filterEventsFromOrganizer(organizerID) {
        // Refactored to fetch from Firestore
        return this.getAllEventsFromDatabase().then(events => events.filter(e => e.organizer === organizerID));
    }

    /* Returns events by user participation from a given user id. */
    filterEventsFromParticipant(participantID) {
        // Refactored to fetch from Firestore
        return this.getAllEventsFromDatabase().then(events => events.filter(e => e.participants && e.participants.includes(participantID)));
    }

    /* Adds a given participant to the a given event if it is contained in the database. */
    async addParticipantToEvent(event, participant) {
        const existing = await this.getEventFromFirestore(event.name);
        if (existing) {
            existing.addParticipant(participant);
            const eventReference = doc(this.firestore, "Events", event.name);
            await setDoc(eventReference, existing.toFireStore());
        } else {
            console.log("Event is not in database.");
        }
    }

    /* 
    Removes a participant from an event and updates the event in the database. 
    Event is given as an Event object and participant is currently taken as a string. 
    */    
    async removeParticipantFromEvent(event, participant) {
        const existing = await this.getEventFromFirestore(event.name);
        if (existing) {
            existing.removeParticipant(participant);
            const eventReference = doc(this.firestore, "Events", event.name);
            await setDoc(eventReference, existing.toFireStore());
        } else {
            console.log("Event is not in database.");
        }
    }

    /* Given an event, if founf in the database, adjusts its start date and end date. */
    async setEventDate(event, startDate, endDate) {
        const existing = await this.getEventFromFirestore(event.name);
        if (existing) {
            existing.setDate(startDate, endDate);
            const eventReference = doc(this.firestore, "Events", event.name);
            await setDoc(eventReference, existing.toFireStore());
        } else {
            console.log("Event is not in database.");
        }
    }

    /* Retrieves events from Firestore. Not needed to have the team list; simply database.teams will sufice. */
    async getAllEventsFromDatabase() {
        const eventCollection = collection(this.firestore, "Events");
        const eventsSnapshot = await getDocs(eventCollection);
        const eventList = eventsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return eventList;
    }

    /* Deletes an Event given its ID/Name. Proper cleanup should be in place in order to avoid users accessing null Event values. */
    async deleteEvent(eventID) {
        try {
            const eventReference = doc(this.firestore, "Events", eventID);
            await deleteDoc(eventReference);
            console.log(`Event ${eventID} deleted successfully.`);
        } catch (error) {
            console.error("Error deleting Event: ", error);
        }
    }
    /* Functions related to Users and their management */

    /* Checks if a given user is in the database. */
    isUserInDataBase(user) {
        // Checks Firestore for existence of user by uID
        return this.getUserFromFireStore(user.uID).then(result => !!result);
    }

    /* Given an Event object, adds a key value pair array to the database. Event names must be unique. */
    async addUserToDatabase(user) {
        const existing = await this.getUserFromFireStore(user.uID);
        if (!existing) {
            await setDoc(doc(this.firestore, "Users", user.uID), user.toFirestore());
        } else {
            console.log("User already exists.");
        }
    }

    /* Given a User ID, searches for the user and returns it if it was found and returns null if not. */
    async getUserFromFireStore(uID) {
        const snap = await getDoc(doc(this.firestore, "Users", uID));
        if(snap.exists()){
            return User.fromFirestore(snap.data());
        }
        return null;
    }

    /* Retrieves users from Firestore. Not needed to have the user list; simply database.users will sufice. */
    async getAllUsersFromDatabase() {
        const userCollection = collection(this.firestore, "Users");
        const userSnapshot = await getDocs(userCollection);
        return userSnapshot.docs.map(doc => User.fromFirestore(doc.data()));
    }

    /* Stores the profile inside the user's main document.*/
    async updateUserProfile(userID,profileData) {
        const userRef = doc(this.firestore, "Users", userID);
        await setDoc(userRef, {profile: profileData}, {merge: true});
        console.log("Profile updated!");
    }

    async getUserProfile(userID) {
        const userRef = doc(this.firestore, "Users", userID);
        const userSnap =  await getDoc(userRef);
        if(userSnap.exists()){
            const userData = userSnap.data();
            return userData.profile;
        }  else {
            return null;
        }
    }

    /* Changes the user's Role */
    async updateUserRole(userID, newRole) {
        const userRef = doc(this.firestore, "Users", userID);
        await setDoc(userRef, { role: newRole }, { merge: true });
        console.log(`Role for user ${userID} updated to ${newRole}`);
    }

    /* Deletes a User given its ID. Proper cleanup should be in place in order to avoid users accessing null User values. */
    async deleteUser(uID) {
        try {
            const userRef = doc(this.firestore, "Users", uID);
            await deleteDoc(userRef);
            console.log(`User ${uID} deleted successfully.`);
        } catch (error) {
            console.error("Error deleting user: ", error);
        }
    }
    
    async signUpUser(email, password, username) {
        let userCredential;
        try {
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
            const uid = userCredential.user.uid;
            // Set display name
            await userCredential.user.updateProfile({ displayName: username });
            const newUser = new User(uid, email, userCredential.user.displayName);
            await this.addUserToDatabase(newUser);

            const defaultProfile = {
                theme: "light",
                notifications: true,
                bio: "",
                createdAt: new Date(),
                avatarURL: null,
                role: "",
            };
            await this.updateUserProfile(uid, defaultProfile);
            console.log("User signed up and profile created successfully.");
            return newUser;
        } catch (error) {
            console.error("Error signing up user: ", error);
            if (userCredential?.user) {
                try {   
                    await userCredential.user.delete();
                } catch (deleteError) {
                    console.error("Error deleting user after failed signup: ", deleteError);
                }
            }
            return null;
        }
    }

    async logInUser(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
            const uid = userCredential.user.uid;
            const user = await this.getUserFromFireStore(uid);

            await this.updateUserProfile(uid, { lastLogin: new Date() });
            return user;
        } catch(error){
            console.error("Error logging in user: ", error);
            return null;
        }
    }

    async logOutUser() {
        try {
            this.user = null;
            await this.auth.signOut();
            console.log("User signed out successfully.");
        } catch (error) {
            console.error("Error signing out user: ", error);
        }
    }

    /* We can use this to implement logic that triggers when the user signs in or out */
    async listenToAuthChanges() {
        onAuthStateChanged(this.auth, (user) => {
            if (user) {
                // User is signed in
                console.log("User signed in: ", user.uid);
            } else {
                // User is signed out
                console.log("User signed out");
            }
        });
    }
}
