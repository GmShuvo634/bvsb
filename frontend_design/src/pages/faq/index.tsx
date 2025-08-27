"use client";

import React, { useState, useEffect } from "react";
import FAQHeader from "@/layouts/faq_header";
import FallbackAccordion from "@/components/FallbackAccordion";
import ErrorBoundary from "@/components/ErrorBoundary";


const FAQData = [
  [
    {
      title: "How does the game work?",
      content:
        "The game is a decentralized finance (DeFi) platform, which allows players to make predictions on the price of Bitcoin. Players can join pools that predict whether the price will go up or down, and invest a certain amount of ETH to participate. The final outcome of each round is determined by the expiry rate, which is based on the live market rate of the asset at the time of the round's closing. Profits are distributed to players in the form of the ETH",
    },
    {
      title: "How are payouts handled in the Game?",
      content:
        "Payouts are handled automatically and are distributed to the winning players in the form of ETH. New rounds will not start until all previous round winners have received their earnings.",
    },
    {
      title: "Can I access this game on my mobile?",
      content:
        "Yes, you can access this game on your mobile device as long as you have a web3-enabled browser.",
    },
    {
      title: "Is the game available globally?",
      content:
        "Yes, the game is available globally and can be played on the web 3.0 platform. However, players should check with their local laws and regulations regarding the use of digital assets before playing.",
    },
    {
      title: "Key Benefits",
      content: `1. Play-to-earn: Players can earn cryptocurrency through strategic play.
      2. Web3 and decentralized technologies: The platform is built on the latest web3 and blockchain technologies, which allow for a decentralized, secure, and transparent gaming experience.
      3. No intermediaries: Web3 technologies enable peer-to-peer transactions without the need for intermediaries, giving players greater control and autonomy.
      4. Increased security and privacy: The decentralized nature of the platform ensures that player data is kept secure and private.
      5. A skill-based game: the game is a skill-based game that allows players to hone their trading skills.
      6. Multiple pools: The platform offers both Up and Down pools, giving players more options for trading and earning.
      7. Transparent and fair: The platform's smart contract ensures that all rounds are transparent and fair.
      8. High potential returns: Players can earn high returns through strategic play.
      9. A fun and engaging experience: the game is designed to be a fun and engaging experience for players.`,
    },
    {
      title: "Monthly Jackpot",
      content: `Participation Period:
      From the 1st to the last day of the calendar month (e.g., September 1st to September 30th).
      
      Winner Announcement:
      On the 2nd of the following month at 12 pm GMT on the game website (e.g., October 2nd).
      
      How to Participate:
      Every trade during the month counts as a ticket. The more trades, the more tickets, increasing your odds to win the Jackpot.
      
      Prize Pool Distribution:
      The winner will be selected randomly using random.org. Once announced, winnings will automatically be transferred to the winner's wallet.`,
    },
    {
      title: "Weekly Jackpot",
      content: `Participation Period:
      Every week, from Sunday morning 12 am GMT to the next Sunday 23:59 GMT .
      
      Winner Announcement:
      Every Monday at 12 pm GMT on the game website.
      
      Prize Pools Distribution:
      The winner will be selected randomly using random.org. Once announced, winnings will automatically be transferred to the winner's wallet.
      
      How to Win & condition to participate :
      1st Prize Pool: Complete 1500 trades a week for a chance to win in all prize pools.
      2nd Prize Pool: Complete 1000 trades a week for a chance to win 3rd, 4th, and 5th place prize pools.
      3rd Prize Pool: Complete 500 trades a week for a chance to win 4th and 5th place prize pools.
      4th Prize Pool: Complete 250 trades a week to enter the 5th place prize pool.
      5th Prize Pool: Complete 100 trades a week.`,
    },
  ],
  [
    {
      title: "What is Up pool?",
      content:
        "The UP pool is one of the two pools players can join in the game. Players who believe the price of the asset will be higher than the start price at the end of the round will join the UP pool.",
    },
    {
      title: "What is Down Pool?",
      content:
        `The Down pool is one of the two pools players can join in the game. Players who believe the price of the asset will be lower than the Start price at the end of the round will join the Down pool.`,
    },
    {
      title: "What is the Start Price?",
      content:
        `The Start price is the price at which the pool closes for new trades. The round is then waiting for the End Price, which is determined by the live market Price of the asset at the time of the round's closing. If the End Price is higher than the Start price, the up pool wins, and if it is lower, the down pool wins.`,
    },
    {
      title: "What is the End Price and how is it determined?",
      content:
        `The End price is the live market price of the asset at the time of the round closing. It is used to determine the outcome of the round and which pool wins, based on whether the End Price is higher or lower than the Start price.`,
    },
    {
      title: "What is considered a round in the game?",
      content:
        `A round in the game refers to a full cycle of play, during which players can place trades and join either the "Up" or "Down" pool. The round is divided into two parts: the time when players can place trades, and the time when the pools are closed and waiting for the End Price from the live market. At the end of the round, the outcome is determined based on whether the End Price is higher or lower than the Start price.`,
    },
    {
      title: "What is win ratio?",
      content:
        `The win ratio is a multiplier that shows the potential return on a player's investment if this pool is the winner.`,
    },
    {
      title: "What is Down Pool Payout?",
      content:
        `The Down Pool Payout % is the percentage of the total pool investment that will be distributed to players who have chosen the "Down" option and their prediction is correct. This amount is calculated based on the total amount invested in the Up pool divided to the total investment in the Down pool minus the earning fees (Please note that due to latency, the payout percentage may vary slightly. Please rest assured that the correct payout percentage is also shown on the block for that round).`,
    },
    {
      title: "What is Up Pool Payout?",
      content:
        `The Up Pool Payout % is the percentage of the total pool investment that will be distributed to players who have chosen the "Up" option and their prediction is correct. This amount is calculated based on the total amount invested in the Down pool divided by the total investment in the Up pool, minus the earning fees (Please note that due to latency, the payout percentage may vary slightly. Please rest assured that the correct payout percentage is also shown on the block for that round).`,
    },
    {
      title: `What happens during the "Waiting for mining" stage?`,
      content:
        `Waiting for mining is the process of closing and validating all pool transactions and directions on the blockchain smart contract. This process ensures the integrity and security of the game's results. At this stage, no more trades can be placed and players must wait for the final outcome to be determined.`,
    },
    {
      title: `What does the "Up" button do?`,
      content:
        `By clicking the "Up" button, you are sending a request to your digital wallet to join the smart contract for the Up pool. You will need to confirm the transaction on your digital wallet before you are added to the pool.`,
    },
    {
      title: `What does the "Down" button do?`,
      content:
        `By clicking the "Down" button, you are sending a request to your digital wallet to join a smart contract for the Down pool.You will need to confirm the transaction on your digital wallet before you are added to the pool.`,
    },
    {
      title: "Where can I find the result for the previous rounds?",
      content:
        `The outcome of each round can be seen in the "Last Results" section of the game interface. It will indicate whether the rate increased or decreased and also which pool has won. You can also click on the transaction hash to see the round on the blockchain ledger.`,
    },
    {
      title: "How can I view the amount of ETH I have invested in a pool?",
      content:
        `To view the amount of ETH you have invested in a pool, you can check the "Your Investment" field on the game's interface. This field will show you the total amount of ETH you have invested in the current pool. You can also see your total investment in the pool under your avatar in the pool you joined.`,
    },
    {
      title: "What is balance in the game?",
      content:
        `Balance refers to the amount of ETH that a player has in their digital wallet. These can be used to participate in in-game activities.`,
    },
    {
      title: "What does the Min trade Button do?",
      content:
        `The "Min trade" button sets the minimum trade amount to enter the pool. This feature allows players to easily and quickly participate in the game without manually having to calculate the minimum trade amount.`,
    },
    {
      title: "What does the Max trade Button?",
      content:
        `The "Max trade" button sets the maximum trade amount to enter the pool. This feature allows players to quickly and easily invest the maximum amount without manually having to calculate it.`,
    },
    {
      title: "How can I Use the Social chat?",
      content:
        "The Social chat allows players to communicate with each other and share their thoughts. To Enable the Social chat, you need to be connected to the game with your Digital wallet.",
    },
    {
      title: "Where can I find my trading history?",
      content:
        `You can find your trading history by clicking on the main menu and selecting the "Trading History" option. This will display a list of all of your previous trades, including the date and time of the trade, the asset, and the outcome (win or loss). Additionally, you can also view the transaction hash for each trade, which can be used to view the trade on the blockchain ledger.`,
    },
  ],
  [
    {
      title: "How do I start playing the game?",
      content:
        "To start playing, you will need to connect your digital wallet, such as MetaMask or Coinbase Wallet. If you do not have a digital wallet, you will be prompted to create one. Once connected, ensure that you have a sufficient amount of ETH in your wallet to make investments in the game. Once you have these requirements, you can start placing trades.",
    },
    {
      title: "How do I join a pool?",
      content:
        `To join a pool, you can click on either the "Up" or "Down" button on the game interface. This will send a request to your digital wallet (Meta mask or Coinbase) to join a smart contract for the selected pool. You will then need to confirm the transaction in your digital wallet before being added to the pool.`,
    },
    {
      title: "How are the round results determined in the game?",
      content:
        `The round results are determined by the End Price, which is the value of the underlying asset at the end of the round. If the End price is higher than the Start price, players in the Up pool will win, and if the End Price is lower, players in the Down pool will win.`,
    },
    {
      title: "How are profits distributed in the game?",
      content:
        `After a round has closed and the results have been determined, the smart contract will automatically transfer the profits to the digital wallets of the winning pool players. These earnings will be in the form of ETH. The game will not start a new round until all previous round winners have received their profits.`,
    },
    {
      title: "Can I invite friends to play?",
      content:
        `Yes, you can invite friends to play the game. By referring them to the game, you can earn commission from the fee of their winning trades. The commission will be automatically transferred to your digital wallet without the need to wait for it.`,
    },
    {
      title: "What are the earning fees in the game and how are they calculated?",
      content:
        `The earning fee is a percentage of the total winnings that is taken as a commission by the game. The percentage ranges from 5-10% depending on the pool and the gas fees involved. This fee is used to cover the costs of maintaining and operating the game, as well as to provide a revenue source for the game's developers. The earning fee percentage for each pool can be found in the pool details. players should be aware of this fee when calculating their potential returns.`,
    },
    {
      title: "What is the price feed source used for determining rates in the game?",
      content:
        `The game utilizes price feeds provided by the top 3 crypto exchanges to ensure accurate and reliable pricing information.`,
    },
    {
      title: "Why is DxFeed used in the game?",
      content:
        `The use of DxFeed helps to ensure the accuracy and reliability of data used in the game. It helps prevent manipulations and arbitrage by providing real-time, high-quality financial market data. This helps to ensure fair gameplay and results for all players, making the game more trustworthy and secure for all participants.`,
    },
  ],
  [
    {
      title: "What is the role of ETH in the game?",
      content: `ETH is the digital currency used in the game for all investments and payouts. Players must have a sufficient amount of ETH in their digital wallet in order to participate in the game and will receive any profits in the form of ETH as well.`
    },
  ],
  [
    {
      title: "About the Affiliate Program",
      content: `Affiliate Program, is a program that allows players to earn commission on the earnings fees of the friends they refer to the game. The program has one tiers:
        • Tier: 20% commission on earnings fees of friends referred
        To become an affiliate, players simply need to connect their digital wallet to the game and create an affiliate link on the "Create Affiliate Link" page. They can then share this link with their friends through various networks and channels. Any friend who joins the game through the link will be connected to the referring player, and the player will receive commission on a daily basis at 12:00 GMT. Earnings can be tracked in the "Affiliate Earnings Report." It's important to note that to maximize earnings as an affiliate, players should make sure their referrals are actively playing the game on a daily basis. This is because commission is only earned on the earnings fees of referred friends. Additionally, there is no limit to the number of affiliates links a player can create, so they can use different links for different networks or marketing channels to optimize their earnings.`,
    },
    {
      title: "How do I become an affiliate?",
      content: `Becoming an affiliate is simple! All you need to do is connect your digital wallet to the game and create an affiliate link on the Link Manager page. Once you have your link, you can share it with your friends and network on various platforms.`
    },
    {
      title: "How much commission can I earn as an affiliate?",
      content: `As an affiliate, you will earn a commission on a tiered system. For tier one, you will earn 20% of the earnings fees your friends pay to the game.`
    },
    {
      title: "How do I maximize my earnings as an affiliate?",
      content: `To maximize your earnings, you should make sure your friends and referrals are playing the game on a daily basis. You can also create multiple links and promote them on different social channels or marketing channels to bring in more players.`
    },
    {
      title: "How will I receive my affiliate commissions?",
      content: `You can view all your earnings in your Affiliate Earnings Report.`
    },
    {
      title: "Are there any limits to the number of links I can create?",
      content: `There is no limit to the number of links you can create as an affiliate, this way you can maximize your earning potential.`
    },
    {
      title: "Are the commissions only paid out on my friend's earnings?",
      content: `Yes, the commission is based on the earnings fees your friends pay to the game and it will be paid out only when your friends make money.`
    },
    {
      title: "How do I check my affiliate earnings?",
      content: `You can check your affiliate earnings in the Affiliate Earnings Report, which is available in your account dashboard.`
    },
    {
      title: "Can I earn passive income with the affiliate program?",
      content: `Yes, the affiliate program allows you to earn a daily passive income based on your friends' earnings fees.`
    },
    {
      title: "Is there a limit to how much I can earn as an affiliate?",
      content: `There is no limit to how much you can earn as an affiliate, you can earn as much as you can bring players to the game.`
    },
  ],
  [
    {
      title: "How often are the weekly jackpots held?",
      content:
        "Weekly jackpots run from Sunday morning to Sunday midnight every week. Winners are announced every Monday at 12 pm GMT on the game website.",
    },
    {
      title: "How to win the weekly Jackpot?",
      content: `Engage in the thrill of our Weekly Jackpot every week from Sunday 12 am GMT to the next Sunday 23:59 GMT.
      Winners, chosen randomly through random.org, are announced on Mondays at 12 pm GMT.
      There are five enticing prize pools waiting for you:
      1st Prize Pool: Complete 1500 trades a week. also has a chance to win in all prize pools.
      2nd Prize Pool: Complete 1000 trades a week. also has a chance to win 3rd, 4th, and 5th place prize pools.
      3rd Prize Pool: Complete 500 trades a week. also has a chance to win 4th and 5th place prize pools.
      4th Prize Pool: Complete 250 trades a week. also has a chance to win 5th place prize pool.
      5th Prize Pool: Complete 100 trades a week.
      Be sure to check the specific prize pool conditions on the Weekly Jackpot page. Your journey to potential winnings starts with every trade!`
    },
    {
      title: "How many winners are there in the weekly jackpot?",
      content: `There are five weekly jackpot winners. Every jackpot pool level one winner.`
    },
    {
      title: "How is participation determined for the weekly jackpots?",
      content: `Participation is based on the number of trades made in a week: How to Win & condition to participate : 1st Prize Pool: Complete 1500 trades a week. also has a chance to win in all prize pools. 2nd Prize Pool: Complete 1000 trades a week. also has a chance to win 3rd, 4th, and 5th place prize pools. 3rd Prize Pool: Complete 500 trades a week. also has a chance to win 4th and 5th place prize pools. 4th Prize Pool: Complete 250 trades a week. also has a chance to win 5th place prize pool. 5th Prize Pool: Complete 100 trades a week.`
    },
    {
      title: "How are Weekly Jackpot winners selected?",
      content: `Winners are chosen randomly using random.org to ensure fairness and transparency.`
    },
    {
      title: "Can I participate in both weekly and monthly jackpots simultaneously?",
      content: `Yes, you can participate in both the weekly and monthly jackpots based on your trade activity.`
    },
    {
      title: "Is there a limit to the number of jackpots a player can win?",
      content: `No, there is no limit. Players can win multiple times based on their participation and luck.`
    },
    {
      title: "Is there a cost to participate in the jackpots?",
      content: `No, participation in the jackpots is based on your trading activity. There are no additional costs or fees.`
    },
    {
      title: "Can I increase my chances of winning the jackpot?",
      content: `Yes, by making more trades, you can increase your chances of winning. Each trade serves as a ticket for the jackpot.`
    },
    {
      title: "Is there a limit to the number of trades I can make to qualify for the jackpots?",
      content: `There is no maximum limit. The more trades you make, the higher your chances of winning.`
    },
    {
      title: "When and how are the weekly winnings transferred to the winners?",
      content: `Jackpot winnings are automatically transferred to the winners' wallets. For weekly jackpots, this occurs on Mondays.`
    },
  ],
  [
    {
      title: "How to Play the Monthly Jackpot?",
      content:
        "Embark on a monthly gaming adventure in our Monthly Jackpot, active from the 1st to the last day of the calendar month (e.g., September 1st to September 30th). Winners are revealed on the 2nd of the following month at 12 pm GMT. Each trade made during the month acts as your ticket, increasing your odds to win in the jackpot. The lucky winner, chosen through random.org, takes home the entire monthly jackpot prize, creating a thrilling opportunity for everyone. Be sure to participate, track your trades, and anticipate the exciting draw at the end of the month! Check the Monthly Jackpot page for specific prize pool conditions and get ready for a chance at substantial rewards!",
    },
    {
      title: "How do monthly jackpots run?",
      content: `Monthly jackpots run from the first to the last day of the calendar month. Winners are announced on the 2nd of the following month at 12 pm GMT on the game website.`
    },
    {
      title: "How is participation determined for the monthly jackpot?",
      content: `Every trade made counts as a ticket for the monthly jackpot. The more trades you make, the more tickets you have, increasing your chances to win.`
    },
    {
      title: "How are winners selected?",
      content: `Winners are chosen randomly using random.org to ensure fairness and transparency.`
    },
    {
      title: "When and how are the monthly winnings transferred to the winners?",
      content: `Jackpot winnings are automatically transferred to the winners' wallets. for monthly jackpots, it happens on the 2nd of the following month.`
    },
    {
      title: "Can I participate in the weekly and monthly jackpots simultaneously?",
      content: `Yes, you can participate in both the weekly and monthly jackpots based on your trade activity.`
    },
    {
      title: "Is there a limit on the number of jackpots a player can win?",
      content: `No, there is no limit. Players can win multiple times based on their participation and luck.`
    },
    {
      title: "Is there an additional cost to participate in the jackpots?",
      content: `No, participation in the jackpots is based on your trading activity. There are no additional costs or fees.`
    },
    {
      title: "Can I increase my chances of winning the monthly jackpot?",
      content: `Yes, by making more trades, you increase your chances of winning. Each trade serves as a ticket for the jackpot.`
    },
    {
      title: "Is there a limit on the number of trades I can make to qualify for the jackpots?",
      content: `There is no maximum limit. The more trades you make, the higher your chances of winning.`
    },
    {
      title: "Can I track my jackpot participation in real-time?",
      content: `Yes, your trade activity and jackpot participation can be tracked in real-time within your account on the jackpot page.`
    },
    {
      title: "Where does the prize pool for the jackpot come from?",
      content: `The jackpot prize pool is generated from a percentage of the earning fees collected within the game. A portion of these fees is dedicated to the weekly and monthly jackpot prizes, allowing players the chance to win substantial rewards based on their trading activity.`
    },
    {
      title: "How many winners are there in the monthly jackpot?",
      content: `There is one winner in the monthly jackpot. One lucky participant takes home the entire monthly jackpot prize, making it an exciting opportunity for everyone!`
    },
  ],
];

interface IconProps {
  id: number;
  open: number;
}

function Icon({ id, open }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={`${
        id === open ? "rotate-180" : ""
      } h-5 w-5 transition-transform text-gray-400 absolute right-0 top-2`}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
      />
    </svg>
  );
}

interface FAQItemProps {
  title: string;
  content: string;
}

const FAQItem = ({ title, content }: FAQItemProps) => {
  // Use the fallback accordion directly to avoid Material Tailwind issues
  return <FallbackAccordion title={title} content={content} />;
};

export default function Home() {
  const [selectedFaqItem, setSelectedFaqItem] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering Material Tailwind components until mounted
  if (!mounted) {
    return (
      <div className="flex flex-row justify-between w-screen">
        <div className="w-full transition-all duration-1000 ease-in-out">
          <FAQHeader
            setSelectedFaqItem={(item) => setSelectedFaqItem(item)}
          />
          <div className="flex flex-col gap-4">
            <div className="text-white text-center p-8">Loading FAQ...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-row justify-between w-screen">
          <div className="w-full transition-all duration-1000 ease-in-out">
            <FAQHeader
              setSelectedFaqItem={(item) => setSelectedFaqItem(item)}
            />
            <div className="flex flex-col gap-4">
              {FAQData[selectedFaqItem].map((item, index) => {
                return (
                  <FallbackAccordion key={index} title={item.title} content={item.content} />
                );
              })}
            </div>
          </div>
        </div>
      }
    >
      <div className="flex flex-row justify-between w-screen">
        <div className="w-full transition-all duration-1000 ease-in-out">
          <FAQHeader
            setSelectedFaqItem={(item) => setSelectedFaqItem(item)}
          />
          <div className="flex flex-col gap-4">
            {FAQData[selectedFaqItem].map((item, index) => {
              return (
                <FAQItem key={index} title={item.title} content={item.content} />
              );
            })}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
