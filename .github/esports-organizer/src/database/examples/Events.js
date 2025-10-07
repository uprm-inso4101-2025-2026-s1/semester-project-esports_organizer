
/**
 * @typedef {Object} EventInitialize
 * @property {string} name
 * @property {string} organizer userID of the creator of the event
 * @property {string} eventSubject The game that the event is for
 * @property {string} location Location of the event
 * @property {Date} startDate
 * @property {Date} endDate
 * @property {string[]} [participants] empty by default, Array of UserIDs
 * @property {boolean} [finished] false by default
 * @property {number} [maxParticipants] defaults to 30
 */

export default class Event {
  /** @type {string} */
  name;
  /** @type {string} userID of the creator of the event */
  organizer;
  /** @type {string} The game that the event is for */
  eventSubject;
  /** @type {string} Location of the event */
  location;
  /** @type {Date} example: new Date(2025, 4, 19, 9, 0) - year, month (0-indexed), day, hour, minutes */
  startDate;
  /** @type {Date} */
  endDate;
  /** @type {string[]} Array of UserIDs */
  participants;
  /** @type {boolean} */
  finished;
  /** @type {number} constant unsigned int */
  maxParticipants;

  /**
   * @param {EventInitialize} init
   */
  constructor(init) {
    this.name = init.name;
    this.organizer = init.organizer;
    this.eventSubject = init.eventSubject;
    this.location = init.location; 
    this.startDate = init.startDate;
    this.endDate = init.endDate;
    this.participants = init.participants ?? [];
    this.finished = init.finished ?? false;
    this.maxParticipants = init.maxParticipants ?? 16;
  }

  /* Converts from a key value pair to an Event object. */
  static fromFirestore(data) {
    return new Event(data);
  }

  /**
   * Finds a participant from their ID in the participants list and returns the index.
   * Returns -1 if the participant was not found.
   * @param {string} participantID
   * @returns {number}
   */
  indexOfParticipant(participantID) {
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
    let participantIndex = this.indexOfParticipant(participantID);
    if (participantIndex !== -1) {
      this.participants.splice(participantIndex, 1);
    }
  }

  /**
   * Changes the start date and end date.
   * Takes into account that the end date must be after the start date.
   * @param {Date} startDate
   * @param {Date} endDate
   */
  setDate(startDate, endDate) {
    if (startDate < endDate) {
      this.startDate = startDate;
      this.endDate = endDate;
    } else {
      console.log("Invalid dates in `setDate`. Start date must be before end date.");
    }
  }

  /* Converts the event into a key value pair to be able to store in Firebase. */
  toFirestore() {
    return {
      "name" : this.name,
      "organizer" : this.organizer,
      "eventSubject" : this.eventSubject,
      "location" : this.location,
      "startDate" : this.startDate,
      "endDate" : this.endDate,
      "participants" : this.participants,
      "finished" : this.finished,
      "maxParticipants" : this.maxParticipants
    };
  }
}
