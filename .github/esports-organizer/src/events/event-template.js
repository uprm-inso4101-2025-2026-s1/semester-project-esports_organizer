// ================================
// Dummy Classes (placeholders)
// ================================

// Represents a user profile (for testing, will be replaced later)
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

class Event {
    constructor({
        title,
        description,
        dateTime,
        participants,
        game,
        location, 
        createdBy, // UserProfile object
        community = null, // Community object
        tournament = null // Tournament object
    }) {
        // Required fields
        this.title = title;
        this.description = description;
        this.dateTime = dateTime; // could be Date object or string, update this when implementing into main
        this.participants = participants; // number for now
        this.game = game;
        this.location = location || "TBD"; // default to "TBD" if not specified

        // Relations to other features
        this.createdBy = createdBy;
        this.community = community;
        this.tournament = tournament;

        // Unique ID for event
        this.eventId = Date.now();
    }

    // Updates event details
    updateEventDetails(updates) {
        Object.assign(this, updates);
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

    // Displays event info (for debugging and UI testing later)
    getEventSummary() {
        return {
            id: this.eventId,
            title: this.title,
            description: this.description,
            dateTime: this.dateTime,
            participants: this.participants,
            game: this.game,
            location: this.location, 
            createdBy: this.createdBy.username,
            community: this.community ? this.community.name : "None",
            tournament: this.tournament ? this.tournament.title : "None"
        };
    }
}

// ================================
// Example Usage (simulated user input)
// ================================

// Dummy user
const user1 = new UserProfile("Oscar", "oscar@example.com");

// Dummy community
const comm1 = new Community("Fighting Games Enthusiasts");

// Dummy tournament
const tour1 = new Tournament("Street Fighter V Cup", "Street Fighter V");

// User input simulation for creating an event
const newEvent = new Event({
    title: "Friday Night Esports",
    description: "Weekly meetup and matches! M. Bison is banned (looking at you Antonio).",
    dateTime: "2025-09-26T20:00:00",
    participants: 32,
    game: "Street Fighter V",
    location: "Arcade Lounge, San Juan",
    createdBy: user1
});

// Associate the event with user, community, and tournament
user1.addEvent(newEvent);
newEvent.assignCommunity(comm1);
newEvent.assignTournament(tour1);

// Print event summary
console.log(newEvent.getEventSummary());

/* 
Expected output (object):
{
    id: 1695753600000,
    title: "Friday Night Esports",
    description: "Weekly meetup and matches! M. Bison is banned (looking at you Antonio).",
    dateTime: "2025-09-26T20:00:00",
    participants: 32,
    game: "Street Fighter V",
    location: "Arcade Lounge, San Juan",   
    createdBy: "Oscar",
    community: "Fighting Games Enthusiasts",
    tournament: "Street Fighter V Cup"
}
*/
