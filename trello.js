import axios from 'axios';
import qs from 'querystring';
import { findUser } from './findUser';

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
        console.log('sendConfirmation: ', result.data.message.text);
    } catch (error) {
        console.log('sendConfirmation error: ', error);
    }
};

// Create a trello card
export const createCard = async (userId, submission) => {
    const { title, summary } = submission;
    const card = {
        userId,
        title,
        summary
    };

    const fetchUserName = async () => {
        try {
            const userInfo = await findUser(userId) // logic to access the users userId 
            console.log(`Find user: ${userId}`)
            console.log('Found user:', userInfo.data.user.profile.real_name_normalized)
            return userInfo.data.user.profile.real_name_normalized
        } catch (error) {
            console.log(error)
            // How do you reveal the error to the end user?
            // throw error
        }
    };

    try {
        card.userRealName = await fetchUserName()
        const result = await axios.post('https://api.trello.com/1/cards', {
            idList: process.env.TRELLO_LIST_ID, // id of the backlog list in the test board
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
};