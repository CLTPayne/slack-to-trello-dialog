import axios from 'axios';
import qs from 'querystring'

export const findUser = slackUserId => {
    const body = {
        token: process.env.SLACK_ACCESS_TOKEN,
        user: slackUserId
    };
    return axios.post('https://slack.com/api/users.info', qs.stringify(body))
};