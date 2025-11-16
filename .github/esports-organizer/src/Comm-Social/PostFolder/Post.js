/**
 * Class Post - Represents a post of a author in a community
 * 
 * Uses:
 * const p = new Post("Title", "Content", "Author", "Community");
 * p.setTitle("New Title");
 * p.addLike();
 */
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
 
    /**
     * Setters for post
     */

    /** 
     * @param {string} content - Sets the content of the post
     */
    setContent(content){
        this.content = content
    }
    /**
     * @param {string} author - Sets the author of the post
     */
    setAuthor(author){
        this.author = author;
    }
    /**
     * @param {string} community - Sets the community of the post
     */
    setCommunity(community){
        this.community = community;
    }
    /**
     * @param {int} likes - Sets the number of likes of the post
     */
    setLikes(likes){
        this.likes = likes;
    }
    /**
     * @param {string} id - Sets the ID of the post
     */ 
    setId(id){
        this.id = id;
    }
    /**
     *  @param {string} state - Sets the state of the post (Draft or Public)
     */
     setPublicState(){
        this.state = "Public";
    }
    setDraftState(){
        this.state = "Draft";
    }
    /**
     * @param {Date} date - Sets the date of the post
     */
    setDate(date){
        this.date = date;
    }
    /**
     * Sets the current date to the post
     */
    setCurrentDate(){
        this.date = new Date();
    }
    /**
     * 
     * @param {string} username - Sets the author's username of the post.
     */
    setAuthorUsername(username){
        this.authorUsername = username;
    }
    /** 
     * Getters for the post
    */

    /**
     * @returns {string} - The content of the post
     */
    getContent(){
        return this.content;
    }
    /**
     * @returns {string} - The author of the post
     */
    getAuthor(){
        return this.author;
    }
    /**
     * @returns {Date} - The date of the post
     */
    getDate(){
        return this.date;
    }
    /**
     * @returns {string} - The community of the post
     */
    getCommunity(){
        return this.community;
    }
    /**
     * @returns {int} - The number of likes of the post
     */
    getLikes(){
        return this.likes;
    }
    /**
     * @returns {Array} - The comments of the post
     */
    getComments(){
        return this.comments;
    }
    /**
     * @returns {string} - The ID of the post
     */
    getId(){
        return this.id;
    }
    /**
     * @returns {string} - The state of the post (Draft or Public)
     */
    getState(){
        return this.state;
    }
    /**
     * @returns {number} - The number of comments on the post
     */
    getNumberOfComments(){
        return this.comments.length;
    }
    /**
     * @returns {string} - The author's username of the post
     */
    getAuthorUsername(){
        return this.authorUsername;
    }
    /** 
     * Other methods
     */

    /**
     * Adds a comment to the post
     * @param {string} comment - The comment to add
     */
    addComment(comment){
        this.comments.push(comment);
    }
    /**
     * Removes a comment from the post
     * @param {string} comment - The comment to remove
     */
    removeComment(comment){
        this.comments = this.comments.filter(c => c !== comment);
    }
    /**
     * Increases the number of likes of the post by 1
     */
    addLike(){
        this.likes += 1;
    }
    /**
     * Decreases the number of likes of the post by 1
     */
    removeLike(){
        this.likes -= 1;
    }
    /**
     * Generates a random ID for the post
     * @returns {string} - The generated ID
     * Use encapsulation to prevent external access and use only in the class.
     */
    static #generateId(){
        return '_' + Math.random().toString(36).slice(2, 9);
    }
   

}