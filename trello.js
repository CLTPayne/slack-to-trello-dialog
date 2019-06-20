const axios = require('axios');
const qs = require('querystring');
const users = require('./users');

const queryDetails = {
    params: {
        cards: 'none',
        card_fields: 'all',
        filter: 'open',
        fields: 'all',
        key: process.env.TRELLO_KEY,
        token: process.env.TRELLO_ACCESS_TOKEN
    }
}

const boardId = process.env.TRELLO_BOARD_ID;

// Get all lists / columns on the board
// Can't have top level wait so have to use a promise chain
axios.get(`https://api.trello.com/1/boards/${boardId}/lists`, queryDetails).then(response => {
    console.log("Trello boards lists:", response.data)
}).catch((error) => {
    console.log(error.message)
})

// The column of your board to add your dialog data to:
const trelloList = process.env.TRELLO_LIST_ID;

// Could add a label to the trello card based on a select / input in the dialog
// Have not done that for the current starter dialog. This might be of interest when developing 
// dialog with blockit

const sendConfirmation = async card => {
    // TODO - use block kit for this confirmation message
    // Make it appear in thread. 
    // Messages come from slack bot / how best to have a confirmation???
    try {
        const result = await axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
            token: process.env.SLACK_ACCESS_TOKEN,
            channel: card.userId,
            text: 'Bug ticket created in Trello',
            as_user: false,
            username: 'Scout Bugs',
            icon_emoji: ':bug:',
            attachments: JSON.stringify([
                {
                    title: `Trello card created by ${card.userRealName}`,
                    title_link: card.shortUrl,
                    text: card.text,
                    fields: [
                        {
                            title: 'Title',
                            value: card.title
                        },
                        {
                            title: 'Summary', 
                            value: card.summary || 'None provided'
                        }
                    ]
                }
            ])
        }))
        console.log({result})
        console.log('sendConfirmation: ', result.data);
    } catch (error) {
        console.log('sendConfirmation error: ', error);
    }
};

// Create a trello card
const createCard = async (userId, submission) => {
    const card = {};

    // logic for adding card labels here if using
    // not using card labels right now

    const fetchUserName = async () => {
        try {
            const userInfo = await users.find(userId) // logic to access the users userId 
            console.log(`Find user: ${userId}`)
            console.log('Found user:', userInfo.data.user.profile.real_name_normalized)
            return userInfo.data.user.profile.real_name_normalized
        } catch (error) {
            console.log(error)
            // How do you reveal the error to the end user?
            // throw error
        }
    }

    try {
        const userName = await fetchUserName()
        card.userId = userId;
        card.userRealName = userName;
        card.title = submission.title;
        card.summary = submission.summary;
        const result = await axios.post('https://api.trello.com/1/cards', {
            idList: trelloList, // id of the backlog list in the test board
            name: submission.title,
            desc: `${submission.summary}\n\n---\n Submitted by ${card.userRealName}`,
            key: process.env.TRELLO_KEY,
            token: process.env.TRELLO_ACCESS_TOKEN
        })
        card.shortUrl = result.data.shortUrl;
        // TODO - Received a confirmation but it was from 'Slackbot and not direct in the thread
        // This needs to be better UX
        sendConfirmation(card)
        return card
    } catch (error) {
        if (error.response) {
            // The request was made but server responded with a non 2xx
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            console.log(error.request);
        } else {
            // Something else triggered an error
            console.log('Error', error.message);
        }
        console.log(error.config)
        // How do you reveal the error to the end user?
    }    
}

module.exports = { createCard, sendConfirmation };