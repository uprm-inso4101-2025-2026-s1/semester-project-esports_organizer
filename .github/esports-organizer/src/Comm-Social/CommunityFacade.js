import {createCommunity} from "./CommunityCreation.js";
import {Community} from "./Community.js";
import Database from "../database/examples/Database.js";

export class CommunityFacade {

/*
Example usage:

CommunityFacade.create({
  name: "Retro Gamers",
  description: "A place for fans of classic games.",
  admin: "user123",
  tags: ["retro", "arcade"],
  game: "Pac-Man",
  location: "Puerto Rico",
  icon: "/images/pacman.png",
  banner: "/banners/classic.jpg"
});

Currently, a string is returned that indicates whether community creation was successful or not
*/
    static create(init){

        return createCommunity(init.name, init.description, init.admin, init.tags, init.game, 
            init.location, init.icon, init.banner);
    }

/*
The update method serves to update the community given its id and newSettings, returns string to indicate 
whether the update was successful or not
*/

  static async update(communityId, newSettings) {

    const community = Community.getCommunityById(communityId);
    if (!community) throw new Error(`Community of ID ${communityId} not found.`);

    if (newSettings.name) community.setName(newSettings.name);
    if (newSettings.description) community.setDescription(newSettings.description);
    if (newSettings.icon) community.setIcon(newSettings.icon);
    if (newSettings.banner) community.setBanner(newSettings.banner);
    if (newSettings.location) community.setLocation(newSettings.location);
    if (newSettings.tags) community.setTags(newSettings.tags);

    try{
        
      const database = await Database.createDatabase();

      database.updateCommunity(community.getId(),community);

      return "Community successfully updated!";
    }
    catch(error){

        console.log("Error when updating community:" + error);

        return "Failed to update community: " + error; 
    }

  }

}