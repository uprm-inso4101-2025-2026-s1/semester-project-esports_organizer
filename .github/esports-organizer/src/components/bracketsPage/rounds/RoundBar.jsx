
import React from "react";
import Round from "./Round";
import "./RoundBar.css";

function RoundBar() {
	return (
		<div className="round-bar-row">
			<div className="round-bar-left">
				<Round labels={["Round 1", "Round 2", "Semi-Finals"]} />
			</div>
			<div className="round-bar-center">
				<Round labels={["Finals"]} />
			</div>
			<div className="round-bar-right">
				<Round labels={["Semi-Finals", "Round 2", "Round 1"]} />
			</div>
		</div>
	);
}

export default RoundBar;
