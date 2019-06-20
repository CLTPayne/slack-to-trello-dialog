import axios from 'axios';

export const find = slackUserId => {
    const body = {
        token: process.env.SLACK_ACCESS_TOKEN,
        user: slackUserId
    };
    return axios.post('https://slack.com/api/users.info', body)
};