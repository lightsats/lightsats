import { Text } from "@nextui-org/react";
import type { NextPage } from "next";
import Head from "next/head";

const TermsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Lightsats⚡ - Privacy Policy</title>
      </Head>
      <h2>Privacy Policy</h2>
      <Text
        css={{ whiteSpace: "pre-line" }}
        dangerouslySetInnerHTML={{
          __html: `
<b>Last updated: February 25, 2025</b>

This Privacy Policy explains how Lightsats collects, stores, and uses user data.

<b>Data Collection</b>

We collect minimal user data, which includes:
- Public key (from LNURL-Auth)
- Phone number (for SMS login)
- Email (for authentication via email)
- We do not collect IP addresses, device information, or analytics.

<b>Purpose of Data Collection</b>

We collect this data strictly for authentication purposes.

Additionally, for Tippees, we track their onboarding process, including:
- When they first see their Bitcoin gift
- When they authenticate
- Their progress through onboarding steps
- When they withdraw their Bitcoin

<b>Data Storage & Retention</b>

Data is stored securely on fly.io.
User data is retained until a deletion request is received.

<b>Data Sharing</b>

SMS authentication: Phone numbers are shared with SMS4Sats, which relays messages through Twilio.
Email authentication: Email addresses are shared with ZohoMail for sending authentication magic links.
We do not share data with any other third parties.
We will not disclose user data if requested by law enforcement.

<b>User Rights & Control</b>

Users can request data deletion by contacting support@lightsats.com.
Users cannot download their own data directly, but they may request a data export by contacting support@lightsats.com.

<b>Cookies & Tracking</b>

We do not use cookies or any tracking tools.

<b>Changes to the Privacy Policy</b>

We may update this Privacy Policy from time to time. Any changes will be posted here, and continued use of Lightsats constitutes acceptance of the updated policy.

For any privacy-related questions, please contact support@lightsats.com.`,
        }}
      ></Text>
    </>
  );
};

export default TermsPage;
