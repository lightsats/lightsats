require("dotenv").config();
import fetch, { Headers } from "node-fetch";
const appUrl = process.env.LIGHTSATS_URL;
const appApiKey = process.env.LIGHTSATS_API_KEY;

if (!appUrl || !appApiKey) {
  throw new Error("LIGHTSATS_URL or LIGHTSATS_API_KEY unset");
}

type Reminder = {}; // fields exist, but are not required to be read by the scheduler.
type Tip = { id: string }; // fields exist, but are not required to be read by the scheduler.
type User = { id: string }; // fields exist, but are not required to be read by the scheduler.

async function getExpiredTips(): Promise<Tip[]> {
  const requestHeaders = new Headers();
  requestHeaders.append("Accept", "application/json");

  const response = await fetch(
    `${appUrl}/api/tipper/tips?expired=true&reclaimable=true&apiKey=${appApiKey}`,
    {
      method: "GET",
      headers: requestHeaders,
    }
  );
  if (response.ok) {
    const responseData = (await response.json()) as Tip[];
    return responseData;
  } else {
    throw new Error(
      "Get expired tips returned unexpected HTTP status: " + response.status
    );
  }
}

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

async function getUsersWithRefundableTips(): Promise<User[]> {
  const requestHeaders = new Headers();
  requestHeaders.append("Accept", "application/json");

  const response = await fetch(
    `${appUrl}/api/users?refundable=true&hasLightningAddress=true&apiKey=${appApiKey}`,
    {
      method: "GET",
      headers: requestHeaders,
    }
  );
  if (response.ok) {
    const responseData = (await response.json()) as User[];
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

async function reclaimTip(tip: Tip) {
  const requestHeaders = new Headers();
  requestHeaders.append("Accept", "application/json");

  const response = await fetch(
    `${appUrl}/api/tipper/tips/${tip.id}/reclaim?apiKey=${appApiKey}`,
    {
      method: "POST",
      headers: requestHeaders,
    }
  );
  if (!response.ok) {
    throw new Error(
      "Reclaim tip returned unexpected HTTP status: " + response.status
    );
  }
}

async function processRefund(user: User) {
  const requestHeaders = new Headers();
  requestHeaders.append("Accept", "application/json");

  const response = await fetch(
    `${appUrl}/api/users/${user.id}/refundToLightningAddress?apiKey=${appApiKey}`,
    {
      method: "POST",
      headers: requestHeaders,
    }
  );
  if (!response.ok) {
    throw new Error(
      "Reclaim tip returned unexpected HTTP status: " + response.status
    );
  }
}

console.log("Lightsats scheduler - connecting to " + appUrl);

(async () => {
  await processReminders();
  await processExpiredTips();
  await processRefunds();
  console.log("Done");
})();

async function processReminders() {
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
  console.log("Lightsats scheduler - sent " + sentReminders + " reminders");
}

async function processExpiredTips() {
  const expiredTips = await getExpiredTips();
  let tipsReclaimed = 0;
  console.log("Found " + expiredTips.length + " expired tips");
  for (const tip of expiredTips) {
    try {
      await reclaimTip(tip);
      process.stdout.write(".");
      tipsReclaimed++;
    } catch (error) {
      console.error("Failed to reclaim tip", tip, error);
    }
  }
  console.log(
    "Lightsats scheduler - reclaimed " + tipsReclaimed + " expired tips"
  );
}

async function processRefunds() {
  const users = await getUsersWithRefundableTips();
  let usersRefunded = 0;
  console.log(
    "Found " +
      users.length +
      " users with lightning address and refundable tips"
  );
  for (const user of users) {
    try {
      await processRefund(user);
      process.stdout.write(".");
      usersRefunded++;
    } catch (error) {
      console.error("Failed to refund user", user, error);
    }
  }
  console.log("Lightsats scheduler - refunded " + usersRefunded + " users");
}
