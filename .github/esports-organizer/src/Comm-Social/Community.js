//import { Post } from "./PostFolder/Post.js";

/**
 * @property {string} name
 * @property {string} description
 * @property {string} admin id of the admin of the community
 * @property {string[]} members  Array of ids members in community
 * @property {Post[]} posts array of posts in a community
 * @property {string[]} tags array of tags in a community
 * @property {string} id identifier
 * @property {object} dateCreated date the community was created
 * @property {string} game game around which the community is based
 * @property {string} location where the community is based or located
 * @property {string} icon file location of the community icon image
 * @property {string} banner file location of the community banner image
 */

export default class Community{

 /** @type {string} */
 name;
 /** @type {string} */
 description;
 /** @type {string} userID of the creator of the team */
 admin;
 /** @type {string[]} Array of ids members in community */
 members;
 /** @type {Post[]}  array of posts in a community */
 posts;
 /** @type {string[]}  array of tags in a community */
 tags;
 /** @type {string}  identifier */
id;
/** @type {object} date of community creation*/
dateCreated;
/** @type {string} */
game;
/** @type {string} */
location;
/** @type {string} */
icon;
/** @type {string} */
banner;

    //Map that contains all  created communities created
    static allCommunities = new Map();

    //Constructor
    constructor(init) {
        this.name = init.name;
        this.description = init.description;
        this.admin=init.admin;
        this.members=init.members ?? [];
        this.posts=init.posts ?? [];
        this.tags=init.tags ?? [] ;
        this.id=init.id;
        this.dateCreated=init.dateCreated;
        this.game=init.game;
        this.location=init.location;
        this.icon=init.icon;
        this.banner=init.banner;
    
    Community.allCommunities.set(this.id, this);

    }
    //setters
    setName(name){this.name=name;}

    setDescription(description){this.description=description;}

    setAdmin(admin){this.admin=admin;}

    setMembers(members){this.members=members;}

    setPosts(posts){this.posts=posts;}

    setTags(tags){this.tags=tags;}

    setId(id){this.id=id;}

    /*setDateCreated()
    Date created should not be modified*/

    setGame(game){this.game=game;}

    setLocation(location){this.location=location;}

    setIcon(icon){this.icon=icon;}

    setBanner(banner){this.banner=banner;}


    //Add post to array of posts
    addPost(post){this.posts.push(post);}
    
    //Add tag to array of tags
    addTag(tag){this.tags.push(tag);}
    
    //Add member to array of members
    addMember(member){this.members.push(member);}



    //getters
    getName(){return this.name;}

    getDescription(){return this.description;}

    getAdmin(){return this.admin;}

    getMembers(){return this.members;}

    getTags(){return this.tags;}

    getPosts(){return this.posts;}

    getId(){return this.id;}

    getDateCreated(){return this.dateCreated;}

    getGame(){return this.game;}

    getLocation(){return this.location;}

    getIcon(){return this.icon;}

    getBanner(){return this.banner;}
    
    //Get an individual member from member array
    findMember(memberID) {
        return this.members.find(m => m === memberID) || null;
    }

    //Get an individual post from post array
    findPost(postname){
        return this.posts.find(p => p.name === postname) || null;
    }

    //Get individual tag from tag array
    findTag(tagname){
        return this.tags.find(t => t === tagname) || null;
    }
   

    //Find community with given id
    static getCommunityById(id){
        return Community.allCommunities.get(id);
    }
    
    //Delete community with given id 
    static deleteCommunityById(id){
        if(!Community.allCommunities.has(id)){
            return false;
        }
        Community.allCommunities.delete(id);
        return true;
    }

    //Find community with the given admin
    static findByAdmin(adminName){
        const results = [];
        for(const community of Community.allCommunities.values()){
            if(community.admin === adminName){
                results.push(community);
            }
        }
        return results;
    }

    // Remove member from member array
    removeMember(memberID) {
        const index = this.members.findIndex(m => m === memberID);
        if (index !== -1) {
            this.members.splice(index, 1);
        }
    }
    
    // Remove post from post array
    removePost(post) {
        const index = this.posts.findIndex(p => p.id === post.id);
        if (index === -1) {
            throw new Error(`Post ${post} not found!`);
        }
        this.posts.splice(index, 1);
    }

    // Remove tag from tag array
    removeTag(tag) {
        const index = this.tags.findIndex(t => t === tag);
        if (index === -1) {
            throw new Error(`Tag ${tag} not found!`);
        }
        this.tags.splice(index, 1);
    }
    
    //Converts community object to Firestore storable
    toFirestore(){
        return{
            name: this.name,
            description: this.description,
            admin: this.admin,
            members: this.members,
            posts: this.posts,
            tags: this.tags,
            id: this.id,
            dateCreated: this.dateCreated,
            game: this.game,
            location: this.location,
            icon: this.icon,
            banner: this.banner
        };
    }

    /* Converts from a key value pair to an Event object. */
    static fromFirestore(data) {
        return new Community(data);
    }
    
} 



