import { db } from "../database/firebaseClient.js";
import {
    collection, addDoc, setDoc, doc, getDoc, getDocs,
    updateDoc, deleteDoc, query, orderBy, where, limit as qLimit,
    Timestamp, serverTimestamp
} from "firebase/firestore";

class UserProfile {
    constructor(username, email) {
        this.username = username;
        this.email = email;
        this.createdEvents = []; // stores events the user has created
    }

    addEvent(event) {
        this.createdEvents.push(event);
    }
}

// Represents a community (for testing, will be replaced later)
class Community {
    constructor(name) {
        this.name = name;
        this.events = []; // stores events the community is promoting/participating in
    }

    addEvent(event) {
        this.events.push(event); 
    }
}

// Represents a tournament (for testing, will be replaced later)
class Tournament {
    constructor(title, game) {
        this.title = title;
        this.game = game;
        // It's not necessary to store events in a tournament for now
    }
}

// ================================
// Core Event Class
// ================================

export default class Event {
    constructor({
        title,
        id,
        description,
        dateValue,
        participants,
        game,
        location,
        createdBy, // UserProfile object
        community = null, // Community object
        tournament = null // Tournament object
    }) {
        // Required fields
        this.title = title;
        this.id = id; // optional (if set, we'll upsert with this id)
        this.description = description;
        this.dateValue = dateValue; // JS Date, ms, ISO, or Firestore Timestamp are OK (we normalize)
        this.participants = participants; // number for now
        this.game = game;
        this.location = location || "TBD"; // default to "TBD" if not specified

        // Relations to other features
        this.createdBy = createdBy;
        this.community = community;
        this.tournament = tournament;
    }

// ================================
// Getters
// ================================

    getTitle() { return this.title; }
    getDescription() { return this.description; }
    getDate() { return this.dateValue; }
    getParticipants() { return this.participants; }
    getGame() { return this.game; }
    getLocation() { return this.location; }
    getCreatedBy() { return this.createdBy; }
    getCommunity() { return this.community; }
    getTournament() { return this.tournament; }
    getEventID() { return this.id; }

// ================================
// Setters
// ================================

    setTitle(title) { if (typeof title !== 'string' || title.trim() === '') {
        throw new Error('Name must be a non-empty string');
    }
        this.title = title; }

    setDescription(description) {
        if (typeof description !== 'string') {
            throw new Error('Description must be a string');
        }
        this.description = description;
    }

    setDate(dateVal) {
        const d = (dateVal instanceof Date) ? dateVal : new Date(dateVal);
        if (isNaN(d.getTime())) throw new Error('Date must be a valid date');
        this.dateValue = d;
    }

    setParticipants(participants) {
        if (typeof participants !== 'number' || participants < 1) {
            throw new Error('Participants must be a positive number');
        }
        this.participants = participants;
    }

    setGame(game) {
        if (typeof game !== 'string' || game.trim() === '') {
            throw new Error('Game must be a non-empty string');
        }
        this.game = game;
    }

    setLocation(location) {
        if (typeof location !== 'string' || location.trim() === '') {
            throw new Error('Location must be a non-empty string');
        }
        this.location = location;
    }

    setCreatedBy(userProfile) { this.createdBy = userProfile; }
    setCommunity(community) { this.community = community;}
    setTournament(tournament) { this.tournament = tournament; }
    setEventID(eventId) { this.eventId = eventId; }

// ================================
// Backend/DB Methods (Firestore)
// ================================

    /** CREATE: add to 'events' (auto-id if this.ID is not set). Returns id. */
    async CreateEvent() {
        const col = collection(db, "events");
        const data = toDocData(this, { isCreate: true });

        if (this.id) {
            await setDoc(doc(db, "events", this.id), data, { merge: true });
            return this.id;
        } else {
            const ref = await addDoc(col, data);
            this.id = ref.id;
            return ref.id;
        }
    }

    static async ListEvents(opts = {}) {
        const { status, from, to, max = 50 } = opts;
        const parts = [collection(db, "events")];
        if (status) parts.push(where("status", "==", String(status)));
        if (from) parts.push(where("startAt", ">=", toTs(from)));
        if (to)   parts.push(where("startAt", "<=", toTs(to)));
        parts.push(orderBy("startAt", "desc"));
        parts.push(qLimit(Math.min(max, 200)));

        const snap = await getDocs(query(...parts));
        return snap.docs.map(d => fromDocData(d.id, d.data()));
    }

    /** READ: get one event by ID. Returns plain object or null. */
    async GetEventByID(ID) {
        const theId = ID ?? this.id;
        if (!theId) throw new Error("ID is required");
        const snap = await getDoc(doc(db, "events", theId));
        return snap.exists() ? fromDocData(snap.id, snap.data()) : null;
    }

    /** UPDATE: update fields by ID (uses current object values unless args are provided). */
    async UpdateEvent(ID, title, description, dateValue, participants, game, location, community, tournament) {
        const theId = ID ?? this.id;
        if (!theId) throw new Error("ID is required");
        // if args provided, overwrite the instance first
        if (title !== undefined) this.setTitle(title);
        if (dateValue !== undefined) this.setDate(dateValue);
        if (location !== undefined) this.setLocation(location);
        if (description !== undefined) this.setDescription(description);
        if (participants !== undefined) this.setParticipants(participants);
        if (game !== undefined) this.setGame(game);
        if (community !== undefined) this.setCommunity(community);
        if (tournament !== undefined) this.setTournament(tournament);

        const patch = toDocData(this, { isCreate: false }); // adds updatedAt
        await updateDoc(doc(db, "events", theId), patch);
        return theId;
    }


    /** DELETE: remove by ID. */
    async DeleteEvent(ID)  {
        const theId = ID ?? this.id;
        if (!theId) throw new Error("ID is required");
        await deleteDoc(doc(db, "events", theId));
        return theId;
    }

    // Links the event to a community
    assignCommunity(community) {
        this.community = community;
        community.addEvent(this);
    }

    // Links the event to a tournament
    assignTournament(tournament) {
        this.tournament = tournament;
    }

}

// ================================
// Utility functions
// ================================

/** Convert Date / ms / ISO / Timestamp -> Firestore Timestamp */
function toTs(v) {
    if (!v) return undefined;
    if (v instanceof Timestamp) return v;
    if (v instanceof Date) return Timestamp.fromDate(v);
    if (typeof v === "number") return Timestamp.fromMillis(v);
    if (typeof v === "string") {
        const d = new Date(v);
        if (!isNaN(d.getTime())) return Timestamp.fromDate(d);
    }
    throw new Error("Invalid date value");
}

/** Map class fields -> Firestore document shape (lower camelCase) */
function toDocData(evt, { isCreate = false } = {}) {
    const data = {
        title: evt.title ?? "",
        description: evt.description ?? "",
        dateValue: evt.dateValue,
        participants: evt.participants ?? [],
        game: evt.game ?? "",
        location: evt.location ?? "",
        createdBy: evt.createdBy ?? null,
        community: evt.community ?? null,
        tournament: evt.tournament ?? null,
        startAt: toTs(evt.dateValue) ?? serverTimestamp(),
    };
    if (isCreate) data.createdAt = serverTimestamp();
    // strip undefined
    Object.keys(data).forEach(k => data[k] === undefined && delete data[k]);
    return data;
}

/** Map Firestore document -> plain object (matching class fields) */
    function fromDocData(id, data) {
        return {
            title: data.title ?? "",
            id: id,
            description: data.description ?? "",
            dateValue: data.startAt instanceof Timestamp ? data.startAt.toDate() : data.startAt ?? null,
            participants: data.participants ?? [],
            game: data.game ?? "",
            location: data.location ?? "",
            createdBy: data.createdBy ?? null,
            community: data.community ?? null,
            tournament: data.tournament ?? null,
        };
    }

// ================================
// Use example
// ================================
/**
    async function exampleFunction() {
        console.log("=== EventsClass + Firestore Emulator test ===");
        const evt = new Event({
            title: "Valorant Champions Qualifier 2024",
            description: "Best of 3 Scrim",
            dateValue: Date.now(),
            participants: ["user1", "user2", "user3", "user4", "user5", "user6", "user7", "user8", "user9", "user10"],
            game: "Valorant",
            location: "Online",
            createdBy: "user0",
            community: null,
            tournament: null
        })

        // CREATE
        const id = await evt.CreateEvent();
        console.log("Created id:", id);

        // READ
        console.log("GetEventByID:", await evt.GetEventByID(id));

        // UPDATE
        await evt.UpdateEvent(evt.id, "Valorant Champions Qualifier 2024 - Updated Title");
        console.log("Updated title.");

        // LIST
        const list = await evt.ListEvents({ max: 5 });
        console.log("List top 5:", list);

        // DELETE
        await evt.DeleteEvent(id);
        console.log("Deleted:", id);
        console.log("Finished running database test");
    }
 */