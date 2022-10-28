export enum Routes {
  home = "/",
  tips = "/tips",
  newTip = "/tips/new",
  fundTip = "/tips/fund",
  withdraw = "/withdraw",
  tipperWithdraw = "/withdraw?flow=tipper",
  profile = "/profile",
  scoreboard = "/scoreboard",
  emailSignin = "/auth/signin/email",
  lnurlAuthSignin = "/auth/signin/lnurl",
  journeyClaimed = "/journey/claimed",
  journeyBitcoin = "/journey/bitcoin",
  journeySelectWallet = "/journey/wallet",
  journeyCongratulations = "/journey/congratulations",
  journeyNextSteps = "/journey/next",
}

export const bitcoinJourneyPages = [
  Routes.journeyClaimed,
  Routes.journeyBitcoin,
  Routes.journeySelectWallet,
  Routes.withdraw,
  Routes.journeyCongratulations,
];
