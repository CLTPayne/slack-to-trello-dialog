const axios = require('axios');
const debug = require('debug');
const qs = require('querystring');

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
        console.error(error)
    }
    
    
}