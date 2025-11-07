import {createCommunity} from "./CommunityCreation.js";
import {Community} from "./Community.js";

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

Currently, a string is returned that indicates successful community creation
*/
    static create(init){

        return createCommunity(init.name, init.description, init.admin, init.tags, init.game, 
            init.location, init.icon, init.banner);

    }

/*
The update method serves to update the community given its id and newSettings
*/

  static update(communityId, newSettings) {
    const community = Community.getCommunityById(communityId);
    if (!community) throw new Error("Community not found.");

    if (newSettings.name) community.setName(newSettings.name);
    if (newSettings.description) community.setDescription(newSettings.description);
    if (newSettings.icon) community.setIcon(newSettings.icon);
    if (newSettings.banner) community.setBanner(newSettings.banner);
    if (newSettings.location) community.setLocation(newSettings.location);
    if (newSettings.tags) community.setTags(newSettings.tags);

    //Later this could call Firestore update logic
    return community;
  }

}