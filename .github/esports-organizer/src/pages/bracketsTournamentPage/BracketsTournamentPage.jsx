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
import { getTournamentData } from "../../Comm-Social/BracketTeamVisualization";
import Navbar from "../../components/shared/Navbar";
import { test1 } from "../../Comm-Social/Tests/TournamentTest";

function BracketsTournamentPage(){

    // State to hold the tournament rounds and the champion
    const [rounds, setRounds] = useState([]);
    const [champion, setChampion] = useState(null);

    // On component mount, fetch the tournament data
    useEffect(() => {
        const tournament = test1();
        const data = getTournamentData(tournament);
        setRounds(data.rounds || []);
        setChampion(data.champion || null);
    }, []);

    // Different matches and rounds arrays to hold the teams for rendering
    let left_Team1 = [], left_Team2 = [], left_Team3 = [], left_Team4 = [];
    let right_Team1 = [], right_Team2 = [], right_Team3 = [], right_Team4 = [];
    let left_team1_Round2 = [], left_team2_Round2 = [];
    let right_team1_Round2 = [], right_team2_Round2 = [];
    let leftR3 = [], rightR3 = [];
    let final = [];

    // Check and slice the rounds
    if (rounds[0]) {
    left_Team1 = rounds[0].slice(0, 1);
    left_Team2 = rounds[0].slice(1, 2);
    left_Team3 = rounds[0].slice(2, 3);
    left_Team4 = rounds[0].slice(3, 4);
    right_Team1 = rounds[0].slice(4, 5);
    right_Team2 = rounds[0].slice(5, 6);
    right_Team3 = rounds[0].slice(6, 7);
    right_Team4 = rounds[0].slice(7, 8);
    }
    if (rounds[1]) {
    left_team1_Round2 = rounds[1].slice(0, 1);
    left_team2_Round2 = rounds[1].slice(1, 2);
    right_team1_Round2 = rounds[1].slice(2, 3);
    right_team2_Round2 = rounds[1].slice(3, 4);
    }
    if (rounds[2]) {
    leftR3 = rounds[2].slice(0, 1);
    rightR3 = rounds[2].slice(1, 2);
    }
    if (rounds[3]) {
    final = rounds[3][0]; 
    }

    
    return(
        <div className="brackets-tournament-page">
        <Navbar/>
        <Banner/>
        <RoundBar/>
        <div className="columns-row">
            <div className="brackets-column">
                {/* Left Column */}
            {left_Team1.length > 0 || left_Team2.length > 0 || left_Team3.length > 0 || left_Team4.length > 0 ? (
                <>
                    {left_Team1.map((pair, idx) => (
                        <Teams key={idx} teamNames={pair.map(team => team.name)} />
                    ))}
                    {left_Team2.map((pair, idx) => (
                        <Teams key={idx} teamNames={pair.map(team => team.name)} />
                    ))}
                    {left_Team3.map((pair, idx) => (
                        <Teams key={idx} teamNames={pair.map(team => team.name)} />
                    ))}
                    {left_Team4.map((pair, idx) => (
                        <Teams key={idx} teamNames={pair.map(team => team.name)} />
                    ))}
                </>
            ) : (
                <>
                    <Teams/>
                    <Teams/>
                    <Teams/>
                    <Teams/>
                </>
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
                {left_team1_Round2.length > 0 || left_team2_Round2.length > 0 ? (
                    <>
                        {left_team1_Round2.map((pair, idx) => (
                            <Teams key={idx} teamNames={pair.map(team => team.name)} />
                        ))}
                        {left_team2_Round2.map((pair, idx) => (
                            <Teams key={idx} teamNames={pair.map(team => team.name)} />
                        ))}
                    </>
                ) : (
                    <>
                        <Teams/>
                        <Teams/>
                    </>
                )}
            </div>
            <div className="lines3-stack">
                <div className="lines3">
                    <img src={Lines3} alt="lines"/>
                </div>
            </div>
            <div className="column-3">
                {/* Left Column semifinals */}
                {leftR3.length > 0 ? (
                    <>
                        {leftR3.map((pair, idx) => (
                            <Teams key={idx} teamNames={pair.map(team => team.name)} />
                        ))}
                    </>
                ) : (
                    <>
                        <Teams/>
                    </>
                )}
            </div>
            <div className="lines4-stack">
                <div className="lines4">
                    <img src={Lines4} alt="lines"/>
                </div>
            </div>
            <div className="column-4">
                {/* Middle column final */}
                {final.length > 0 ? (
                    <>
                        {final.map((team, idx) => (
                            <Teams key={idx} teamNames={[team.name]} />
                        ))}
                    </>
                ) : (
                    <>
                        <Teams/>
                    </>
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
                {rightR3.length > 0 ? (
                    <>
                        {rightR3.map((pair, idx) => (
                            <Teams key={idx} teamNames={pair.map(team => team.name)} />
                        ))}
                    </>
                ) : (
                    <>
                        <Teams/>
                    </>
                )}
            </div>
            <div className="lines6-stack">
                <div className="lines6">
                    <img src={Lines6} alt="lines"/>
                </div>
            </div>
            <div className="column-6">
                {/* Right Column Round 2 */}
                {right_team1_Round2.length > 0 || right_team2_Round2.length > 0 ? (
                    <>
                        {right_team1_Round2.map((pair, idx) => (
                            <Teams key={idx} teamNames={pair.map(team => team.name)} />
                        ))}
                        {right_team2_Round2.map((pair, idx) => (
                            <Teams key={idx} teamNames={pair.map(team => team.name)} />
                        ))}
                    </>
                ) : (
                    <>
                        <Teams/>
                        <Teams/>
                    </>
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
                {right_Team1.length > 0 || right_Team2.length > 0 || right_Team3.length > 0 || right_Team4.length > 0 ? (
                    <>
                        {right_Team1.map((pair, idx) => (
                            <Teams key={idx} teamNames={pair.map(team => team.name)} />
                        ))}
                        {right_Team2.map((pair, idx) => (
                            <Teams key={idx} teamNames={pair.map(team => team.name)} />
                ))}
                {right_Team3.map((pair, idx) => (
                        <Teams key={idx} teamNames={pair.map(team => team.name)} />
                ))}
                {right_Team4.map((pair, idx) => (
                        <Teams key={idx} teamNames={pair.map(team => team.name)} />
                ))}
                </>
                ) : (
                <>
                    <Teams/>
                    <Teams/>
                    <Teams/>
                    <Teams/>
                </>
                )}
            </div>
        </div>
        </div>
    );
}

export default BracketsTournamentPage;