# SECDEV CVR Dashboard

## Application Dependencies:

The frontend application relies on three separate code repositories that must be downloaded and setup before the application can run. This repo should be placed in a parent directory along with the three other repos. The back-end portion of this application relies on Docker as a dependency. For more information on Docker see the [Docker documentation](https://docs.docker.com/)

Example directory structure:

```
.
|- secdev-application
|- secdev-database
|- secdev-docker-compose
|- secdev-tile-server
```

The application will also need to be configured in order to be fully functional. See the section below on configuration.

## Running the app in a docker container

The entire application can be run in a Docker container. Please note that building the docker image will take 10-20 minutes.

**NOTES:**

1. Before running any commands to start the application, see the section below on "Configuring the application with your data"
2. Docker desktop must have access to 4gb of ram in order to build the application.

To run the application in a Docker container:

1. Download and organize the four repos as mentioned above.
2. Follow the instructions to add data in the README.md file found in the **secdev-database** repository.
3. Navigate into (`cd` into) the **secdev-docker-compose** directory and run:

```
docker-compose up --build
```

After everything has run, you can view your application running at localhost:80

## Run app locally

General Steps for running the application locally for development:

1. Download and organize the four repos as mentioned above.
2. Follow the instructions to add data in the README.md file found in the **secdev-database** repository.
3. Navigate into (`cd` into) the **secdev-docker-compose** directory and run `docker-compose up --build`
4. Now you can start the application locally by running `npm start` from this directory.

# Configuring the application with your data

There are a few places where this application will need to be modified to use your data:

### The `.env` file

For more information about the React App `.env` see the [Create React App documentation on env variables.](https://create-react-app.dev/docs/adding-custom-environment-variables/#adding-development-environment-variables-in-env)

This file contains the following variables:

- `REACT_APP_MAPBOX_ACCESS_TOKEN`
  - This variable sets the appropriate MapBox access token. For more information about MapBox Access Tokens see [the MapBox documentation on access tokens.](https://docs.mapbox.com/help/getting-started/access-tokens/)
- `REACT_APP_MAP_TILESERVER_URL`
  - This variable sets the base url for the tile server.
- `REACT_APP_ENDPOINT_URL`
  - This variable sets the base url for other rest endpoints called in the application.

### The `./src/configuration` directory.
For a detailed explanation of the configurations available see the `config` file at the root of the [configuration directory](./src/configuration)

### The `./src/components/About.tsx` file.
This React component contains the code for landing page. The page content is currently written as generic _Lorem Ipsum_ boilerplate text.

### The `./src/components/Groups.tsx` file.
This React component contains the code for info page displayed on the '/groups' route. The page content currently written as generic _Lorem Ipsum_ boilerplate text.

### The `./src/components/Events.tsx` file.
This React component contains the code for info page displayed on the '/events' route. The page content currently written as generic _Lorem Ipsum_ boilerplate text.

### Favicon
The favicon can be updated by replacing the `favicon.ico` file in the `./public` directory.

# React App General Information and Scripts
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), using the [Redux](https://redux.js.org/) and [Redux Toolkit](https://redux-toolkit.js.org/) template.

## Available Scripts

In the project directory, you can run:

### `npm install`

Installs the dependencies in `package.json`

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.


### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!<br />

Run `serve -s build` to run the production build locally <br />
Open [http//:localhost:5000](http://localhost:5000) to view it in the browser.

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run format`

Runs Prettier formatter using the rules set in the `.prettierrc` file in our project.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

Template used [GitHub Documentation](https://github.com/reduxjs/cra-template-redux-typescript).

Axios [NPM Documentation](https://www.npmjs.com/package/axios)

React Router [GitHub Documentation](https://github.com/ReactTraining/react-router#readme).

Husky [GitHub Documentation](https://github.com/typicode/husky#readme).

ESLint [ESlint Official Documentation](https://eslint.org/).

Prettier [Prettier Official Documentation](https://prettier.io/).

Sass [Sass Official Documentation](https://sass-lang.com/).

Material-UI [Material-UI Official Documentation](https://material-ui.com/)

Redux Toolkit [RTK Official Documentation](https://redux-toolkit.js.org/)

To learn React, check out the [React documentation](https://reactjs.org/).
