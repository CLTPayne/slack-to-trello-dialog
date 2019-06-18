const axios = require('axios');
const debug = require('debug');
const qs = require('querystring');
const users = require('./users');

// Create a new instance of axios with custom config:
const trelloApi = axios.create({
    baseURL: 'https://api.trello.com/1',
    timeout: 1000,
    params: {
        key: process.env.TRELLO_KEY,
        token: process.env.TRELLO_ACCESS_TOKEN
    }
});

const boardId = process.env.TRELLO_BOARD_ID;

trelloApi.get(`/boards/${boardId}/lists`).then(response => {
    console.log("Trello board lists:", response.data)
})

// The column of your board to add your dialog data to:
const trelloList = process.env.TRELLO_LIST_ID;

// Could add a label to the trello card based on a select / input in the dialog
// Have not done that for the current starter dialog. This might be of interest when developing 
// dialog with blockit

const sendConfirmation = card => {
    try {
        const result = axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
            token: process.env.SLACK_ACCESS_TOKEN,
            channel: card.userId,
            text: 'Bug ticket created in Trello',
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
        debug('sendConfirmation: %o', result.data);
    } catch (error) {
        debug('sendConfirmation error: %o', error);
        console.error(error);
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
            debug(`Find user: ${userId}`)
            console.log(userName.data.user)
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
        const result = await trelloApi.post('/cards', qs.stringify({
            idList: trelloList, // id of the backlog list in the test board
            name: submission.title,
            desc: `${submission.summary}\n\n---\n Submitted by ${card.userRealName}`,
        }))
        card.shortUrl = result.data.shortUrl;
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