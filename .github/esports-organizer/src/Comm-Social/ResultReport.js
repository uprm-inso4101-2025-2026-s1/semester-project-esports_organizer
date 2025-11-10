/**
 * 
 * @param {Object} tournamentData - Object containing results array, champion, and rounds
 * @returns an object that contains the champion, an array of final placements, and an array of rounds
 */
export function resultReport(tournamentData){
    try {
        let finalTeamList;

        finalTeamList = tournamentData;

        if (!finalTeamList || finalTeamList.length === 0) {
            throw new Error("No results available");
        }

        const rankingList = [];
        const finalPlacements = [];

        // Reorganize finalTeamList into rankingList so that index 0 is winner and index n-1 is loser
        // finalTeamList comes in as: [first eliminated, second eliminated, ..., runner-up, champion]
        // We want: [champion, runner-up, ..., second eliminated, first eliminated]
        for(let i = finalTeamList.length - 1; i >= 0; i--){
            rankingList.push(finalTeamList[i]);
        }

        // Obtain the finalPlacements double array with a placement string + team
        for(let i = 0; i < rankingList.length; i++){
            const rank = i + 1;
            let placement = "";

            // 1st, 2nd, 3rd, nth
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

            // Log to the console and push to the array
            console.log(placement + " Place: " + rankingList[i].name);
            finalPlacements.push([placement, rankingList[i]]);
        }
        
        return finalPlacements

    } catch (error) {
        console.log(error.message);

        return [];
    }
}