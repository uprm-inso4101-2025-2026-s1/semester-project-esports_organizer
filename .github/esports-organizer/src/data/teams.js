import teamProfilePic1 from "../assets/team-profile-pics/teamProfilePic1.png";
import teamProfilePic2 from "../assets/team-profile-pics/teamProfilePic2.png";
import teamProfilePic3 from "../assets/team-profile-pics/teamProfilePic3.png";
import teamProfilePic4 from "../assets/team-profile-pics/teamProfilePic4.png";
import teamProfilePicA from "../assets/team-profile-pics/team1.png";
import teamProfilePicB from "../assets/team-profile-pics/team2.png";
import teamProfilePicC from "../assets/team-profile-pics/team3.png";

export const TEAMS = [
  {
    id: "test-team-1",
    name: "Test Team 1",
    game: "Valorant",
    logo: teamProfilePicA,
    coverImage: "/assets/images/Fortnite.png",
    description:
      "Demo roster used to preview how team profiles will look once real data is connected.",
    record: {
      wins: 18,
      losses: 6,
    },
    social: {
      twitch: "",
      twitter: "",
      tiktok: "",
      instagram: "",
      youtube: "",
    },
    stats: {
      tournamentsPlayed: 14,
      matchesPlayed: 72,
      tournamentsWon: 6,
    },
    matches: [
      {
        id: "test-team-1-match-1",
        opponent: "Test Opponent A",
        opponentLogo: teamProfilePicC,
        score: {
          for: 3,
          against: 1,
        },
        tournament: "Showcase Circuit",
        date: "2025-08-14",
      },
      {
        id: "test-team-1-match-2",
        opponent: "Test Opponent B",
        opponentLogo: teamProfilePicC,
        score: {
          for: 2,
          against: 3,
        },
        tournament: "Demo Cup",
        date: "2025-07-30",
      },
      {
        id: "test-team-1-match-3",
        opponent: "Test Opponent C",
        opponentLogo: teamProfilePicB,
        score: {
          for: 3,
          against: 0,
        },
        tournament: "Summer Showcase",
        date: "2025-07-12",
      },
    ],
    roster: [
      {
        id: "test-team-1-player-1",
        gamerTag: "Test Player 1",
        name: "Test Player 1",
        position: "Captain",
        nationality: "USA",
        photo: teamProfilePic1,
        socials: {
          twitch: "",
          twitter: "",
          instagram: "",
          tiktok: "",
        },
      },
      {
        id: "test-team-1-player-2",
        gamerTag: "Test Player 2",
        name: "Test Player 2",
        position: "Support",
        nationality: "USA",
        photo: teamProfilePic2,
        socials: {
          twitch: "",
          twitter: "",
          instagram: "",
          tiktok: "",
        },
      },
      {
        id: "test-team-1-player-3",
        gamerTag: "Test Player 3",
        name: "Test Player 3",
        position: "Flex",
        nationality: "USA",
        photo: teamProfilePic3,
        socials: {
          twitch: "",
          twitter: "",
          instagram: "",
          tiktok: "",
        },
      },
      {
        id: "test-team-1-player-4",
        gamerTag: "Test Player 4",
        name: "Test Player 4",
        position: "Controller",
        nationality: "USA",
        photo: teamProfilePic4,
        socials: {
          twitch: "",
          twitter: "",
          instagram: "",
          tiktok: "",
        },
      },
      {
        id: "test-team-1-player-5",
        gamerTag: "Test Player 5",
        name: "Test Player 5",
        position: "Initiator",
        nationality: "USA",
        photo: teamProfilePic1,
        socials: {
          twitch: "",
          twitter: "",
          instagram: "",
          tiktok: "",
        },
      },
      {
        id: "test-team-1-player-6",
        gamerTag: "Test Player 6",
        name: "Test Player 6",
        position: "Duelist",
        nationality: "USA",
        photo: teamProfilePic2,
        socials: {
          twitch: "",
          twitter: "",
          instagram: "",
          tiktok: "",
        },
      },
    ],
    canEdit: true,
  },
  {
    id: "test-team-2",
    name: "Test Team 2",
    game: "League of Legends",
    logo: teamProfilePicB,
    coverImage: "/assets/images/Valorant.png",
    description:
      "Placeholder squad representing how a second roster will appear in the teams directory.",
    record: {
      wins: 22,
      losses: 11,
    },
    social: {
      twitch: "",
      twitter: "",
      tiktok: "",
      instagram: "",
      youtube: "",
    },
    stats: {
      tournamentsPlayed: 18,
      matchesPlayed: 95,
      tournamentsWon: 8,
    },
    matches: [],
    roster: [],
    canEdit: true,
  },
  {
    id: "test-team-3",
    name: "Test Team 3",
    game: "Fortnite",
    logo: teamProfilePicC,
    coverImage: "/assets/images/Fortnite.png",
    description:
      "Another example roster card so you can preview the layout before data wiring.",
    record: {
      wins: 15,
      losses: 9,
    },
    social: {
      twitch: "",
      twitter: "",
      tiktok: "",
      instagram: "",
      youtube: "",
    },
    stats: {
      tournamentsPlayed: 12,
      matchesPlayed: 60,
      tournamentsWon: 4,
    },
    matches: [
      {
        id: "test-team-3-match-1",
        opponent: "Test Opponent D",
        opponentLogo: teamProfilePicA,
        score: {
          for: 1,
          against: 3,
        },
        tournament: "Launch Invitational",
        date: "2025-06-22",
      },
    ],
    roster: [
      {
        id: "test-team-3-player-1",
        gamerTag: "Test Player 7",
        name: "Test Player 7",
        position: "Captain",
        nationality: "USA",
        photo: teamProfilePic1,
        socials: {
          twitch: "",
          twitter: "",
          instagram: "",
          tiktok: "",
        },
      },
    ],
    canEdit: true,
  },
];
