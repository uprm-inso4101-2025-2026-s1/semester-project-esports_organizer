
import React from "react";
import "./Round.css";

function Round({ labels = [] }) {
	return (
		<div className="round-bar">
			{labels.map((label, idx) => (
				<div className="round-label" key={idx}>{label}</div>
			))}
		</div>
	);
}

export default Round;
