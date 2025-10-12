import 'dotenv/config';
import { sendTemplatedEmail } from "./adapters/emailAdapter.js";

async function testEmails() {
  const mockRecipient = "testuser@example.com"; // replace with your actual test email
  const appName = "Esports Organizer";

  try {
    // Event Reminder
    await sendTemplatedEmail({
      to: mockRecipient,
      subject: "Reminder: Upcoming Event",
      template: "event-reminder",
      context: {
        recipientName: "Alice",
        eventName: "Summer Esports Tournament",
        eventDate: "Oct 15, 2025 - 3:00 PM",
        eventLocation: "Main Arena",
        appName
      }
    });

    // Event Updated
    await sendTemplatedEmail({
      to: mockRecipient,
      subject: "Event Updated: Check the new details",
      template: "event-updated",
      context: {
        recipientName: "Alice",
        eventName: "Summer Esports Tournament",
        eventDate: "Oct 16, 2025 - 4:00 PM", // updated date/time
        eventLocation: "Main Arena - Room B",
        appName
      }
    });

    // Registration Confirmation
    await sendTemplatedEmail({
      to: mockRecipient,
      subject: "Registration Confirmation",
      template: "registration-confirmation",
      context: {
        recipientName: "Alice",
        eventName: "Summer Esports Tournament",
        eventDate: "Oct 15, 2025 - 3:00 PM",
        eventLocation: "Main Arena",
        appName
      }
    });

    console.log("\n All test emails sent successfully!");
  } catch (error) {
    console.error("\n Error sending test emails:", error);
  }
}

// Run the test
testEmails();
