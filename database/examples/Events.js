class Event {
    name;                   // string
    organizer;              // userID of the creator of the event. (userID is an identifier such as a string)
    eventSubject;           // [The game that the event is for] string
    location;               // Location of the event (string)
    startDate;              // Date [example date = new Date(2025, 4, 19, 9, 0); year, month (starting at 0), day, hour, minutes.]
    endDate;                // Date
    participants = [];      // Array of UserIDs (starts as an empty list)
    finished = false;       // bool
    maxParticipants;        // constant unsigned int (set to thirty) (can be changed as needed)

    constructor(name, organizer, eventSubject, location, startDate, endDate, participants, finished) {
        this.name = name;
        this.organizer = organizer;
        this.eventSubject = eventSubject;
        this.location = location; 
        this.startDate = startDate;
        this.endDate = endDate;
        this.participants = participants;
        this.finished = finished;
        this.maxParticipants = 16;
    }

    /* Finds a participant from their id in the participants list and returns the index; returns -1 if the participant was not found. */
    findParticipantByID(participantID) {
        for (let i = 0; i < this.participants.length; i++) {
            if (this.participants[i] === participantID) {
                return i;
            }
        }

        return -1;
    }

    /* Adds a participant to the participants list unless it has reached the participant limit. */
    addParticipant(participant) {
        if (this.participants.length < this.maxParticipants) {
            this.participants.push(participant);
        } else {
            console.log("Participant limit reached.");
        }
    }

    /* Removes a participant from the participants list. */
    removeParticipant(participantID) {
        let participantIndex = this.findParticipantByID(participantID);
        if (participantIndex !== -1) {
            this.participants.splice(participantIndex, 1);
        }        
    }

    /* Changes the start date and end date; takes into account that the end date must be after the start date. */
    setDate(startDate, endDate) {
        if (startDate < endDate) {
            this.startDate = startDate;
            this.endDate = endDate;
        } else {
            console.log("Invalid dates.");
        }
    }

    /* Converts the event into a key value pair to be able to store in Firebase. */
    toFirestore() {
        return {
            "name" : this.name,
            "organizer" : this.organizer,
            "eventSubject" : this.eventSubject,
            "startDate" : this.startDate,
            "location" : this.location,
            "endDate" : this.endDate,
            "participants" : this.participants,
            "finished" : this.finished,
            "maxParticipants" : this.maxParticipants
        };
    }

    /* Converts from a key value pair to an Event object. */
    static fromFirestore(data) {
        return new Event(data.name, data.organizer, data.eventSubject, data.location,
                         data.startDate, data.endDate, data.participants, data.finished);
    }
}

module.exports = Event;