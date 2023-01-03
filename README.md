## Welcome to Hsuite OpenSource DAPP
This repository has been created as a starting point for all of those who are willing to integrate HbarSuite infrastructure and services.
Our wish is to facilitate developers and entrepreneurs in their web3 journey, and to provide a bootstrap tool for their own DAPPs.

Up to date the only available library is done in IonicFramework + Angular, but we hope more developers will soon contribute to implement our technology in many different languages. If you are a developer and you will to help us out, please write us on [Discord](https://discord.gg/bHtu9AduNH) or send us an [Email](mailto:info@hbarsuite.network), there is an HSUITE reward waiting for good-skilled developers!!

## Installation
simply do a checkout of this repository, then run:
```bash
$ npm install
```

## Running the app
In order to run the application locally, enter the command:
```bash
ionic serve
```
## Deploying the app
If you wish to deploy your own DAPP, we strongly recommend you to use Firebase Hosting.
This app is prepared to be a PWA (Progressive Web App), which means you can also add the icon to the home screen of mobile phones easily.
In order to deploy it and use it, there are few steps needed:

1 - go to [Firebase](https://console.firebase.google.com/u/0/) and create an application 
2 - install the firebase tools in your local environment
```bash
npm install -g firebase-tools
```
3 - login into firebase from your terminal
```bash
firebase login
```
4 - run the configuration command
```bash
firebase init
```
and configure it as follows\n
"Which Firebase CLI features do you want to set up for this folder?" Choose "Configure files for Firebase Hosting and (optionally) set up GitHub Action deploys"\n
"What do you want to use as your public directory?" Enter "www".\n
"Set up automatic builds and deploys with GitHub?" Enter the option you prefer.\n
"Configure as a single-page app (rewrite all urls to /index.html)?" Enter "Yes".\n
"File www/index.html already exists. Overwrite?" Enter "No".\n
5 - send us an [Email](mailto:info@hbarsuite.network) with your project and domain, because you won't be allowed to interact with the smart-nodes unless you're whitelsted first.\n

## Customizations and Restrictions
Please feel free to change the UI/CSS as you wish, to fully match your brand and colors.
There is no limitations on the use of the existing smart-node api, which you can find here:
TESTNET\n
[Smart-Node-1](testnet-sn1.hbarsuite.network/api)\n
[Smart-Node-2](testnet-sn2.hbarsuite.network/api)\n
[Smart-Node-3](testnet-sn3.hbarsuite.network/api)\n
[Smart-Node-4](testnet-sn4.hbarsuite.network/api)\n
MAINNET\n
[Smart-Node-1](mainnet-sn1.hbarsuite.network/api)\n
[Smart-Node-2](mainnet-sn2.hbarsuite.network/api)\n
[Smart-Node-3](mainnet-sn3.hbarsuite.network/api)\n
[Smart-Node-4](mainnet-sn4.hbarsuite.network/api)\n

Please DO NOT remove the footer in the menu section, credits to HbarSuite technology is a mandatory requirement.

## License
DAPP Community Edition [HSuite Network - Open Source Licensed]
