class User {
    uID;
    email;
    username;
    createdAt;

    constructor(uID, email, username, createdAt = new Date()) {
        this.uID = uID;
        this.email = email;
        this.username = username;
        this.createdAt = createdAt;
    }

    toFirestore() {
        return {
            "uid" : this.uID,
            "email" : this.email,
            "username" : this.username,
            "createdAt" : this.createdAt
        };
    }

    static fromFirestore(data) {
        return new User(data.uID, data.email, data.username, data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt);
    }
}