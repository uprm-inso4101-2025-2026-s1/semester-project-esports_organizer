export default class EventTeam {
    constructor({
        name,
        members,
        capacity
    }) {
        this.name = name;
        this.members = members;
        this.capacity = capacity;
    }

    toDocData() {
        return {
            name: this.name,
            members: this.members,
            capacity: this.capacity
        }
    }
};