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


}