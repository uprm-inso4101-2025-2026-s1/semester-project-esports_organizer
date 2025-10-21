import {Community} from "./Community.js";

//WORK IN PROGRESS FILE

//Function receives arguments from the frontend implementation that calls it
export function createCommunity(name, description, tags, localization, icon, banner){

    //TO DO: get id of account that created the community
    admin = null;

    //Members will start as an empty array to house the ids of future members with the admin id added as first member
    members = [];
    members.push(admin);

    //Date the community was created in
    const dateCreated = new Date();

    //Generate a random UUID
    id = crypto.randomUUID();

        //TO DO:
        //description, localization, icon and banner properties are not present yet in the constructor
        //description (string)
        //localization (string)
        //icon ?
        //banner ?
        /*icon and banner require storing their respective images as a variable pointing to their 
        source to load later as needed? These images would have to be saved somewhere in the repository
        or do we have an image database or could have?*/

    //name (argument user passes through frontend)
    //admin TO DO
    //members √
    //posts (no posts upon creation), no need to initialize it since constructor should create an empty array
    //tags (argument user passes through frontend)
    //id √
    communityObject = Community(name, admin, members, posts, tags, id);

    //TO DO: send community object to database

}