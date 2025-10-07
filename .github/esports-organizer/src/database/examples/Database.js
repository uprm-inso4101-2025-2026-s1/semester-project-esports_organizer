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
class Database {
    app;
    firestore;
    teams = [];     // Array of team objects in the database.
    users = [];     // Array of user objects in the database.
    events = [];    // Array of event objects in the database.
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
        await db.buildTeamList();
        await db.buildEventList();
        await db.buildUserList();
        return db;
    }
    /* Functions related to Teams and their management */

    /* 
    Finds and returns the index of a team object in the database given a teamID, returns -1 otherwise. 
    Should not be used to alter the team at the output index.
    */
    findTeamByID(teamID) {
        for (let i = 0; i < this.teams.length; i++) {
            if (this.teams[i].name === teamID) {
                return i;
            }
        }

        return -1;
    }

    /* Checks if a given team is in the database. */
    isTeamInDataBase(team) {
        for (const t of this.teams) {
            if (t.name === team.name) {
                return true;
            }
        }

        return false;
    }

    /* Given a Team object, adds a key value pair array to the database. Team names must be unique. */
    async addTeamToDatabase(team) {
        if (!this.isTeamInDataBase(team)) {
            await setDoc(doc(this.firestore, "Teams", team.name), team.toFireStore());
            this.teams.push(team);
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
        let filteredTeams = [];
        for (const t of this.teams) {
            if (t.organizer === organizerID) {
                filteredTeams.push(t);
            }
        }

        return filteredEvents;        
    }

    /* Returns teams by user participation from a given user id. */
    filterTeamsByMember(memberID) {
        let filteredTeams = [];
        for (const t of this.teams) {
            if (t.findMembertByID(memberID) !== -1) {
                filteredTeams.push(t);
            }
        }

        return filteredEvents;        
    }

    /* Adds a given member to the a given team if it is contained in the database. */
    async addMembertToTeam(team, member) {
        if (this.isTeamInDataBase(team)) {
            this.teams[this.findTeamByID(team.name)].addMember(member);
            const teamReference = doc(this.firestore, "Teams", team.name);
            await setDoc(teamReference, team.toFireStore());
        } else {
            console.log("Team is not in database.");
        }
    }

    /* 
    Removes a member from a team and updates the team in the database. 
    Team is given as a Team object and member is currently taken as a string. 
    */
    async removeMemberFromTeam(team, member) {
        if (this.isTeamInDataBase(team)) {
            this.teams[this.findTeamByID(team.name)].removeMember(member);
            const teamReference = doc(this.firestore, "Teams", team.name);
            await setDoc(teamReference, team.toFireStore());
        } else {
            console.log("Team is not in database.");
        }
    }

    /* Updates a team rank by a given score if the team is found in the database. */
    async updateTeamRank(team, score) {
        if (this.isTeamInDataBase(team)) {
            this.teams[this.findTeamByID(team.name)].increaseRank(score);
            const teamReference = doc(this.firestore, "Teams", team.name);
            await setDoc(teamReference, team.toFireStore());
        } else {
            console.log("Team is not in database.");
        }
    }

    /* Retrieves teams from Firestore. Not needed to have the team list; simply database.teams will sufice. */
    async getAllTeamsFromDatabase() {
        const teamCollection = collection(this.firestore, "Teams");
        const teamsSnapshot = await getDocs(teamCollection);
        const teamList = teamsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return teamList;
    }

    /* Only used to initially build the teams list from teams already in database. Should not be used otherwise. */
    async buildTeamList() {
        let teamsFromDatabase = await this.getAllTeamsFromDatabase();
        for (const t of teamsFromDatabase) {
            this.teams.push(Team.fromFirestore(t));
        }
    }

    /* Deletes a Team given its ID/Name. Proper cleanup should be in place in order to avoid users accessing null Team values. */
    async deleteTeam(teamID) {
        try {
            let teamIndex = this.findTeamByID(teamID);
            if (teamIndex !== -1) {
                const teamReference = doc(this.firestore, "Teams", teamID);
                await deleteDoc(teamReference);
                console.log(`Team ${teamID} deleted successfully.`);
                this.teams.splice(teamIndex, 1);
            } else {
                console.log("Team does not exist.");
            }
        } catch (error) {
            console.error("Error deleting Team: ", error);
        }
    }

    /* Functions related to Events and their management */

    /* 
    Finds and returns the index of an event object in the database given an eventID, returns -1 otherwise. 
    Should not be used to alter the event at the output index.
    */
    findEventByID(eventID) {
        for (let i = 0; i < this.events.length; i++) {
            if (this.events[i].name === eventID) {
                return i;
            }
        }

        return -1;
    }

    /* Checks if a given team is in the database. */
    isEventInDataBase(event) {
        for (const e of this.events) {
            if (e.name === event.name) {
                return true;
            }
        }

        return false;
    }

    /* Given an Event object, adds a key value pair array to the database. Event names must be unique. */
    async addEventToDatabase(event) {
        if (!this.isEventInDataBase(event)) {
            await setDoc(doc(this.firestore, "Events", event.name), event.toFirestore());
            this.events.push(event);
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
        let filteredEvents = [];
        for (const e of this.events) {
            if (e.organizer === organizerID) {
                filteredEvents.push(e);
            }
        }

        return filteredEvents;
    }

    /* Returns events by user participation from a given user id. */
    filterEventsFromParticipant(participantID) {
        let filteredEvents = [];
        for (const e of this.events) {
            if (e.findParticipantByID(participantID) !== -1) {
                filteredEvents.push(e);
            }
        }

        return filteredEvents;
    }

    /* Adds a given participant to the a given event if it is contained in the database. */
    async addParticipantToEvent(event, participant) {
        if (this.isEventInDataBase(event)) {
            this.events[this.findEventByID(event.name)].addParticipant(participant);
            const eventReference = doc(this.firestore, "Events", event.name);
            await setDoc(eventReference, event.toFireStore());
        } else {
            console.log("Event is not in database.");
        }
    }

    /* 
    Removes a participant from an event and updates the event in the database. 
    Event is given as an Event object and participant is currently taken as a string. 
    */    
    async removeParticipantFromEvent(event, participant) {
        if (this.isEventInDataBase(event)) {
            this.events[this.findEventByID(event.name)].removeParticipant(participant);
            const eventReference = doc(this.firestore, "Events", event.name);
            await setDoc(eventReference, event.toFireStore());
        } else {
            console.log("Event is not in database.");
        }
    }

    /* Given an event, if founf in the database, adjusts its start date and end date. */
    async setEventDate(event, startDate, endDate) {
        if (this.isEventInDataBase(event)) {
            this.events[this.findEventByID(event.name)].setDate(startDate, endDate);
            const eventReference = doc(this.firestore, "Events", event.name);
            await setDoc(eventReference, event.toFireStore());
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

    /* Only used to initially build the events list from events already in the database. Should not be used otherwise. */
    async buildEventList() {
        let eventsFromDatabase = await this.getAllEventsFromDatabase();
        for (const e of eventsFromDatabase) {
            this.events.push(Event.fromFirestore(e));
        }
    }

    /* Deletes an Event given its ID/Name. Proper cleanup should be in place in order to avoid users accessing null Event values. */
    async deleteEvent(eventID) {
        try {
            let eventIndex = this.findEventByID(eventID);
            if (eventIndex !== -1) {
                const eventReference = doc(this.firestore, "Events", eventID);
                await deleteDoc(eventReference);
                console.log("Event ${eventID} deleted successfully.");
                this.events.splice(eventIndex, 1);
            } else {
                console.log("Event does not exist.");
            }
        } catch (error) {
            console.error("Error deleting Event: ", error);
        }
    }
    /* Functions related to Users and their management */

    /* 
    Finds and returns the index of a user object in the database given a userID, returns -1 otherwise. 
    Should not be used to alter the user at the output index.
    */
    findUserByID(userID) {
        for (let i = 0; i < this.users.length; i++) {
            if (this.users[i].uID === userID) {
                return i;
            }
        }

        return -1;
    }

    /* Checks if a given user is in the database. */
    isUserInDataBase(user) {
        for (const u of this.users) {
            if (u.uID === user.uID) {
                return true;
            }
        }

        return false;
    }

    /* Given an Event object, adds a key value pair array to the database. Event names must be unique. */
    async addUserToDatabase(user) {
        if (!this.isEventInDataBase(user)) {
            await setDoc(doc(this.firestore, "Users", user.uID), user.toFirestore());
            this.users.push(user);
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

    async buildUserList() {
        let usersFromDatabase = await this.getAllUsersFromDatabase();
        for (const u of usersFromDatabase) {
            this.users.push(User.fromFirestore(u));
        }
    }

    /* Deletes a User given its ID. Proper cleanup should be in place in order to avoid users accessing null User values. */
    async deleteUser(uID) {
        try {
            let userIndex = this.findUserByID(uID);
            if (userIndex !== -1) {
                const userRef = doc(this.firestore, "Users", uID);
                await deleteDoc(userRef);
                console.log("User ${uID} deleted successfully.");
                this.users.splice(userIndex, 1);
            } else {
                console.log("User does not exist.");
            }
        } catch (error) {
            console.error("Error deleting user: ", error);
        }
    }
    
    async signUpUser(email, password) {
        try {
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
            const uid = userCredential.user.uid;
            const newUser = new User(uid, email, userCredential.user.displayName);
            await this.addUserToDatabase(newUser);
            return newUser;
        } catch (error) {
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
