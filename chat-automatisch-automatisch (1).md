# Chat with automatisch/automatisch

## You

please give me deep understanding of the projects architecture, tech stack and the most important parts of your codebase

## AI

## Project Architecture

Automatisch is structured as a **monorepo**, managing multiple distinct packages within a single repository. This approach allows for better code sharing and coordination between different parts of the project.

The main packages are:

*   `backend`: Contains the core backend application logic and all the integrations (apps).
*   `web`: Contains the frontend user interface for building flows, managing connections, etc.
*   `docs`: Contains the source files for the project's documentation website.
*   `e2e-tests`: Contains end-to-end tests for verifying the application's functionality.

## Tech Stack

The project utilizes a modern JavaScript/Node.js tech stack:

*   **Backend (`packages/backend`)**: Primarily built with **Node.js**. It uses **Express** for the web server framework. Data persistence is handled using **Knex** as a query builder and **Objection.js** as an ORM, typically with **PostgreSQL** (`pg` driver) as the database. Secure execution of user-provided code (like in the Code app) is done using **isolated-vm**. Other dependencies include `axios` for making HTTP requests, `luxon` for date/time handling, `winston` for logging, and various libraries for authentication (e.g., `oauth-1.0a`).
*   **Frontend (`packages/web`)**: A **React** single-page application. It uses **Vite** as the build tool. Key libraries include **Material UI (@mui)** for UI components, **@tanstack/react-query** for data fetching and state management, **@xyflow/react** (React Flow) for building the visual flow editor, and **react-hook-form** with **yup** for form handling and validation.
*   **Documentation (`packages/docs`)**: Built using **VitePress**.
*   **End-to-End Tests (`packages/e2e-tests`)**: Uses **Playwright**.

## Most Important Parts of the Codebase

### 1. Integrations (Apps)

Integrations, also referred to as "apps," are central to Automatisch. They define how the platform interacts with third-party services. Each app resides in its own folder within `packages/backend/src/apps/` and follows a standard structure:

*   `index.js`: The main entry point defining the app's metadata (`name`, `key`, `iconUrl`, etc.) and referencing its authentication, triggers, and actions.
*   `auth/`: Contains logic for connecting and authenticating with the third-party service (e.g., OAuth, API keys).
*   `triggers/`: Contains definitions for triggers, which initiate flows by fetching data from the service (e.g., polling for new items, handling webhooks).
*   `actions/`: Contains definitions for actions, which perform operations on the service based on data received from previous steps in a flow (e.g., sending a message, creating an issue).
*   `dynamic-data/`: Contains logic for fetching data dynamically from the service, often used to populate dropdowns or other input fields in the UI.
*   `common/`: Shared helper functions or logic specific to the app.

This modular structure makes it clear how to add new integrations or modify existing ones.

### 2. Flow Execution

The core functionality of Automatisch is executing workflows (flows). A flow starts with a **trigger** and is followed by one or more **actions**. The backend is responsible for scheduling and running these flows, passing data between the steps. The logic for how triggers fetch data and how actions process it is defined within the respective app files (`packages/backend/src/apps/.../triggers/.../index.js` and `packages/backend/src/apps/.../actions/.../index.js`).

### 3. Authentication Handling

The `auth` directories within each app, along with backend services managing **Connections**, are crucial for securely storing and using user credentials to interact with third-party APIs on their behalf. The system encrypts sensitive credentials before storing them in the database.

### 4. Secure Code Execution

For apps like the 'Code' app (see `packages/backend/src/apps/code/actions/run-javascript/index.js`), user-provided code snippets need to be run safely. The project uses `isolated-vm` to execute this code within a secure, isolated V8 context, preventing it from accessing or harming the main application process.

### 5. Database Models and Services

The backend interacts with the database to store information about apps, connections, flows, users, and flow runs. The models (using Objection.js) and associated services handle the persistence layer, managing the state and history of workflows and integrations.

### Assistant's Reasoning

The user is asking for a detailed explanation of the project's architecture, tech stack, and key components. I need to synthesize information from the provided context, specifically focusing on the monorepo structure, the roles of the main packages (`backend`, `web`, `docs`, `e2e-tests`), the technologies used within the `backend` and `web` packages (Node.js, Express, Knex/Objection, React, Vite, etc.), and the core concepts related to integrations (Apps, Flows, Triggers, Actions, Authentication, Dynamic Data, Secure Code Execution). I will structure the answer with headings for clarity and use code formatting for file paths and technologies.

### Source Code References

#### 1. packages/docs/pages/build-integrations/examples.md

```md
# Examples

:::info

The build integrations section is best understood when read from beginning to end. To get the most value out of it, start from the first page and read through page by page.

1. [Folder structure](/build-integrations/folder-structure)
2. [App](/build-integrations/app)
3. [Global variable](/build-integrations/global-variable)
4. [Auth](/build-integrations/auth)
5. [Triggers](/build-integrations/triggers)
6. [Actions](/build-integrations/actions)
7. [<mark>Examples</mark>](/build-integrations/examples)

:::

## Authentication

### 3-legged OAuth

- [Discord](https://github.com/automatisch/automatisch/tree/main/packages/backend/src/apps/discord/auth/index.js)
- [Flickr](https://github.com/automatisch/automatisch/tree/main/packages/backend/src/apps/flickr/auth/index.js)
- [Github](https://github.com/automatisch/automatisch/tree/main/packages/backend/src/apps/github/auth/index.js)
- [Salesforce](https://github.com/automatisch/automatisch/tree/main/packages/backend/src/apps/salesforce/auth/index.js)
- [Slack](https://github.com/automatisch/automatisch/tree/main/packages/backend/src/apps/slack/auth/index.js)
- [Twitter](https://github.com/automatisch/automatisch/tree/main/packages/backend/src/apps/twitter/auth/index.js)

### OAuth with the refresh token

- [Salesforce](https://github.com/automatisch/automatisch/tree/main/packages/backend/src/apps/salesforce/auth/index.js)

### API key

- [DeepL](https://github.com/automatisch/automatisch/tree/main/packages/backend/src/apps/deepl/auth/index.js)
- [Twilio](https://github.com/automatisch/automatisch/tree/main/packages/backend/src/apps/twilio/auth/index.js)
- [SignalWire](https://github.com/automatisch/automatisch/tree/main/packages/backend/src/apps/signalwire/auth/index.js)
- [SMTP](https://github.com/automatisch/automatisch/tree/main/packages/backend/src/apps/smtp/auth/index.js)

### Without authentication

- [RSS](https://github.com/automatisch/automatisch/tree/main/packages/backend/src/apps/rss/index.js)
- [Scheduler](https://github.com/automatisch/automatisch/tree/main/packages/backend/src/apps/scheduler/index.js)

## Triggers

### Polling-based triggers

- [Search tweets - Twitter](https://github.com/automatisch/automatisch/tree/main/packages/backend/src/apps/twitter/triggers/search-tweets/index.js)
- [New issues - Github](https://github.com/automatisch/automatisch/tree/main/packages/backend/src/apps/github/triggers/new-issues/index.js)

### Webhook-based triggers

:::warning
If you are developing a webhook-based trigger, you need to ensure that the webhook is publicly accessible. You can use [ngrok](https://ngrok.com) for this purpose and override the webhook URL by setting the **WEBHOOK_URL** environment variable.
:::

- [New entry - Typeform](https://github.com/automatisch/automatisch/tree/main/packages/backend/src/apps/typeform/triggers/new-entry/index.js)

### Pagination with descending order

- [Search tweets - Twitter](https://github.com/automatisch/automatisch/tree/main/packages/backend/src/apps/twitter/triggers/search-tweets/index.js)
- [New issues - Github](https://github.com/automatisch/automatisch/tree/main/packages/backend/src/apps/github/triggers/new-issues/index.js)
- [Receive SMS - Twilio](https://github.com/automatisch/automatisch/tree/main/packages/backend/src/apps/twilio/triggers/receive-sms/index.js)
- [Receive SMS - SignalWire](https://github.com/automatisch/automatisch/tree/main/packages/backend/src/apps/signalwire/triggers/receive-sms/index.js)
- [New photos - Flickr](https://github.com/automatisch/automatisch/tree/main/packages/backend/src/apps/flickr/triggers/new-photos/index.js)

### Pagination with ascending order

- [New stargazers - Github](https://github.com/automatisch/automatisch/tree/main/packages/backend/src/apps/github/triggers/new-stargazers/index.js)
- [New watchers - Github](https://github.com/automatisch/automatisch/tree/main/packages/backend/src/apps/github/triggers/new-watchers/index.js)

## Actions

- [Send a message to channel - Slack](https://github.com/automatisch/automatisch/tree/main/packages/backend/src/apps/slack/actions/send-a-message-to-channel/index.js)
- [Send SMS - Twilio](https://github.com/automatisch/automatisch/tree/main/packages/backend/src/apps/twilio/actions/send-sms/index.js)
- [Send a message to channel - Discord](https://github.com/automatisch/automatisch/tree/main/packages/backend/src/apps/discord/actions/send-message-to-channel/index.js)
- [Create issue - Github](https://github.com/automatisch/automatisch/tree/main/packages/backend/src/apps/github/actions/create-issue/index.js)
- [Send an email - SMTP](https://github.com/automatisch/automatisch/tree/main/packages/backend/src/apps/smtp/actions/send-email/index.js)
- [Create tweet - Twitter](https://github.com/automatisch/automatisch/tree/main/packages/backend/src/apps/twitter/actions/create-tweet/index.js)
- [Translate text - DeepL](https://github.com/automatisch/automatisch/tree/main/packages/backend/src/apps/deepl/actions/translate-text/index.js)

```

#### 2. packages/web/package.json

```json
{
  "name": "@automatisch/web",
  "version": "0.10.0",
  "license": "See LICENSE file",
  "description": "The open source Zapier alternative. Build workflow automation without spending time and money.",
  "dependencies": {
    "@casl/ability": "^6.5.0",
    "@casl/react": "^3.1.0",
    "@dagrejs/dagre": "^1.1.2",
    "@emotion/react": "^11.4.1",
    "@emotion/styled": "^11.3.0",
    "@hookform/resolvers": "^2.8.8",
    "@monaco-editor/react": "^4.6.0",
    "@mui/icons-material": "^5.11.9",
    "@mui/joy": "^5.0.0-beta.52",
    "@mui/lab": "^5.0.0-alpha.120",
    "@mui/material": "^5.11.10",
    "@mui/x-date-pickers": "^7.28.0",
    "@tanstack/react-query": "^5.24.1",
    "@xyflow/react": "^12.4.4",
    "axios": "^1.6.0",
    "clipboard-copy": "^4.0.1",
    "compare-versions": "^4.1.3",
    "lodash": "^4.17.21",
    "luxon": "^3.6.0",
    "mui-color-input": "^2.0.0",
    "notistack": "^3.0.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "7.53.2",
    "react-intl": "^5.20.12",
    "react-json-tree": "^0.16.2",
    "react-router-dom": "^6.0.2",
    "react-window": "^1.8.9",
    "slate": "^0.94.1",
    "slate-history": "^0.93.0",
    "slate-react": "^0.94.2",
    "slugify": "^1.6.6",
    "uuid": "^9.0.0",
    "yup": "^0.32.11"
  },
  "main": "index.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:watch": "yarn nodemon --exec vite build --watch 'src/**/*.ts' --watch 'public/**/*' --ext ts,html",
    "lint": "eslint src --ext .js,.jsx",
    "prepack": "yarn build",
    "preview": "vite preview"
  },
  "files": [
    "/build"
  ],
  "contributors": [
    {
      "name": "automatisch contributors",
      "url": "https://github.com/automatisch/automatisch/graphs/contributors"
    }
  ],
  "bugs": {
    "url": "https://github.com/automatisch/automatisch/issues"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/automatisch/automatisch.git"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    
```

#### 3. packages/docs/package.json

```json
{
  "name": "@automatisch/docs",
  "version": "0.10.0",
  "license": "See LICENSE file",
  "description": "The open source Zapier alternative. Build workflow automation without spending time and money.",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vitepress dev pages --port 3002",
    "build": "vitepress build pages",
    "serve": "vitepress serve pages"
  },
  "devDependencies": {
    "sitemap": "^7.1.1",
    "vitepress": "^1.0.0-alpha.21",
    "vue": "^3.2.37"
  },
  "contributors": [
    {
      "name": "automatisch contributors",
      "url": "https://github.com/automatisch/automatisch/graphs/contributors"
    }
  ],
  "homepage": "https://github.com/automatisch/automatisch#readme",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/automatisch/automatisch.git"
  },
  "bugs": {
    "url": "https://github.com/automatisch/automatisch/issues"
  }
}

```

#### 4. packages/docs/pages/index.md

```md
<style>
  img {
    border-radius: 8px;
  }
</style>

# What is Automatisch?

:::warning
Automatisch is still in the early phase of development. We try our best not to introduce breaking changes, but be cautious until v1 is released.
:::

![Automatisch Flow Page](./assets/flow-900.png)

🧐 Automatisch is a **business automation** tool that lets you connect different services like Twitter, Slack, and **[more](/guide/available-apps)** to automate your business processes.

💸 Automating your workflows doesn't have to be a difficult or expensive process. You also **don't need** any programming knowledge to use Automatisch.

## How it works?

Automatisch is a software designed to help streamline your workflows by integrating the different services you use. This way, you can avoid spending extra time and money on building integrations or hiring someone to do it for you.

For example, you can create a workflow for your team by specifying two steps: "search all tweets that include the `Automatisch` keyword" and "post those tweets into a slack channel specified." It is one of the internal workflows we use to test our product. This example only includes Twitter and Slack services, but many more possibilities exist. You can check the list of integrations [here](/guide/available-apps).

You need to prepare the workflow once, and it will run continuously until you stop it or the connected account gets unlinked. Currently, workflows run at intervals of 15 minutes, but we're planning to extend this behavior and support instant updates if it's available with the third-party service.

## Advantages

There are other existing solutions in the market, like Zapier and Integromat, so you might be wondering why you should use Automatisch.

✅ One of the main benefits of using Automatisch is that it allows you to **store your data on your own servers**, which is essential for businesses that handle sensitive user information and cannot risk sharing it with external cloud services. This is especially relevant for industries such as healthcare and finance, as well as for European companies that must adhere to the General Data Protection Regulation (GDPR).

🤓 Your contributions are vital to the development of Automatisch. As an **open-source software**, anyone can have an impact on how it is being developed.

💙 **No vendor 
```

#### 5. packages/docs/pages/build-integrations/app.md

```md
# App

:::info

The build integrations section is best understood when read from beginning to end. To get the most value out of it, start from the first page and read through page by page.

1. [Folder structure](/build-integrations/folder-structure)
2. [<mark>App</mark>](/build-integrations/app)
3. [Global variable](/build-integrations/global-variable)
4. [Auth](/build-integrations/auth)
5. [Triggers](/build-integrations/triggers)
6. [Actions](/build-integrations/actions)
7. [Examples](/build-integrations/examples)

:::

Let's start building our first app by using [TheCatApi](https://thecatapi.com/) service. It's a service that provides cat images and allows you to vote or favorite a specific cat image. It's an excellent example to demonstrate how Automatisch works with an API that has authentication and data fetching with pagination.

We will build an app with the `Search cat images` trigger and `Mark the cat image as favorite` action. So we will learn how to build both triggers and actions.

## Define the app

The first thing we need to do is to create a folder inside of the apps in the backend package.

```bash
cd packages/backend/src/apps
mkdir thecatapi
```

We need to create an `index.js` file inside of the `thecatapi` folder.

```bash
cd thecatapi
touch index.js
```

Then let's define the app inside of the `index.js` file as follows:

```javascript
import defineApp from '../../helpers/define-app.js';

export default defineApp({
  name: 'The cat API',
  key: 'thecatapi',
  iconUrl: '{BASE_URL}/apps/thecatapi/assets/favicon.svg',
  authDocUrl: '{DOCS_URL}/apps/thecatapi/connection',
  supportsConnections: true,
  baseUrl: 'https://thecatapi.com',
  apiBaseUrl: 'https://api.thecatapi.com',
  primaryColor: '#000000',
});
```

- `name` is the displayed name of the app in Automatisch.
- `key` is the unique key of the app. It's used to identify the app in Automatisch.
- `iconUrl` is the URL of the app icon. It's used in Automatisch to display the app icon. You can use `{BASE_URL}` placeholder to refer to the base URL of the app. We expect you to place the SVG icon as `assets/favicon.svg` file.
- `authDocUrl` is the URL of the documentation page that describes how to connect to the app. It's used in Automatisch to display the documentation link on the connection page.
- `supportsConnections` is a boolean that indicates whether the app supports connections or not. If it's `true`, Automatisch will display the connection page for the app. Some apps like RSS and Scheduler do not support connections since they do not have authentication.
- `baseUrl` is the base URL of the third-party service.
- `apiBaseUrl` is the API URL of 
```

#### 6. packages/backend/src/apps/gitlab/triggers/pipeline-event/pipeline_event.js

```js
   started_at: null,
      finished_at: null,
      duration: null,
      queued_duration: null,
      failure_reason: null,
      when: 'on_success',
      manual: false,
      allow_failure: false,
      user: {
        id: 1,
        name: 'Administrator',
        username: 'root',
        avatar_url:
          'http://www.gravatar.com/avatar/e32bd13e2add097461cb96824b7a829c?s=80\u0026d=identicon',
        email: 'admin@example.com',
      },
      runner: null,
      artifacts_file: {
        filename: null,
        size: null,
      },
      environment: {
        name: 'staging',
        action: 'start',
        deployment_tier: 'staging',
      },
    },
  ],
};

```

#### 7. packages/docs/pages/index.md

```md
be wondering why you should use Automatisch.

✅ One of the main benefits of using Automatisch is that it allows you to **store your data on your own servers**, which is essential for businesses that handle sensitive user information and cannot risk sharing it with external cloud services. This is especially relevant for industries such as healthcare and finance, as well as for European companies that must adhere to the General Data Protection Regulation (GDPR).

🤓 Your contributions are vital to the development of Automatisch. As an **open-source software**, anyone can have an impact on how it is being developed.

💙 **No vendor lock-in**. If you ever decide that Automatisch is no longer helpful for your business, you can switch to any other provider, which will be easier than switching from the one cloud provider to another since you have all data and flexibility.

## Let's start!

Visit our [installation guide](/guide/installation) to setup Automatisch. It's recommended to read through all the getting started sections in the sidebar and [create your first flow](/guide/create-flow).

## Something missing?

If you find issues with the documentation or have suggestions on how to improve the documentation or the project in general, please [file an issue](https://github.com/automatisch/automatisch/issues) for us, or send a tweet mentioning the [@automatischio](https://twitter.com/automatischio) Twitter account.

```

#### 8. packages/web/index.html

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#0059F7" />
    <meta
      name="description"
      content="Build workflow automation without spending time and money. No code is required."
    />
    <!--
      Notice the use of %PUBLIC_URL% in the tags above.
      It will be replaced with the URL of the `public` folder during the build.
      Only files inside the `public` folder can be referenced from the HTML.

      Unlike "/favicon.ico" or "favicon.ico", "%PUBLIC_URL%/favicon.ico" will
      work correctly both with client-side routing and a non-root public URL.
      Learn how to configure a non-root public URL by running `npm run build`.
    -->

    <link
      rel="preload"
      href="/fonts/Inter-Regular.ttf"
      as="font"
      crossorigin
      type="font/ttf"
    />

    <link
      rel="preload"
      href="/fonts/Inter-Medium.ttf"
      as="font"
      crossorigin
      type="font/ttf"
    />

    <link
      rel="preload"
      href="/fonts/Inter-Bold.ttf"
      as="font"
      crossorigin
      type="font/ttf"
    />

    <style>
      @font-face {
        font-family: 'Inter';
        src: url('/fonts/Inter-Regular.ttf') format('truetype');
        font-weight: 400;
        font-style: normal;
        font-display: swap;
      }

      @font-face {
       
```

#### 9. packages/e2e-tests/package.json

```json
{
  "name": "@automatisch/e2e-tests",
  "version": "0.10.0",
  "license": "See LICENSE file",
  "private": true,
  "description": "The open source Zapier alternative. Build workflow automation without spending time and money.",
  "scripts": {
    "start-mock-license-server": "node ./license-server-with-mock.js",
    "test": "playwright test",
    "test:fast": "yarn test -j 90% --quiet --reporter null --ignore-snapshots -x",
    "lint": "eslint ."
  },
  "contributors": [
    {
      "name": "automatisch contributors",
      "url": "https://github.com/automatisch/automatisch/graphs/contributors"
    }
  ],
  "homepage": "https://github.com/automatisch/automatisch#readme",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/automatisch/automatisch.git"
  },
  "bugs": {
    "url": "https://github.com/automatisch/automatisch/issues"
  },
  "devDependencies": {
    "@faker-js/faker": "^8.2.0",
    "@playwright/test": "1.49.0",
    "objection": "^3.1.5"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "dotenv": "^16.3.1",
    "eslint": "^8.13.0",
    "eslint-config-prettier": "^8.3.0",
    "eslint-plugin-prettier": "^4.0.0",
    "knex": "^2.4.0",
    "luxon": "^3.4.4",
    "micro": "^10.0.1",
    "pg": "^8.12.0",
    "prettier": "^2.5.1"
  }
}

```

#### 10. packages/backend/src/apps/gitlab/triggers/merge-request-event/merge_request_event.js

```js
'opened',
    blocking_discussions_resolved: true,
    work_in_progress: false,
    first_contribution: true,
    merge_status: 'unchecked',
    target_project_id: 14,
    description: '',
    total_time_spent: 1800,
    time_change: 30,
    human_total_time_spent: '30m',
    human_time_change: '30s',
    human_time_estimate: '30m',
    url: 'http://example.com/diaspora/merge_requests/1',
    source: {
      name: 'Awesome Project',
      description: 'Aut reprehenderit ut est.',
      web_url: 'http://example.com/awesome_space/awesome_project',
      avatar_url: null,
      git_ssh_url: 'git@example.com:awesome_space/awesome_project.git',
      git_http_url: 'http://example.com/awesome_space/awesome_project.git',
      namespace: 'Awesome Space',
      visibility_level: 20,
      path_with_namespace: 'awesome_space/awesome_project',
      default_branch: 'master',
      homepage: 'http://example.com/awesome_space/awesome_project',
      url: 'http://example.com/awesome_space/awesome_project.git',
      ssh_url: 'git@example.com:awesome_space/awesome_project.git',
      http_url: 'http://example.com/awesome_space/awesome_project.git',
    },
    target: {
      name: 'Awesome Project',
      description: 'Aut reprehenderit ut est.',
      web_url: 'http://example.com/awesome_space/awesome_project',
      avatar_url: null,
      git_ssh_url: 'git@example.com:awesome_space/awesome_project.git',
      git_http_url: 'http://example.com/awesome_space/awesome_project.git',
      namespace: 'Awesome Space',
      visibility_level: 20,
      path_with_namespace: 'awesome_space/awesome_project',
      default_branch: 'master',
      homepage: 'http://example.com/awesome_space/awesome_project',
      url: 'http://example.com/awesome_space/awesome_project.git',
      ssh_url: 'git@example.com:awesome_space/awesome_project.git',
      http_url: 'http://example.com/awesome_space/awesome_project.git',
    },
    last_commit: {
      id: 'da1560886d4f094c3e6c9ef40349f7d38b5d27d7',
      message: 'fixed readme',
      title: 'Update file README.md',
      timestamp: '2012-01-03T23:36:29+02:00',
      url: 'http://example.com/awesome_space/awesome_project/commits/da1560886d4f094c3e6c9ef40349f7d38b5d27d7',
      author: {
        name: 'GitLab dev user',
     
```

#### 11. packages/backend/package.json

```json
 "eslint-config-prettier": "^8.3.0",
    "eslint-plugin-prettier": "^4.0.0",
    "esm-module-alias": "^2.2.1",
    "express": "~4.18.2",
    "express-async-errors": "^3.1.1",
    "express-basic-auth": "^1.2.1",
    "fast-xml-parser": "^4.0.11",
    "handlebars": "^4.7.7",
    "http-errors": "~1.6.3",
    "http-proxy-agent": "^7.0.0",
    "https-proxy-agent": "^7.0.1",
    "isolated-vm": "^5.0.1",
    "jsonwebtoken": "^9.0.0",
    "knex": "^2.4.0",
    "libphonenumber-js": "^1.10.48",
    "lodash.get": "^4.4.2",
    "luxon": "2.5.2",
    "memory-cache": "^0.2.0",
    "morgan": "^1.10.0",
    "multer": "1.4.5-lts.1",
    "node-html-markdown": "^1.3.0",
    "nodemailer": "6.7.0",
    "oauth-1.0a": "^2.2.6",
    "objection": "^3.0.0",
    "passport": "^0.6.0",
    "pg": "^8.7.1",
    "php-serialize": "^4.0.2",
    "pluralize": "^8.0.0",
    "prettier": "^2.5.1",
    "raw-body": "^2.5.2",
    "showdown": "^2.1.0",
    "slugify": "^1.6.6",
    "uuid": "^9.0.1",
    "winston": "^3.7.1",
    "xmlrpc": "^1.3.2"
  },
  "contributors": [
    {
      "name": "automatisch contributors",
      "url": "https://github.com/automatisch/automatisch/graphs/contributors"
    }
  ],
  "homepage": "https://github.com/automatisch/automatisch#readme",
  "main": "src/server",
  "directories": {
    "bin": "bin",
    "src": "src",
    "test": "__tests__"
  },
  "files": [
    "bin",
    "src"
  ],
  "repository": {
    "type": "git",
    "url": "git+https://github.com/automatisch/automatisch.git"
  },
  "bugs": {
    "url": "https://github.com/automatisch/automatisch/issues"
  },
  "devDependencies": {
    "@vitest/coverage-v8": "^2.1.5",
    "node-gyp": "^10.1.0",
    "nodemon": "^2.0.13",
    "supertest": "^6.3.3",
    "vitest": "^2.1.5"
  },
  "publishConfig": {
    "access": "public"
  },
  "nodemonConfig": {
    "watch": [
      "src/"
    ],
    "ext": "js"
  },
  "packageManager": "yarn@1.22.22+sha512.a6b2f7906b721bba3d67d4aff083df04dad64c399707841b7acf00f6b133b7ac24255f2652fa22ae3534329dc6180534e98d17432037ff6fd140556e2bb3137e"
}

```

#### 12. packages/docs/pages/contributing/repository-structure.md

```md
# Repository Structure

We manage a monorepo structure with the following packages:

```
.
├── packages
│   ├── backend
│   ├── docs
│   ├── e2e-tests
│   └── web
```

- `backend` - The backend package contains the backend application and all integrations.
- `docs` - The docs package contains the documentation website.
- `e2e-tests` - The e2e-tests package contains the end-to-end tests for the internal usage.
- `web` - The web package contains the frontend application of Automatisch.

Each package is independently managed, and has its own package.json file to manage dependencies. This allows for better isolation and flexibility.

```

#### 13. packages/docs/pages/build-integrations/folder-structure.md

```md
# Folder Structure

:::info

The build integrations section is best understood when read from beginning to end. To get the most value out of it, start from the first page and read through page by page.

1. [<mark>Folder structure</mark>](/build-integrations/folder-structure)
2. [App](/build-integrations/app)
3. [Global variable](/build-integrations/global-variable)
4. [Auth](/build-integrations/auth)
5. [Triggers](/build-integrations/triggers)
6. [Actions](/build-integrations/actions)
7. [Examples](/build-integrations/examples)

:::

:::warning
If you still need to set up the development environment, please go back to the [development setup](/contributing/development-setup) page and follow the instructions.
:::

:::tip
We will use the terms **integration** and **app** interchangeably in the documentation.
:::

Before diving into how to build an integration for Automatisch, it's better to check the folder structure of the apps and give you some idea about how we place different parts of the app.

## Folder structure of an app

Here, you can see the folder structure of an example app. We will briefly walk through the folders, explain what they are used for, and dive into the details in the following pages.

```
.
├── actions
├── assets
├── auth
├── common
├── dynamic-data
├── index.js
└── triggers
```

## App

The `index.js` file is the entry point of the app. It contains the definition of the app and the app's metadata. It also includes the list of triggers, actions, and data sources that the app provides. So, whatever you build inside the app, you need to associate it within the `index.js` file.

## Auth

We ask users to authenticate with their third-party service accounts (we also document how they can accomplish this for each app.), and we store the encrypted credentials in our database. Later on, we use the credentials to make requests to the third-party service when we use them within triggers and actions. Auth folder is responsible for getting those credentials and saving them as connections for later use.

## Triggers

Triggers are the starting points of the flows. The first step in the flow always has to be a trigger. Triggers are responsible for fetching data from the third-party service and sending it to the next steps of the flow, which are actions.

## Actions

As mentioned above, actions are the steps we place after a trigger. Actions are responsible for getting data from their previous steps and taking action with that data. For example, when a new issue is created 
```

#### 14. packages/docs/pages/guide/key-concepts.md

```md
# Key Concepts

We will cover four main terms of Automatisch before creating our first flow.

## App

👉 Apps are the third-party services you can use with Automatisch, like Twitter, Github and Slack. You can check the complete list of available apps [here](/guide/available-apps). Automatisch aims to connect those apps to help you build workflows. So whenever you work with other concepts of Automatisch, you will use apps.

:::tip

You can request a new integration [here](/guide/request-integration). We will collect all the requests and prioritize the most requested ones.

:::

## Connection

📪 To use an app, you need to add a connection first. Connection is essentially the place where you pass the credentials of the specified service, like consumer key, consumer secret, etc., to let Automatisch connect third-party apps on your behalf. When you click "Add connection" and choose an app, you'll be prompted for the required fields for the connection. You can also add multiple connections if you have more than one account for the same app.

## Flow

🛠️ Flow is the most crucial part of Automatisch. It's a place to arrange the business workflow by connecting multiple steps. So, for example, we can define a flow that does:

- **Search tweets** for the "Automatisch" keyword.
- **Send a message to channel** which posts found tweets to the specified Slack channel.

## Step

📄 Steps are the individual items in the flow. In our example, **searching tweets** and **sending a message to channel** are both steps in our flow. Steps have two different types, which are trigger and action. Trigger steps are the ones that start any flow you would like to build with Automatisch, like "search tweets". You can think them as starting points. Action steps are the following steps that define what you would do with the incoming data from previous steps, like "sending a message to channel" in our example. Flows can also have more than two steps. The first step of each flow should be the trigger step, and the following steps should be action steps.

```

#### 15. packages/backend/src/apps/gitlab/dynamic-data/list-projects/index.js

```js
import paginateAll from '../../common/paginate-all.js';

export default {
  name: 'List projects',
  key: 'listProjects',

  async run($) {
    // ref:
    //  - https://docs.gitlab.com/ee/api/projects.html#list-all-projects
    //  - https://docs.gitlab.com/ee/api/rest/index.html#keyset-based-pagination
    const firstPageRequest = $.http.get('/api/v4/projects', {
      params: {
        simple: true,
        pagination: 'keyset',
        membership: true,
        order_by: 'id',
        sort: 'asc',
      },
    });

    const response = await paginateAll($, firstPageRequest);

    response.data = response.data.map((repo) => {
      return {
        value: repo.id,
        name: repo.name,
      };
    });

    return response;
  },
};

```

#### 16. packages/web/package.json

```json
 "preview": "vite preview"
  },
  "files": [
    "/build"
  ],
  "contributors": [
    {
      "name": "automatisch contributors",
      "url": "https://github.com/automatisch/automatisch/graphs/contributors"
    }
  ],
  "bugs": {
    "url": "https://github.com/automatisch/automatisch/issues"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/automatisch/automatisch.git"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "publishConfig": {
    "access": "public"
  },
  "devDependencies": {
    "@emotion/babel-plugin": "^11.13.5",
    "@svgr/core": "^8.1.0",
    "@svgr/plugin-jsx": "^8.1.0",
    "@tanstack/react-query-devtools": "^5.24.1",
    "@testing-library/jest-dom": "^5.11.4",
    "@testing-library/react": "^11.1.0",
    "@testing-library/user-event": "^12.1.10",
    "@vitejs/plugin-react": "^4.3.4",
    "@welldone-software/why-did-you-render": "^8",
    "eslint": "^9.25.1",
    "eslint-config-prettier": "^9.1.0",
    "eslint-config-react-app": "^7.0.1",
    "eslint-plugin-react-hooks": "^5.2.0",
    "globals": "^16.0.0",
    "prettier": "^3.2.5",
    "vite": "^6.1.0",
    "vite-plugin-eslint": "^1.8.1",
    "vite-tsconfig-paths": "^4.3.2"
  },
  "packageManager": "yarn@1.22.22+sha512.a6b2f7906b721bba3d67d4aff083df04dad64c399707841b7acf00f6b133b7ac24255f2652fa22ae3534329dc6180534e98d17432037ff6fd140556e2bb3137e"
}

```

#### 17. packages/backend/src/apps/azure-openai/actions/send-prompt/index.js

```js
their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.`,
    },
    {
      label: 'Presence Penalty',
      key: 'presencePenalty',
      type: 'string',
      required: false,
      variables: true,
      description: `Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.`,
    },
  ],

  async run($) {
    const payload = {
      model: $.step.parameters.model,
      prompt: $.step.parameters.prompt,
      temperature: castFloatOrUndefined($.step.parameters.temperature),
      max_tokens: castFloatOrUndefined($.step.parameters.maxTokens),
      stop: $.step.parameters.stopSequence || null,
      top_p: castFloatOrUndefined($.step.parameters.topP),
      frequency_penalty: castFloatOrUndefined(
        $.step.parameters.frequencyPenalty
      ),
      presence_penalty: castFloatOrUndefined($.step.parameters.presencePenalty),
    };

    const { data } = await $.http.post(
      `/deployments/${$.auth.data.deploymentId}/completions`,
      payload
    );

    $.setActionItem({
      raw: data,
    });
  },
});

```

#### 18. packages/backend/src/apps/code/actions/run-javascript/index.js

```js
       label: 'Value',
          key: 'value',
          type: 'string',
          required: true,
          variables: true,
          valueType: 'parse',
        },
      ],
    },
    {
      label: 'Code Snippet',
      key: 'codeSnippet',
      type: 'code',
      required: true,
      variables: false,
      value:
        'const code = async (inputs) => { \n  // E.g. if you have an input called username,\n  // you can access its value by calling inputs.username\n  // Return value will be used as output of this step.\n\n  return true;\n};',
    },
  ],

  async run($) {
    const { inputs = [], codeSnippet } = $.step.parameters;

    const objectifiedInput = {};
    for (const input of inputs) {
      if (input.key) {
        objectifiedInput[input.key] = input.value;
      }
    }

    const ivm = (await import('isolated-vm')).default;
    const isolate = new ivm.Isolate({ memoryLimit: 128 });

    try {
      const context = await isolate.createContext();
      await context.global.set(
        'inputs',
        new ivm.ExternalCopy(objectifiedInput).copyInto()
      );

      const compiledCodeSnippet = await isolate.compileScript(
        `${codeSnippet}; code(inputs);`
      );
      const codeFunction = await compiledCodeSnippet.run(context, {
       
```

#### 19. packages/docs/pages/build-integrations/actions.md

```md
# Actions

:::info

The build integrations section is best understood when read from beginning to end. To get the most value out of it, start from the first page and read through page by page.

1. [Folder structure](/build-integrations/folder-structure)
2. [App](/build-integrations/app)
3. [Global variable](/build-integrations/global-variable)
4. [Auth](/build-integrations/auth)
5. [Triggers](/build-integrations/triggers)
6. [<mark>Actions</mark>](/build-integrations/actions)
7. [Examples](/build-integrations/examples)

:::

## Add actions to the app.

Open the `thecatapi/index.js` file and add the highlighted lines for actions.

```javascript{4,17}
import defineApp from '../../helpers/define-app.js';
import auth from './auth/index.js';
import triggers from './triggers/index.js';
import actions from './actions/index.js';

export default defineApp({
  name: 'The cat API',
  key: 'thecatapi',
  iconUrl: '{BASE_URL}/apps/thecatapi/assets/favicon.svg',
  authDocUrl: '{DOCS_URL}/apps/thecatapi/connection',
  supportsConnections: true,
  baseUrl: 'https://thecatapi.com',
  apiBaseUrl: 'https://api.thecatapi.com',
  primaryColor: '#000000',
  auth,
  triggers
  actions
});
```

## Define actions

Create the `actions/index.js` file inside of the `thecatapi` folder.

```javascript
import markCatImageAsFavorite from './mark-cat-image-as-favorite/index.js';

export default [markCatImageAsFavorite];
```

:::tip
If you add new actions, you need to add them to the actions/index.js file and export all actions as an array.
:::

## Add metadata

Create the `actions/mark-cat-image-as-favorite/index.js` file inside the `thecatapi` folder.

```javascript
import defineAction from '../../../../helpers/define-action.js';

export default defineAction({
  name: 'Mark the cat image as favorite',
  key: 'markCatImageAsFavorite',
  description: 'Marks the cat image as favorite.',
  arguments: [
    {
      label: 'Image ID',
      key: 'imageId',
      type: 'string',
      required: true,
      description: 'The ID of the cat image you want to mark as favorite.',
      variables: true,
    },
  ],

  async run($) {
    // TODO: Implement action!
  },
});
```

Let's briefly explain what we defined here.

- `name`: The name of the action.
- `key`: The key of the action. This is used to identify the action in Automatisch.
- `description`: The description of the action.
- `arguments`: The arguments of the action. These are the values that the user provides when using the action.
- `run`: The function that is executed when the action is executed.

## Implement the action

Open the `actions/mark-cat-image-as-favorite.js` file and add the highlighted lines.

```javascript{7-20}
import defineAction from '../../../../helpers/define-action.js';

export default defineAction({
  // ...

  async run($) {
    const requestPath = '/v1/favourites';
    const imageId = $.step.parameters.imageId;

 
```

#### 20. packages/backend/src/models/app.js

```js
import fs from 'fs';
import path, { join } from 'path';
import { fileURLToPath } from 'url';
import appInfoConverter from '@/helpers/app-info-converter.js';
import getApp from '@/helpers/get-app.js';
import { hasValidLicense } from '@/helpers/license.ee.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class App {
  static folderPath = join(__dirname, '../apps');

  static async list() {
    const directories = fs
      .readdirSync(this.folderPath)
      .filter((file) => fs.statSync(join(this.folderPath, file)).isDirectory());

    if (!(await hasValidLicense())) {
      // Filter out enterprise apps if no valid license
      const nonEnterpriseApps = [];

      for (const dir of directories) {
        const appData = await getApp(dir, true);

        if (!appData.enterprise) {
          nonEnterpriseApps.push(dir);
        }
      }

      return nonEnterpriseApps;
    }

    return directories;
  }

  static async findAll(name, stripFuncs = true) {
    const appList = await this.list();

    if (!name)
      return Promise.all(
        appList.map(async (name) => await this.findOneByName(name, stripFuncs))
      );

    return Promise.all(
      appList
        .filter((app) => app.includes(name.toLowerCase()))
        .map((name) => this.findOneByName(name, stripFuncs))
    );
  }

  static async findOneByName(name, stripFuncs = false) {
    const rawAppData = await getApp(name.toLocaleLowerCase(), stripFuncs);

    return appInfoConverter(rawAppData);
  }

  static async findOneByKey(key, stripFuncs = false) {
    const rawAppData = await getApp(key, stripFuncs);

    return appInfoConverter(rawAppData);
  }

  static async findAuthByKey(key, stripFuncs = false) {
    const rawAppData = await getApp(key, stripFuncs);
    const appData = appInfoConverter(rawAppData);

    return appData?.auth || {};
  }

  static async findTriggersByKey(key, stripFuncs = false) {
    const rawAppData = 
```

