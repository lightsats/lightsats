require("dotenv").config();
import fetch, { Headers } from "node-fetch";
const appUrl = process.env.LIGHTSATS_URL;
const appApiKey = process.env.LIGHTSATS_API_KEY;

if (!appUrl || !appApiKey) {
  throw new Error("LIGHTSATS_URL or LIGHTSATS_API_KEY unset");
}

type Reminder = {}; // fields exist, but are not required to be read by the scheduler.

async function getReminders(): Promise<Reminder[]> {
  const requestHeaders = new Headers();
  requestHeaders.append("Accept", "application/json");

  const response = await fetch(`${appUrl}/api/reminders?apiKey=${appApiKey}`, {
    method: "GET",
    headers: requestHeaders,
  });
  if (response.ok) {
    const responseData = (await response.json()) as Reminder[];
    return responseData;
  } else {
    throw new Error(
      "Get reminders returned unexpected HTTP status: " + response.status
    );
  }
}
async function sendReminder(reminder: Reminder) {
  const requestHeaders = new Headers();
  requestHeaders.append("Accept", "application/json");

  const response = await fetch(`${appUrl}/api/reminders?apiKey=${appApiKey}`, {
    method: "POST",
    headers: requestHeaders,
    body: JSON.stringify(reminder),
  });
  if (!response.ok) {
    throw new Error(
      "Post reminders returned unexpected HTTP status: " + response.status
    );
  }
}

console.log("Lightsats scheduler - connecting to " + appUrl);

(async () => {
  const reminders = await getReminders();
  let sentReminders = 0;
  console.log("Found " + reminders.length + " reminders");
  for (const reminder of reminders) {
    try {
      await sendReminder(reminder);
      process.stdout.write(".");
      sentReminders++;
    } catch (error) {
      console.error("Failed to send reminder", reminder, error);
    }
  }
  console.log("Done");
  console.log("Lightsats scheduler - sent " + sentReminders + " reminders");
})();
