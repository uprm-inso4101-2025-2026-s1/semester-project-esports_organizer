import "./BracketsTournamentPage.css";
import Round from "../../components/bracketsPage/rounds/Round";

import Banner from "../../components/bracketsPage/banners/Banner";
import RoundBar from "../../components/bracketsPage/rounds/RoundBar";   
import Teams from "../../components/bracketsPage/teams/Teams";
import WinningTeam from "../../components/bracketsPage/winningTeam/WinningTeam";
import Lines from "../../lines/lines.svg";
import Lines2 from "../../lines/lines2.svg";
import Lines3 from "../../lines/lines3.svg";
import Lines4 from "../../lines/lines4.svg";
import Lines5 from "../../lines/lines5.svg";
import Lines6 from "../../lines/lines6.svg";
import Lines7 from "../../lines/lines7.svg";
import Lines8 from "../../lines/lines8.svg";
import WinnersLine from "../../lines/winnersLine.svg";
import React, { useEffect, useState } from "react";
import { resultReport } from "../../Comm-Social/ResultReport.js";
import Navbar from "../../components/shared/Navbar";
import { test1 } from "../../Comm-Social/Tests/TournamentTest";
import { initializeBracket, progressMatch } from "../../Comm-Social/MatchProgression.js";

function BracketsTournamentPage(){
    // State to hold the tournament state and selected team
    const [bracketState, setBracketState] = useState(null);
    const [champion, setChampion] = useState(null);
    const [eliminationOrder, setEliminationOrder] = useState(null);

    // Handler for when a team is clicked (progress a match)
    const handleTeamClick = (teamName, teamLogo, matchId) => {
        if (!bracketState || !matchId) {
            console.log("Invalid bracket state or match ID");
            return;
        }

        // Try to find match in any round, not just current
        let foundMatch = null;
        let foundInRound = null;
        console.log("Unchanged BracketState rounds:", bracketState.rounds);
        bracketState.rounds.forEach((roundMatches, roundIndex) => {
            const found = roundMatches.find(([id]) => id === matchId);
            if (found) {
                foundMatch = found;
                foundInRound = roundIndex + 1;
            }
        });

        if (!foundMatch) {
            console.log("Match not found in any round:", matchId);
            return;
        }

        const newState = progressMatch(bracketState, matchId, teamName);
        setBracketState(newState);

        // If bracket is finished, set champion
        if (newState.bracket && newState.bracket.matches && newState.bracket.matches.size === 0 && ![1, 2, 3].includes(foundInRound)) {
            const winnerId = newState.bracket._winnersCurrentRound?.[0];
            if (winnerId) {
                const winner = newState.teams?.find(t => t.id === winnerId);
                if (winner) {
                    setChampion(winner);
                    setEliminationOrder(newState.eliminationOrder.concat([champion]));
                }
            }
        }
    };

    // On component mount, fetch the tournament data and initialize bracket
    useEffect(() => {
        const tournament = test1();

        if(tournament){
            try{
                const initial = initializeBracket(tournament.teams);
                // attach teams to state for later lookups
                initial.teams = tournament.teams;
                setBracketState(initial);
            } catch (e) {
                console.error('Failed to initialize bracket', e);
            }
        }
    }, []);

    
    // Initialize match data container
    const matchData = {
        round1: Array(8).fill(0).map(() => ({ match: {}, id: null })),
        round2: Array(4).fill(0).map(() => ({ match: {}, id: null })),
        round3: Array(2).fill(0).map(() => ({ match: {}, id: null })),
        final: { match: {}, id: null }
    };

    // Initialize team arrays
    let left_Team1 = [], left_Team2 = [], left_Team3 = [], left_Team4 = [];
    let right_Team1 = [], right_Team2 = [], right_Team3 = [], right_Team4 = [];
    let left_team1_Round2 = [], left_team2_Round2 = [];
    let right_team1_Round2 = [], right_team2_Round2 = [];
    let leftR3 = [], rightR3 = [];
    let final = [];

    // Obtain the matches for each round from bracketState
    const rounds = bracketState ? bracketState.rounds : [];
    
    // Helper function to safely get match and its ID
    const getMatchFromRound = (roundMatches, index) => { 
        if (!roundMatches || !roundMatches[index]) {
            console.log("No match found at index:", index);
            return { match: {}, id: null };
        }
        const [originalId, match] = roundMatches[index];
        
        // Ensure we have a valid match ID that matches the format used in Bracket.js
        if (!originalId || !match) {
            console.log("Invalid match or ID:", { originalId, match });
            return { match: {}, id: null };
        }

        // Keep the original ID - we were incorrectly reconstructing it before
        return { match, id: originalId };
    };

    console.log("Current bracketState rounds:", rounds);
    
    // Process all rounds from bracketState
    if (rounds[0]) {
        const firstRoundMatches = rounds[0];
        // Get match data for first round
        matchData.round1[0] = getMatchFromRound(firstRoundMatches, 0);
        matchData.round1[1] = getMatchFromRound(firstRoundMatches, 1);
        matchData.round1[2] = getMatchFromRound(firstRoundMatches, 2);
        matchData.round1[3] = getMatchFromRound(firstRoundMatches, 3);
        
        left_Team1 = matchData.round1[0].match;
        left_Team2 = matchData.round1[1].match;
        left_Team3 = matchData.round1[2].match;
        left_Team4 = matchData.round1[3].match;

        matchData.round1[4] = getMatchFromRound(firstRoundMatches, 4);
        matchData.round1[5] = getMatchFromRound(firstRoundMatches, 5);
        matchData.round1[6] = getMatchFromRound(firstRoundMatches, 6);
        matchData.round1[7] = getMatchFromRound(firstRoundMatches, 7);
        
        right_Team1 = matchData.round1[4].match;
        right_Team2 = matchData.round1[5].match;
        right_Team3 = matchData.round1[6].match;
        right_Team4 = matchData.round1[7].match;
    }
    
    if (rounds[1]) {
        const secondRoundMatches = rounds[1];
        console.log("Round 2 matches:", secondRoundMatches);
        // Get match data for second round
        matchData.round2[0] = getMatchFromRound(secondRoundMatches, 0);
        matchData.round2[1] = getMatchFromRound(secondRoundMatches, 1);
        matchData.round2[2] = getMatchFromRound(secondRoundMatches, 2);
        matchData.round2[3] = getMatchFromRound(secondRoundMatches, 3);
        
        left_team1_Round2 = matchData.round2[0].match;
        left_team2_Round2 = matchData.round2[1].match;
        right_team1_Round2 = matchData.round2[2].match;
        right_team2_Round2 = matchData.round2[3].match;
    }
    
    if (rounds[2]) {
        const thirdRoundMatches = rounds[2];
        console.log("Round 3 matches:", thirdRoundMatches);
        // Get match data for third round
        matchData.round3[0] = getMatchFromRound(thirdRoundMatches, 0);
        matchData.round3[1] = getMatchFromRound(thirdRoundMatches, 1);
        
        leftR3 = matchData.round3[0].match;
        rightR3 = matchData.round3[1].match;
    }

    // Final round match
    if (rounds[3]) {
        const finalRoundMatches = rounds[3];
        console.log("Final round matches:", finalRoundMatches);
        matchData.final = getMatchFromRound(finalRoundMatches, 0);
        final = matchData.final.match;
    }

    const getWinnerName = (match) => {
        if (!match || !match.winner) return null;
        return bracketState?.teams?.find(t => t.id === match.winner)?.name || null;
    }
    // end of tournament, call report result
    
    if(champion){
        resultReport(eliminationOrder)
    }

    return(
        <div className="brackets-tournament-page">
        <Navbar/>
        <Banner/>
        <div className="columns-row-wrapper">

        <div className="columns-row">
            <div className="brackets-column">
                <Round labels={["Round 1"]} />
                {/* Left Column */}


                {left_Team1 && left_Team1.player1 && left_Team1.player2 ? (
                    <>
                        <Teams 
                            teamNames={[left_Team1.player1?.name, left_Team1.player2?.name]}
                            teamLogos={[left_Team1.player1?.logo, left_Team1.player2?.logo]}
                            onTeamClick={handleTeamClick}
                            matchId={matchData.round1[0].id}
                            winnerName={getWinnerName(left_Team1)}
                        />
                    </>
                ) : (
                    <Teams/>
                )}

                {left_Team2 && left_Team2.player1 && left_Team2.player2 ? (
                    <Teams
                        teamNames={[left_Team2.player1?.name, left_Team2.player2?.name]}
                        teamLogos={[left_Team2.player1?.logo, left_Team2.player2?.logo]}
                        onTeamClick={handleTeamClick}
                        matchId={matchData.round1[1].id}
                        winnerName={getWinnerName(left_Team2)}
                    />
                ) : (
                    <Teams/>
                )}

                {left_Team3 && left_Team3.player1 && left_Team3.player2 ? (
                    <Teams
                        teamNames={[left_Team3.player1.name, left_Team3.player2.name]}
                        teamLogos={[left_Team3.player1.logo, left_Team3.player2.logo]}
                        onTeamClick={handleTeamClick}
                        matchId={matchData.round1[2].id}
                        winnerName={getWinnerName(left_Team3)}
                    />
                ) : (
                    <Teams/>
                )}

                {left_Team4 && left_Team4.player1 && left_Team4.player2 ? (
                    <Teams
                        teamNames={[left_Team4.player1.name, left_Team4.player2.name]}
                        teamLogos={[left_Team4.player1.logo, left_Team4.player2.logo]}
                        onTeamClick={handleTeamClick}
                        matchId={matchData.round1[3].id}
                        winnerName={getWinnerName(left_Team4)}
                    />
                ) : (
                    <Teams/>
                )}
            </div>
            <div className="lines-stack">
                <div className="lines">
                    <img src={Lines} alt="lines"/>
                </div>
                <div className="lines2">
                    <img src={Lines2} alt="lines"/>
                </div>
            </div>
            <div className="column-2">
                {/* Left Column Round 2 */}
                <Round labels={["Round 2"]} />
                {left_team1_Round2 && left_team1_Round2.player1 && left_team1_Round2.player2  ? (
                    <Teams
                        teamNames={[left_team1_Round2.player1.name, left_team1_Round2.player2.name]}
                        teamLogos={[left_team1_Round2.player1.logo, left_team1_Round2.player2.logo]}
                        onTeamClick={handleTeamClick}
                        matchId={matchData.round2[0].id}
                        winnerName={getWinnerName(left_team1_Round2)}
                    />
                ) : (
                    <Teams/>
                )}

                {left_team2_Round2 && left_team2_Round2.player1 && left_team2_Round2.player2 ? (
                    <Teams
                        teamNames={[left_team2_Round2.player1.name, left_team2_Round2.player2.name]}
                        teamLogos={[left_team2_Round2.player1.logo, left_team2_Round2.player2.logo]}
                        onTeamClick={handleTeamClick}
                        matchId={matchData.round2[1].id}
                        winnerName={getWinnerName(left_team2_Round2)}
                    />
                ) : (
                    <Teams/>
                )}
            </div>
            <div className="lines3-stack">
                <div className="lines3">
                    <img src={Lines3} alt="lines"/>
                </div>
            </div>
            <div className="column-3">
                <Round labels={["Semi-Finals"]} />
                {/* Left Column semifinals */}
                {leftR3 && leftR3.player1 && leftR3.player2 ? (
                    <Teams
                        teamNames={[leftR3.player1.name, leftR3.player2.name]}
                        teamLogos={[leftR3.player1.logo, leftR3.player2.logo]}
                        onTeamClick={handleTeamClick}
                        matchId={matchData.round3[0].id}
                        winnerName={getWinnerName(leftR3)}
                    />
                ) : (
                    <Teams/>
                )}
            </div>
            <div className="lines4-stack">
                <div className="lines4">
                    <img src={Lines4} alt="lines"/>
                </div>
            </div>
            <div className="column-4">
                {/* Middle column final */}
                <Round labels={["Finals"]} />
                {final && final.player1 && final.player2 ? (
                    <Teams
                        teamNames={[final.player1.name, final.player2.name]}
                        teamLogos={[final.player1.logo, final.player2.logo]}
                        onTeamClick={handleTeamClick}
                        matchId={matchData.final.id}
                        winnerName={getWinnerName(final)}
                    />
                ) : (
                    <Teams/>
                )}

                <div className="winnersline">
                    <img src={WinnersLine} alt="winners line"/>
                </div>
                {/* Winning Team */}
              <WinningTeam teamName={champion ? champion.name : "Champion"} />

            </div>
            <div className="lines5-stack">
                <div className="lines5">
                    <img src={Lines5} alt="lines"/>
                </div>
            </div>
            <div className="column-5">
                {/* Right Column semifinals */}
                <Round labels={["Semi-Finals"]} />
                {rightR3 && rightR3.player1 && rightR3.player2 ? (
                    <Teams
                        teamNames={[rightR3.player1.name, rightR3.player2.name]}
                        teamLogos={[rightR3.player1.logo, rightR3.player2.logo]}
                        onTeamClick={handleTeamClick}
                        matchId={matchData.round3[1].id}
                        winnerName={getWinnerName(rightR3)}
                    />
                ) : (
                    <Teams/>
                )}
            </div>
            <div className="lines6-stack">
                <div className="lines6">
                    <img src={Lines6} alt="lines"/>
                </div>
            </div>
            <div className="column-6">
                {/* Right Column Round 2 */}
                <Round labels={["Round 2"]} />
                {right_team1_Round2 && right_team1_Round2.player1 && right_team1_Round2.player2 ? (
                    <>
                        <Teams
                            teamNames={[right_team1_Round2.player1.name, right_team1_Round2.player2.name]}
                            teamLogos={[right_team1_Round2.player1.logo, right_team1_Round2.player2.logo]}
                            onTeamClick={handleTeamClick}
                            matchId={matchData.round2[2].id}
                            winnerName={getWinnerName(right_team1_Round2)}
                        />
                    </>
                ) : (
                    <Teams/>
                )}
                {right_team2_Round2 && right_team2_Round2.player1 && right_team2_Round2.player2 ? (
                    <>
                        <Teams
                            teamNames={[right_team2_Round2.player1.name, right_team2_Round2.player2.name]}
                            teamLogos={[right_team2_Round2.player1.logo, right_team2_Round2.player2.logo]}
                            onTeamClick={handleTeamClick}
                            matchId={matchData.round2[3].id}
                            winnerName={getWinnerName(right_team2_Round2)}
                        />
                    </>
                ) : (
                    <Teams/>
                )}
            </div>
            <div className="lines7-stack">
                <div className="lines7">
                    <img src={Lines7} alt="lines"/>
                </div>
                <div className="lines8">
                    <img src={Lines8} alt="lines"/>
                </div>
            </div>
            <div className="column-7">
                {/* Right Column Round 1 */}
                <Round labels={["Round 1"]} />
                {right_Team1 && right_Team1.player1 && right_Team1.player2 ? (
                    <>
                        <Teams
                            teamNames={[right_Team1.player1.name, right_Team1.player2.name]}
                            teamLogos={[right_Team1.player1.logo, right_Team1.player2.logo]}
                            onTeamClick={handleTeamClick}
                            matchId={matchData.round1[4].id}
                            winnerName={getWinnerName(right_Team1)}
                        />
                    </>
                ) : (
                    <Teams/>
                )}

                {right_Team2 && right_Team2.player1 && right_Team2.player2 ? (
                    <Teams
                        teamNames={[right_Team2.player1.name, right_Team2.player2.name]}
                        teamLogos={[right_Team2.player1.logo, right_Team2.player2.logo]}
                        onTeamClick={handleTeamClick}
                        matchId={matchData.round1[5].id}
                        winnerName={getWinnerName(right_Team2)}
                    />
                ) : (
                    <Teams/>
                )}

                {right_Team3 && right_Team3.player1 && right_Team3.player2 ? (
                    <Teams
                        teamNames={[right_Team3.player1.name, right_Team3.player2.name]}
                        teamLogos={[right_Team3.player1.logo, right_Team3.player2.logo]}
                        onTeamClick={handleTeamClick}
                        matchId={matchData.round1[6].id}
                        winnerName={getWinnerName(right_Team3)}
                    />
                ) : (
                    <Teams/>
                )}

                {right_Team4 && right_Team4.player1 && right_Team4.player2 ? (
                    <Teams
                        teamNames={[right_Team4.player1.name, right_Team4.player2.name]}
                        teamLogos={[right_Team4.player1.logo, right_Team4.player2.logo]}
                        onTeamClick={handleTeamClick}
                        matchId={matchData.round1[7].id}
                        winnerName={getWinnerName(right_Team4)}
                    />
                ) : (
                    <Teams/>
                )}
            </div>
        </div>
        </div>
        </div>
    );
}

export default BracketsTournamentPage;