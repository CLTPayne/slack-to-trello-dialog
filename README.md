## A Slack Slash Command To Trello Card Integration 

### Development 
In order to test the integration with Slack you'll need to supply a URL for the setup of the Interactive Components and the Slash Commads. Rather than deploying the express app from the start, the Slack documentation suggested tunnelling. I shared the web service that was running on my local machine by using a service to tunnel all requests to my machine via a proxy url. Ngrok is one I've used previously but this time I went for [local tunnel](https://localtunnel.github.io/www/)
1. Install it globally via npm `npm install -g localtunnel`.
2. Run `lt --port 3000` with the relevant port number you're using. 
Be warned, your tunnel might go down from time to time. Just check your terminal, and restart if you get some odd errors.

For further developement ease make sure you have nodemon to watch for changes in your code and rebuild for you:
1. Install it globally as it's super handy `npm install -g nodemon`
2. Replace `node` in your run command with `nodemon`
3. For development ease you can also use the script `npm run dev` which will also watch with nodemon.
