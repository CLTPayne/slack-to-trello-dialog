require('dotenv').config();

const bodyParser = require('body-parser');
const qs = require('qs');
const axios = require('axios');
const debug = require('debug')('slash-command-template:index');
const express = require('express');
const app = express();

// Parse urlencoded bodies with the qs library
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Working!')
})

// End point to handle user hitting the slash command
// Responding with a slack dialog / form
app.post('/commands', async (req, res) => {
    const { token, text, trigger_id } = req.body;

    if (token === process.env.SLACK_VERIFICATION_TOKEN) {
        // Use the blockkit builder to create better json for this form??
        // Is the callback_id the button name? 
        // Add some an upload element for an image or video of the bug
        const dialog = {
            token: process.env.SLACK_ACCESS_TOKEN,
            trigger_id,
            dialog: JSON.stringify({
                title: 'Submit a new 🐞to the scout roadmap',
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
            debug('dialog.open: %o', result.data);
            res.send('');
        } catch (error) {
            debug('dialog.open failed: %o', error);
            res.sendStatus(500);
        }
    } else {
        debug('Verification token mismatch');
        res.sendStatus(500);
    }
})