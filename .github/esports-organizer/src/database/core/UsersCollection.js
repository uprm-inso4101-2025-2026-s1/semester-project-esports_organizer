class User {
    uID;
    email;
    username;
    createdAt;
    profile;
    role;

    constructor(uID, email, username, createdAt = new Date(),profile = {}) {
        this.uID = uID;
        this.email = email;
        this.username = username;
        this.createdAt = createdAt;
        this.profile = profile;
        this.role = "";
    }

    toFirestore() {
        return {
            "uid" : this.uID,
            "email" : this.email,
            "username" : this.username,
            "createdAt" : this.createdAt,
            "profile" : this.profile,
            "role" : this.role
        };
    }

    static fromFirestore(data) {
        return new User(data.uID, data.email, data.username, data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt, data.profile || {}, data.role || "player");
    }
}

export default User;