import React, { useState } from "react";
import Step1Basics from "../events/steps/Step1Basics";
import Step2DateTime from "../events/steps/Step2DateTime";
import Step3Limits from "../events/steps/Step3Limits";
import Step4Review from "../events/steps/Step4Review";
import Navbar from "../components/shared/Navbar";
import "./CreateEventPage.css";

const INITIAL_DATA = {
  title: "",
  game: "",
  modality: "Teams",
  date: "",
  time: "",
  maxTeams: "",
  maxPlayersPerTeam: "",
};

export default function CreateEventWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_DATA);

  const next = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep((prev) => prev + 1);
  };

  const back = () => setStep((prev) => prev - 1);

  const handleSubmit = () => {
    console.log("Submitted data:", formData);
    // TODO: save to Firebase or your backend here
    alert("Event created!");
  };

  return (
    <div className="create-event-page">
      <Navbar />
      {step === 1 && <Step1Basics data={formData} onNext={next} />}
      {step === 2 && <Step2DateTime data={formData} onNext={next} onBack={back} />}
      {step === 3 && <Step3Limits data={formData} onNext={next} onBack={back} />}
      {step === 4 && <Step4Review data={formData} onBack={back} onSubmit={handleSubmit} />}
    </div>
  );
}