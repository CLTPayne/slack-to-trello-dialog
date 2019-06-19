require('dotenv').config();

const bodyParser = require('body-parser');
const qs = require('qs');
const axios = require('axios');
const debug = require('debug')('slash-command-template:index');
const express = require('express');
const app = express();
const trello = require('./trello')

const PORT = process.env.PORT || 3000;

// Parse urlencoded bodies with the qs library
// parse application/x-www-form-urlencoded
// Slack sends data from a slash command as 'application/x-www-form-urlencoded'
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Working!')
})

// End point to handle user hitting the slash command
// Responding with a slack dialog / form
app.post('/command', async (req, res) => {
    // token = veifiaction but this is depriacted for signing secret
    // TODO - upgrade this https://api.slack.com/docs/verifying-requests-from-slack#signing_secrets_admin_page
    // text is used as the default title in the dialog
    // trigger_id is used to respond to the command by opening a dialog
    const { token, text, trigger_id } = req.body;
    if (token === process.env.SLACK_VERIFICATION_TOKEN) {
        // Use the blockkit builder to create better json for this form??
        // Is the callback_id the button name? 
        // Add some an upload element for an image or video of the bug
        const dialog = {
            token: process.env.SLACK_ACCESS_TOKEN,
            trigger_id,
            dialog: JSON.stringify({
                title: 'Submit a new scout 🐞🐛',
                callback_id: 'submit_bug',
                submit_label: 'Submit',
                elements: [
                    {
                        label: 'Bug Title',
                        type: 'text',
                        name: 'title',
                        value: text,
                        hint: 'Summary of the issue you have discovered'
                    },
                    {
                        label: 'Summary',
                        type: 'textarea',
                        name: 'summary',
                        value: 'Whats the issue and who / what does it impact'
                    }, 
                    {
                        label: 'Steps to reproduce',
                        type: 'textarea',
                        name: 'steps_to_reproduce',
                        value: `1. Visit the scout homepage...`
                    },
                    {
                        label: 'Link to page',
                        type: 'text',
                        name: 'link',
                        value: 'Link to page effected'
                    }
                ]
            })
        };

        try {
            const result = await axios.post('https://slack.com/api/dialog.open', qs.stringify(dialog));
            // See what the error is with this. Debug seems nonsense!
            console.log(result.data.response_metadata.messages)
            debug('dialog.open: %o', result.data);
            res.send('');
        } catch (error) {
            debug('dialog.open failed: %o', error);
            res.sendStatus(500);
        }
    } else {
        debug('Verification token mismatch');
        // not good practise to just send a 500 
        // TODO - send a text response to say sorry didn't work https://api.slack.com/slash-commands
        res.sendStatus(500);
    }
});

app.post('/interactive-component', (req, res) => {
    const body = JSON.parse(req.body.payload);

    if (body.token === process.env.SLACK_VERIFICATION_TOKEN) {
        debug(`New bug submission received: ${body.submission.trigger_id}`);

        // Immediately respond with an empty 200 response to let Slcak know the command was received
        res.send('');

        // create Trello card
        trello.createCard(body.user.id, body.submission);
    } else {
        debug('Failure. Tokens do not match!');
        res.sendStatus(500)
    }
});


// Use localtunnel to expose local development web service
app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`)
});