import "./BracketsTournamentPage.css";
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

function BracketsTournamentPage(){

    // State to hold the tournament rounds and the champion
    const [rounds, setRounds] = useState([]);
    const [champion, setChampion] = useState(null);

    // On component mount, fetch the tournament data
    useEffect(() => {
        const tournament = test1();

        if(tournament !== null){
            const data = resultReport(tournament);
            setRounds(data.rounds || []);
            setChampion(data.champion || null);  
        }       

    }, []);

    // Different matches and rounds arrays to hold the teams for rendering
    let left_Team1 = [], left_Team2 = [], left_Team3 = [], left_Team4 = [];
    let right_Team1 = [], right_Team2 = [], right_Team3 = [], right_Team4 = [];
    let left_team1_Round2 = [], left_team2_Round2 = [];
    let right_team1_Round2 = [], right_team2_Round2 = [];
    let leftR3 = [], rightR3 = [];
    let final = [];

    // Obtain the matches for each round
    //rounds is an array of the rounds, each round is an array of matches, each match is an array of teams
    if (rounds[0]) {
        
        left_Team1 = rounds[0][0][1];
        left_Team2 = rounds[0][1][1];
        left_Team3 = rounds[0][2][1];
        left_Team4 = rounds[0][3][1];

        // console.log(left_Team4[0][1]);
        

        right_Team1 = rounds[0][4][1];
        right_Team2 = rounds[0][5][1];
        right_Team3 = rounds[0][6][1];
        right_Team4 = rounds[0][7][1];
    }
    if (rounds[1]) {
        left_team1_Round2 = rounds[1][0][1];
        left_team2_Round2 = rounds[1][1][1];

        right_team1_Round2 = rounds[1][2][1];
        right_team2_Round2 = rounds[1][3][1];
    }
    if (rounds[2]) {
        leftR3 = rounds[2][0][1];
        rightR3 = rounds[2][1][1];
    }
    if (rounds[3]) {
        final = rounds[3][0][1]; 
    }

    
    return(
        <div className="brackets-tournament-page">
        <Navbar/>
        <Banner/>
        <RoundBar/>
        <div className="columns-row">
            <div className="brackets-column">
                {/* Left Column */}
                {left_Team1 && left_Team1.player1 && left_Team1.player2 ? (
                    <>
                        <Teams
                            teamNames={[left_Team1.player1.name, left_Team1.player2.name]}
                            teamLogos={[left_Team1.player1.logo, left_Team1.player2.logo]}
                        />
                    </>
                ) : (
                    <Teams/>
                )}

                {left_Team2 && left_Team2.player1 && left_Team2.player2 ? (
                    <Teams
                        teamNames={[left_Team2.player1.name, left_Team2.player2.name]}
                        teamLogos={[left_Team2.player1.logo, left_Team2.player2.logo]}
                    />
                ) : (
                    <Teams/>
                )}

                {left_Team3 && left_Team3.player1 && left_Team3.player2 ? (
                    <Teams
                        teamNames={[left_Team3.player1.name, left_Team3.player2.name]}
                        teamLogos={[left_Team3.player1.logo, left_Team3.player2.logo]}
                    />
                ) : (
                    <Teams/>
                )}

                {left_Team4 && left_Team4.player1 && left_Team4.player2 ? (
                    <Teams
                        teamNames={[left_Team4.player1.name, left_Team4.player2.name]}
                        teamLogos={[left_Team4.player1.logo, left_Team4.player2.logo]}
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
                {left_team1_Round2 && left_team1_Round2.player1 && left_team1_Round2.player2 ? (
                    <Teams
                        teamNames={[left_team1_Round2.player1.name, left_team1_Round2.player2.name]}
                        teamLogos={[left_team1_Round2.player1.logo, left_team1_Round2.player2.logo]}
                    />
                ) : (
                    <Teams/>
                )}

                {left_team2_Round2 && left_team2_Round2.player1 && left_team2_Round2.player2 ? (
                    <Teams
                        teamNames={[left_team2_Round2.player1.name, left_team2_Round2.player2.name]}
                        teamLogos={[left_team2_Round2.player1.logo, left_team1_Round2.player2.logo]}
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
                {/* Left Column semifinals */}
                {leftR3 && leftR3.player1 && leftR3.player2 ? (
                    <Teams
                        teamNames={[leftR3.player1.name, leftR3.player2.name]}
                        teamLogos={[leftR3.player1.logo, leftR3.player2.logo]}
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
                {final && final.player1 && final.player2 ? (
                    <Teams
                        teamNames={[final.player1.name, final.player2.name]}
                        teamLogos={[final.player1.logo, final.player2.logo]}
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
                {rightR3 && rightR3.player1 && rightR3.player2 ? (
                    <Teams
                        teamNames={[rightR3.player1.name, rightR3.player2.name]}
                        teamLogos={[rightR3.player1.logo, rightR3.player2.logo]}
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
                {right_team1_Round2 && right_team1_Round2.player1 && right_team1_Round2.player2 ? (
                    <>
                        <Teams
                            teamNames={[right_team1_Round2.player1.name, right_team1_Round2.player2.name]}
                            teamLogos={[right_team1_Round2.player1.logo, right_team1_Round2.player2.logo]}
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
                {/* Right Column Round 3 */}
                {right_Team1 && right_Team1.player1 && right_Team1.player2 ? (
                    <>
                        <Teams
                            teamNames={[right_Team1.player1.name, right_Team1.player2.name]}
                            teamLogos={[right_Team1.player1.logo, right_Team1.player2.logo]}
                        />
                    </>
                ) : (
                    <Teams/>
                )}

                {right_Team2 && right_Team2.player1 && right_Team2.player2 ? (
                    <Teams
                        teamNames={[right_Team2.player1.name, right_Team2.player2.name]}
                        teamLogos={[right_Team2.player1.logo, right_Team2.player2.logo]}
                    />
                ) : (
                    <Teams/>
                )}

                {right_Team3 && right_Team3.player1 && right_Team3.player2 ? (
                    <Teams
                        teamNames={[right_Team3.player1.name, right_Team3.player2.name]}
                        teamLogos={[right_Team3.player1.logo, right_Team3.player2.logo]}
                    />
                ) : (
                    <Teams/>
                )}

                {right_Team4 && right_Team4.player1 && right_Team4.player2 ? (
                    <Teams
                        teamNames={[right_Team4.player1.name, right_Team4.player2.name]}
                        teamLogos={[right_Team4.player1.logo, right_Team4.player2.logo]}
                    />
                ) : (
                    <Teams/>
                )}
            </div>
        </div>
        </div>
    );
}

export default BracketsTournamentPage;