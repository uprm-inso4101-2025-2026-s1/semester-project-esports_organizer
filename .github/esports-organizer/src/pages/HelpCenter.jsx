import React, { useState } from "react";
import Navbar from "../components/shared/Navbar";
import "./HelpCenter.css";
import Feedback from "../database/Feedback";


// FAQ content (visible in the UI)
const FAQS = [
  {
    topic: "Notifications",
    question: "How do I change reminder times?",
    answer:
      "You can adjust reminder times in your notification settings. The option is located in your profile or event preferences.",
  },
  {
    topic: "Notifications",
    question: "What is 'Do not disturb' and how does it work?",
    answer:
      "'Do not disturb' lets you pause notifications during certain hours. You can enable it in your notification settings.",
  },
  {
    topic: "Notifications",
    question: "Why am I not receiving any notifications?",
    answer:
      "Check your notification preferences to ensure they’re enabled, and make sure your device/browser permissions allow notifications.",
  },
  {
    topic: "Notifications",
    question: "I’m getting too many notifications. How can I reduce them?",
    answer:
      "You can update your preferences to only receive notifications for the most important updates (e.g., match times, event/tournament reminders).",
  },
  


  {
    topic: "Scheduling",
    question: "How do I add an event to my profile?",
    answer:
      "When viewing an event, you can use the 'Add to Profile' button to track it. It will appear in your upcoming events list.",
  },
  {
    topic: "Scheduling",
    question: "Can I sync my schedule with Google Calendar?",
    answer:
      "Calendar sync may be available. Look for the 'Export' or 'Sync' option in your schedule page.",
  },
  {
    topic: "Scheduling",
    question: "How do I know when my match or event is starting?",
    answer:
      "You’ll receive a notification reminder shortly before it begins, based on your selected reminder times.",
  },
  {
    topic: "Scheduling",
    question: "Can I customize how my schedule is displayed?",
    answer:
      "You may be able to switch between list view and calendar view depending on your preferences.",
  },
];

export default function HelpCenter() {
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("Notifications");
  const [category, setCategory] = useState("Not clear");
  const [comment, setComment] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);

  // Backend: handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      setStatus("Please enter a comment before submitting.");
      return;
    }

    try {
        const feedback = new Feedback({
          topic,
          category,
          comment,
          email: email || null,
        });
        await feedback.SubmitFeedback();
      
        setStatus("Feedback submitted successfully!");
        setComment("");
        setEmail("");
      } catch (error) {
        console.error("Error submitting feedback:", error);
        setStatus("Error sending feedback. Please try again.");
      }
  };

  // Filter FAQs by search
  const filteredFaqs = FAQS.filter(
    (faq) =>
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.topic.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="help-center-page">
      <Navbar />
      <div className="help-center-container">
        <h1>Help Center</h1>
        <p className="intro-text">
          Find answers to common questions or send us feedback about notifications and scheduling.
        </p>

        {/*Tabs for topics*/}
        <div className="tabs">
          <button
            className={topic === "Notifications" ? "active" : ""}
            onClick={() => setTopic("Notifications")}
          >
            Notifications
          </button>
          <button
            className={topic === "Scheduling" ? "active" : ""}
            onClick={() => setTopic("Scheduling")}
          >
            Scheduling
          </button>
        </div>

        {}
        <input
          type="text"
          className="search-input"
          placeholder="Search FAQs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/*FAQ Section*/}
        <div className="faq-section">
          {filteredFaqs
            .filter((faq) => faq.topic === topic)
            .map((faq, index) => (
              <div key={index} className="faq-item">
                <h4>{faq.question}</h4>
                <p>{faq.answer}</p>
              </div>
            ))}
        </div>

        {}
        <div className="feedback-section">
          <h2>Send us Feedback</h2>
          <form className="feedback-form" onSubmit={handleSubmit}>
            <label>Topic</label>
            <select value={topic} onChange={(e) => setTopic(e.target.value)}>
              <option>Notifications</option>
              <option>Scheduling</option>
            </select>

            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>Bug</option>
              <option>Not timely</option>
              <option>Not clear</option>
              <option>Too many</option>
              <option>Missing feature</option>
              <option>Other</option>
            </select>

            <label>Comment *</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you think..."
              required
            />

            <label>Email (optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
            />

            <button type="submit">Submit Feedback</button>
          </form>

          {status && <p className="status-message">{status}</p>}
        </div>
      </div>
    </div>
  );
}