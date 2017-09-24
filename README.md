# Cockpit Bot

Cockpit is an experimental chatbot I built using Microsoft Bot Framework, Node.js, Express, MongoDB which help user to explore travel option and search cheap flight (used **amadeus API**).

# [Demo](http://cockpit.herokuapp.com/) 

# Usage

To use Cockpit clone the GitHub repository using Git.

```
git clone https://github.com/Zahidul-Islam/cockpit.bot.git
cd cockpit.bot
npm install
```

## Update environment variables

Rename `.env.template` file to `.env` using `mv .env.template .env`

Update properties in **.env** file
```
AmadeusAPIKey=          // Optional
AmadeusBaseURL=         // Optional
AppId=                  // Microsoft Bot AppId
AppPassword=            // Microsoft App Password
AppBaseUrl=             // Optional
MONGODB_URL=            //Mongodb URL
```

Run `npm run start`

CockpitBot is running on [www.localhost:3978](www.localhost:3978)

## Download Microsoft [BotFramework-Emulator](https://github.com/Microsoft/BotFramework-Emulator/releases) 

You can fine more information about how to use BotFramework Emulator [here](https://docs.microsoft.com/en-us/bot-framework/debug-bots-emulator)

# Resources

- Best place to learn [Microsoft Bot Framework](https://docs.microsoft.com/en-us/bot-framework/)
