import { Text } from "@nextui-org/react";
import type { NextPage } from "next";
import Head from "next/head";

const TermsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Lightsats⚡ - Terms & Conditions</title>
      </Head>
      <h2>Terms & Conditions</h2>
      <Text
        css={{ whiteSpace: "pre-line" }}
        dangerouslySetInnerHTML={{
          __html: `
<b>Last updated: February 25, 2025</b>

Welcome to Lightsats! By accessing and using our platform, you agree to the following terms and conditions.

<b>Platform Purpose</b>

Lightsats is an open-source platform designed to onboard users to Bitcoin via the Lightning Network. It allows users (referred to as "Tippers") to fund Bitcoin invoices and send them as gifts, which recipients ("Tippees") can redeem by scanning a QR code, using a link, or entering a set of magic words.

<b>Eligibility</b>

Lightsats is an open platform with no restrictions on who can use it. Since it is open-source, anyone can fork the code and run their own instance. The official repository is available at GitHub.

<b>Account Registration & Authentication</b>

Users can authenticate using LNURL-Auth, SMS, or email.
Users can create multiple accounts.
If an account is compromised, the user must contact support@lightsats.com immediately.

<b>Use of the Platform</b>

Tippers can send Bitcoin gifts to Tippees, who can then withdraw the Bitcoin to their own wallet.
Lightsats provides educational resources and links to partners, wallets, and services in the Bitcoin Lightning ecosystem.
Users must not engage in fraud, abuse, or spam.
Bitcoin Transactions
Once withdrawn, Bitcoin transactions are irreversible.
Tippers can set an expiry date for their gifts. If a Tippee does not redeem the Bitcoin before expiry, it will be automatically refunded to the Tipper.
If a Tippee withdraws their Bitcoin before the expiry date, no refunds or dispute resolution is available.

<b>Liability & Disclaimers</b>

Lightsats does not take responsibility for lost funds, failed transactions, or third-party services used in connection with the platform.
Users cannot delete their accounts themselves. To request account deletion, users must email support@lightsats.com.
Lightsats reserves the right to ban users who violate these terms.

<b>Changes to the Terms</b>

We reserve the right to update these Terms & Conditions at any time. Updates will be posted on this page, and continued use of Lightsats constitutes acceptance of the revised terms.

For any questions, please contact support@lightsats.com.`,
        }}
      ></Text>
    </>
  );
};

export default TermsPage;
