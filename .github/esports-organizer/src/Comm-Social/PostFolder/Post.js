import {
    doc,
    setDoc,
    getDoc,
    collection,
    getDocs,
    deleteDoc
} from "firebase/firestore";

import {db} from "../../database/firebaseClient.js"
/**
 * Class Post - Represents a post of a author in a community
 * 
 * Uses:
 * const p = new Post("Title", "Content", "Author", "Community");
 * p.setTitle("New Title");
 * p.addLike();
 */

const firestore = db;
export default class Post {

    /**
     * @constructors
     * @param {string} title - The title of the post
     * @param {string} content - The content of the post
     * @param {string} author - The author of the post
     * @param {string} community - The community of the posts
     * 
     * Note:The post can be in two states: Draft or Public
     * Draft: The post is not visible to other users
     * and only the author can see it, edit it, or delete it.
     * Public: The post is visible to other users
     * 
     * The post has a ID that is generated to identify the Author
     * The post has a date generated at the moment of creating a post.
     * Also the default state is always Draft when creating a post.
     * 
     */
    constructor (data){

        this.content = data?.content ?? "";
        this.author = data?.author ?? null;
        this.authorUsername = data?.authorUsername ?? null;
        this.date = new Date();
        this.community = data?.community ?? null;
        this.likes = 0;
        this.comments = [];
        this.id = Post.#generateId();
        this.state = "Draft"; 
    } 

    toFireStore(){

        return {
            content: this.content,
            author: this.author,
            authorUsername: this.authorUsername,
            date: this.date,
            community: this.community,
            likes: this.likes,
            comments: this.comments,
            id: this.id,
            state: this.state
        };
    }

    static fromFirestore(data) {
        return new Post(data);
    }

    async addPostToCommunity(post){
        try{
            await setDoc(doc(firestore, "Posts", post.id), post.toFireStore());
        }
        catch(error){
            console.log("Failed to send post do DataBase. " + error);
        }
    }


    async setLikes(postID, likes){
        const snap = await getDoc(doc(firestore,"Posts", postID));
        if(snap.exists()){
            let oldPost = Post.fromFirestore(snap.data());

            let newPost = {
                content:oldPost.content,
                author:oldPost.author, 
                authorUsername: oldPost.authorUsername,
                date: oldPost.date,
                community: oldPost.community,
                likes: likes,
                comments: oldPost.comments,
                id: oldPost.id,
                state: oldPost.state
            }

            await setDoc(doc(firestore, "Posts", newPost.id), newPost.toFirestore());
        }
        else{
            console.log("Post Does not exist");
        }
    }
   
    /** 
     * @param {string} content - New content of the post
     * @param {string} postID - ID of the post
     */
    async setContent(postID, content){
        const snap = await getDoc(doc(firestore,"Posts", postID));
        if(snap.exists()){
            let oldPost = Post.fromFirestore(snap.data());

            let newPost = {
                content:content,
                author:oldPost.author, 
                authorUsername: oldPost.authorUsername,
                date: oldPost.date,
                community: oldPost.community,
                likes: oldPost.likes,
                comments: oldPost.comments,
                id: oldPost.id,
                state: oldPost.state
            }

            await setDoc(doc(firestore, "Posts", newPost.id), newPost.toFirestore());
        }
        else{
            console.log("Post Does not exist");
        }
    }
 
    /**
     * @param {string} author - Sets the author of the post
     */
    async setAuthor(postID,author){
        const snap = await getDoc(doc(firestore,"Posts", postID));
        if(snap.exists()){
            let oldPost = Post.fromFirestore(snap.data());

            let newPost = {
                content:oldPost.content,
                author:author, 
                authorUsername: oldPost.authorUsername,
                date: oldPost.date,
                community: oldPost.community,
                likes: oldPost.likes,
                comments: oldPost.comments,
                id: oldPost.id,
                state: oldPost.state
            }

            await setDoc(doc(firestore, "Posts", newPost.id), newPost.toFirestore());
        }
        else{
            console.log("Post Does not exist");
        }
    }
    /**
     *  @param {string} state - Sets the state of the post (Draft or Public)
     */
    async setState(postID,State){
        const snap = await getDoc(doc(firestore,"Posts", postID));
            if(snap.exists()){
                let oldPost = Post.fromFirestore(snap.data());

                let newPost = {
                    content:oldPost.content,
                    author:author, 
                    authorUsername: oldPost.authorUsername,
                    date: oldPost.date,
                    community: oldPost.community,
                    likes: oldPost.likes,
                    comments: oldPost.comments,
                    id: oldPost.id,
                    state: State
                }

                await setDoc(doc(firestore, "Posts", newPost.id), newPost.toFirestore());
            }
            else{
                console.log("Post Does not exist");
            }
    }
   
    /**
     * 
     * @param {string} username - Sets the author's username of the post.
     */
    async setAuthorUsername(postID,username){
        const snap = await getDoc(doc(firestore,"Posts", postID));
        if(snap.exists()){
            let oldPost = Post.fromFirestore(snap.data());

            let newPost = {
                content:oldPost.content,
                author:author, 
                authorUsername: username,
                date: oldPost.date,
                community: oldPost.community,
                likes: oldPost.likes,
                comments: oldPost.comments,
                id: oldPost.id,
                state: oldPost.state
            }

            await setDoc(doc(firestore, "Posts", newPost.id), newPost.toFireStore());
        }
        else{
            console.log("Post Does not exist");
        }
    }
    /** 
     * Getters for the post
    */ 
 
    /**
     * @returns {string} - The author of the post
     */
    async getAuthor(postID){
        const snap = await getDoc(doc(firestore,"Posts", postID));
        if(snap.exists()){
            return Post.fromFirestore(snap.data()).author;
        }
    }
    /**
     * @returns {Date} - The date of the post
     */
    async getDate(postID){
        const snap = await getDoc(doc(firestore,"Posts", postID));
        if(snap.exists()){
            return Post.fromFirestore(snap.data()).date;
        }
    }
    /**
     * @returns {string} - The community of the post
     */
    async getCommunity(postID){
        const snap = await getDoc(doc(firestore,"Posts", postID));
        if(snap.exists()){
            return Post.fromFirestore(snap.data()).community;
        };
    }
    /**
     * @returns {int} - The number of likes of the post
     */
    async getLikes(postID){
        const snap = await getDoc(doc(firestore,"Posts", postID));
        if(snap.exists()){
            return Post.fromFirestore(snap.data()).likes;
        }
    }
    /**
     * @returns {Array} - The comments of the post
     */
    async getComments(postID){
        const snap = await getDoc(doc(firestore,"Posts", postID));
        if(snap.exists()){
            return Post.fromFirestore(snap.data()).comments;
        }
    }
    async getPost(postID){
        const snap = await getDoc(doc(firestore, "Posts", postID));
            if(snap.exists()){
                return Post.fromFirestore(snap.data());
            }
            return null;
    }
    /**
     * @param {string} postID - ID of the post 
     * @returns {string} - The content of the post
     */

    async getContent(postID){
        const snap = await getDoc(doc(firestore,"Posts", postID));
        if(snap.exists()){
            return Post.fromFirestore(snap.data()).content;
        }
    }

    async getAllPosts(postID){
        const postCollection = collection(firestore, "Posts");
        const postSnapshot = await getDocs(postCollection);
        return postSnapshot.docs.map(doc => Post.fromFirestore(doc.data()));
    }

    /**
     * @returns {string} - The ID of the post
     */
    async getId(postID){
        const snap = await getDoc(doc(firestore,"Posts", postID));
        if(snap.exists()){
            return Post.fromFirestore(snap.data()).id;
        }
    }
    /**
     * @returns {string} - The state of the post (Draft or Public)
     */
    async getState(postID){
       const snap = await getDoc(doc(firestore,"Posts", postID));
        if(snap.exists()){
            return Post.fromFirestore(snap.data()).state;
        }
    }
    
    /**
     * @returns {string} - The author's username of the post
     */
    async getAuthorUsername(postID){
        const snap = await getDoc(doc(firestore,"Posts", postID));
        if(snap.exists()){
            return Post.fromFirestore(snap.data()).authorUsername;
        }
    }
    
    
    /**
     * Generates a random ID for the post
     * @returns {string} - The generated ID
     * Use encapsulation to prevent external access and use only in the class.
     */
    static #generateId(){
        return crypto.randomUUID();
    }
   

}