import Team from "../../database/examples/Teams.js";
import Tournament from "../../database/examples/Tournament.js";
import { registerTeam, confirmAttendance, startEvent } from "../TournamentRegistration.js";
import { resultReport } from "../ResultReport.js";
import { db } from "../../database/firebaseClient.js";

export function test1(){

    const team1 = new Team({
        name: "Avengers",
        organizer: "john",
        members: ["a"],
        teamRank: 2,
        rankScore: Math.round(Math.random() * 150),
        maxRankScore: 300,
        maxMembers: 30
    })
    team1.id="team1";
    team1.toFireStore();

    const team2 = new Team({
    name: "Red devils",
    organizer: "john",
    members: ["s"],
    teamRank: 2,
    rankScore: Math.round(Math.random() * 150),
    maxRankScore: 300,
    maxMembers: 30
    });
    team2.id="team2";
    team2.toFireStore();

    const team3 = new Team({
    name: "PRIDE",
    organizer: "john",
    members: ["p"],
    teamRank: 2,
    rankScore: Math.round(Math.random() * 150),
    maxRankScore: 300,
    maxMembers: 30
    });
    team3.id="team3";
    team3.toFireStore();

    const team4 = new Team({
    name: "Flex",
    organizer: "john",
    members: ["o"],
    teamRank: 2,
    rankScore: Math.round(Math.random() * 150),
    maxRankScore: 300,
    maxMembers: 30
    });
    team4.id="team4";
    team4.toFireStore();

    const team5 = new Team({
    name: "Hustlers",
    organizer: "john",
    members: ["r"],
    teamRank: 2,
    rankScore: Math.round(Math.random() * 150),
    maxRankScore: 300,
    maxMembers: 30
    });
    team5.id="team5";
    team5.toFireStore();

    const team6 = new Team({
    name: "Jokers",
    organizer: "john",
    members: ["t"],
    teamRank: 2,
    rankScore: Math.round(Math.random() * 150),
    maxRankScore: 300,
    maxMembers: 30
    });
    team6.id="team6";
    team6.toFireStore();
    
    const team7 = new Team({
    name: "Warriors",
    organizer: "john",
    members: ["t"],
    teamRank: 2,
    rankScore: Math.round(Math.random() * 150),
    maxRankScore: 300,
    maxMembers: 30
    });
    team7.id="team7";
    team7.toFireStore();

    const team8 = new Team({
    name: "Hellraisers",
    organizer: "john",
    members: ["t"],
    teamRank: 2,
    rankScore: Math.round(Math.random() * 150),
    maxRankScore: 300,
    maxMembers: 30
    });
    team8.id="team8";
    team8.toFireStore();

    const team9 = new Team({
    name: "Gladiators",
    organizer: "john",
    members: ["t"],
    teamRank: 2,
    rankScore: Math.round(Math.random() * 150),
    maxRankScore: 300,
    maxMembers: 30
    });
    team9.id="team9";
    team9.toFireStore();

    const team10 = new Team({
    name: "dragons",
    organizer: "john",
    members: ["t"],
    teamRank: 2,
    rankScore: Math.round(Math.random() * 150),
    maxRankScore: 300,
    maxMembers: 30
    });
    team10.id="team10";
    team10.toFireStore();
    
    const team11 = new Team({
    name: "Titans",
    organizer: "john",
    members: ["t"],
    teamRank: 2,
    rankScore: Math.round(Math.random() * 150),
    maxRankScore: 300,
    maxMembers: 30
    });
    team11.id="team11";
    team11.toFireStore();

    const team12 = new Team({
    name: "Clashers",
    organizer: "john",
    members: ["t"],
    teamRank: 2,
    rankScore: Math.round(Math.random() * 150),
    maxRankScore: 300,
    maxMembers: 30
    });
    team12.id="team12";
    team12.toFireStore();

    const team13 = new Team({
    name: "Juggernauts",
    organizer: "john",
    members: ["t"],
    teamRank: 2,
    rankScore: Math.round(Math.random() * 150),
    maxRankScore: 300,
    maxMembers: 30
    });
    team13.id="team13";
    team13.toFireStore();

    const team14 = new Team({
    name: "legends",
    organizer: "john",
    members: ["t"],
    teamRank: 2,
    rankScore: Math.round(Math.random() * 150),
    maxRankScore: 300,
    maxMembers: 30
    });
    team14.id="team14";
    team14.toFireStore();

    const team15= new Team({
    name: "phoenix",
    organizer: "john",
    members: ["t"],
    teamRank: 2,
    rankScore: Math.round(Math.random() * 150),
    maxRankScore: 300,
    maxMembers: 30
    });
    team15.id="team15";
    team15.toFireStore();

    const testtournament = new Tournament(
    null, //id
    "Test Tournament", // name
    "Smash Ultimate", //game
    "noobmaster69",//organizer
    new Date(2025,10,8,12),// [YYYY/MM/DD/HH/mm]
    32, //maxparticipant
    16,//maxteams
    'team', //type
    "$$$", //prize
    "public", //visibility
    "created", //currentstate
    db, //db
    [],//list of particpants
    []//list of teams
    );
    testtournament.id="tournament1";
    testtournament.db=db;
    testtournament.addTeam(team1);
    testtournament.addTeam(team2);
    testtournament.addTeam(team3);
    testtournament.addTeam(team4);
    testtournament.addTeam(team5);
    testtournament.addTeam(team6);
    testtournament.firestoreSave(testtournament.db);

    registerTeam(team1,testtournament);
    confirmAttendance(team1.name);
    registerTeam(team2,testtournament);
    confirmAttendance(team2.name);
    registerTeam(team3,testtournament);
    confirmAttendance(team3.name);
    registerTeam(team4,testtournament);
    confirmAttendance(team4.name);
    registerTeam(team5,testtournament);
    confirmAttendance(team5.name);
    registerTeam(team6,testtournament);
    confirmAttendance(team6.name);
    startEvent();
    console.log("\nBrackets:", testtournament);
    resultReport(testtournament);

    return testtournament;

}

export default { test1 };
