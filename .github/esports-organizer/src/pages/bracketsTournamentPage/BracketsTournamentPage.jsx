import "./BracketsTournamentPage.css";
import Navbar from "../../components/bracketsPage/navbar/Navbar";
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
import WinnersLine from "../../lines/winnersline.svg";


function BracketsTournamentPage(){
    return(
        <div className="brackets-tournament-page">
        <Navbar/>
        <Banner/>
        <RoundBar/>
        <div className="columns-row">
            <div className="column">
                <Teams/>
                <Teams/>
                <Teams/>
                <Teams/>
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
                <Teams/>
                <Teams/>
            </div>
            <div className="lines3-stack">
                <div className="lines3">
                    <img src={Lines3} alt="lines"/>
                </div>
            </div>
            <div className="column-3">
                <Teams/>
            </div>
            <div className="lines4-stack">
                <div className="lines4">
                    <img src={Lines4} alt="lines"/>
                </div>
            </div>
            <div className="column-4">
                <Teams/>
                <div className="winnersline">
                    <img src={WinnersLine} alt="winners line"/>
                </div>
                <WinningTeam/>
            </div>
            <div className="lines5-stack">
                <div className="lines5">
                    <img src={Lines5} alt="lines"/>
                </div>
            </div>
            <div className="column-5">
                <Teams/>
            </div>
            <div className="lines6-stack">
                <div className="lines6">
                    <img src={Lines6} alt="lines"/>
                </div>
            </div>
            <div className="column-6">
                <Teams/>
                <Teams/>
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
                <Teams/>
                <Teams/>
                <Teams/>
                <Teams/>
            </div>
        </div>
        </div>
    );
}

export default BracketsTournamentPage;