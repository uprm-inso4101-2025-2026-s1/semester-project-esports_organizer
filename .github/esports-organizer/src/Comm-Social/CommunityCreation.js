import {Community} from "./Community.js";

//WORK IN PROGRESS FILE

//Function receives the following arguments:
/**
 * @argument {string} name argument string community name
 * @argument {string} description argument string community description
 * @argument {string} admin ID of the account that created the community
 * @argument {string[]} tags argument array of tags in a community
 * @argument {string} game the game around which the community is based
 * @argument {string} location where the community is based in
 * @argument {string} icon community icon image location string
 * @argument {string} banner community banner image location string
 */
export function createCommunity(name, description, admin, tags, game, location, icon, banner){

    //Members will start as an empty array to house the ids of future members with the admin id added as first member
    const members = [];
    members.push(admin);

    //Community starts off with an empty post array
    const posts = [];

    //Date the community was created in
    const dateCreated = new Date();

    //Generate a random UUID
    const id = crypto.randomUUID();

    const communityObject = new Community(name, description, admin, members, posts, tags, id, dateCreated, game, location, 
    icon, banner);

    try{
        //TO DO: SEND COMMUNITY DATA OR OBJECT TO DATABASE
        return "Community successfully created!";
    }
    catch(error){
        return "Failed to create community: " + error; 
    }

}