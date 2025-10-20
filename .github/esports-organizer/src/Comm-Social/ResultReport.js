import Tournament from "../database/examples/Tournament.js";
import { getTournamentData } from "./TournamentProcessing.js";


/**
 * 
 * @param {Tournament} Tournament takes a Tournament Object instace
 * @returns an object that contains the champion, an array of final placements, and an array of rounds
 */

export function resultReport(Tournament){

    try {
        /* The function runBracket() which is called at getTournametData, which is given in MatchProgression.js 
        will return the final list of teams, where index 0 is the first team that lost and index n-1 is the champion team.*/
        const AllTournamentData = getTournamentData(Tournament);
        const finalTeamList = AllTournamentData.results;
        const champion = AllTournamentData.champion;
        const rounds = AllTournamentData.rounds;

        const rankingList = [];
        const finalPlacements = [];

        //Reorganize finalTeamList into rankingList so that index 0 is winner and index n-1 is loser
        for(let i = finalTeamList.length-1; i>=0; i--){
            rankingList.push(finalTeamList[i]);
        }

        //Obtain the finalPlacements double array with a placement string + team
        for(let i = 0; i < rankingList.length; i++){
            const rank = i+1;
            let placement = "";

            //1st, 2nd, 3rd, nth
            if(rank === 1){
                placement = "1st";
            }
            else if(rank === 2){
                placement = "2nd";
            }
            else if(rank === 3){
                placement = "3rd";
            }
            else{
                placement = rank + "th";
            }

            //Log to the console and push to the array
            console.log(placement + " Place: " + rankingList[i].name);
            finalPlacements.push([placement,rankingList[i]]);
        }
        
        return {
            champion: champion,
            placements: finalPlacements,
            rounds: rounds
            };


    } catch (error) {
        throw new Error(error.message);
    }

}