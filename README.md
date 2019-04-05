# NHS login onboarding site

Built upon the NHS.UK prototype kit, this site contains the prototype, prototype history and is able to output files for the live service

## Prerequisite

The docs folder has been rebuilt to host the version history of the site

## Running the application

Run the project in development mode `npm run watch` and visit <a href="http://localhost:3000">http://localhost:3000</a>.

## Testing the live service
Navigate to the public folder `cd public` and run the simple python server `python -m SimpleHTTPServer 8000` and then visit <a href="http://localhost:8000">http://localhost:8000</a>

## Building the live service

To build the live service run the following command `npm public`. The public folder is cleared and rebuilt everytime the command is run. The AWS watches for changes in this folder so when any changes are pushed to the master branch the site will be redeployed.

