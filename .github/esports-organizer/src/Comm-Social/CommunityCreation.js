import {Community} from "./Community.js";

//WORK IN PROGRESS FILE

//Function receives the following arguments:
/**
 * @argument {string} name argument string community name
 * @argument {string} description argument string community description
 * @argument {string} admin ID of the account that created the community
 * @argument {string[]} tags argument array of tags in a community
 * @argument {string} location where the community is based in
 * @argument {string} icon community icon image location string
 * @argument {string} banner community banner image location string
 */
export function createCommunity(name, description, admin, tags, location, icon, banner){

    //Members will start as an empty array to house the ids of future members with the admin id added as first member
    members = [];
    members.push(admin);

    //Date the community was created in
    const dateCreated = new Date();

    //Generate a random UUID
    id = crypto.randomUUID();

        //TO DO: localization, icon and banner properties are not present yet in the constructor
        //location (string, selected or entered by the user, where the community is present or based in)
        //icon (image location)
        //banner (image location)
        /*icon and banner require storing their respective images as a variable pointing to their 
        source to load later as needed? These images would have to be saved somewhere in the repository
        or do we have an image database or could have?*/

    communityObject = Community(name, description, admin, members, posts, tags, dateCreated, id);

    //TO DO: send community object to database

}