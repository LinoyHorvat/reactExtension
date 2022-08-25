[![Build Status](https://www.naturalint.com/wp-content/themes/natural/images/logo-footer.svg)](https://www.naturalint.com/)

# Sprint Planning Tool

## Chrome Extension

![extension.png](https://github.com/dankarger/extension8-react/blob/main/extension.png?raw=true)

## Features

- Helps plan your next sprint by easily viewing the remaining time of each team member while assigning tasks.
- Get the total time assigned to each team member in the sprint automatically from Jira.
- Ability to select a sprint and display its data on the extension.
- Allows to select and switch between teams.
- Add the total number of days of each team member.
- Keep track of the remaining days of each team member: (total days minus the time assigned).
- Maximize and Minimize view
- Drag and drop the extension on the page.
- ✨Magic✨

## Installation

1. Clone the git repo

```sh
 git clone git@github.com:dankarger/extension8-react.git
```

2. Install the dependencies and make a build.

```sh
 npm i
 npm run build
```

3. Open the Extension Management page by navigating to [chrome://extensions](chrome://extensions)
4. Enable Developer Mode by clicking the toggle switch next to Developer mode.
5. Click the Load unpacked button and select the <u>build</u> directory inside the extension directory.

- **make sure to choose the <u>build</u> directory!**

- > The Extension is visible only on the Jira page.
- > When opening the extension for the first time the Table in the extension will be empty.
  > Change the team in the select team input and the sprint list will be updated, then select a sprint to view.

## Update Team members

1. Clear the chrome storage in the console of the extension

```sh
 chrome.storage.sync.clear()
```

1. Update the teams object in the public/background.js file.

```sh
const teams = {...}
```

2. Inside the root directory - run a build

```sh
 npm run build
```

3. Open the Extension Management page by navigating to [chrome://extensions](chrome://extensions)
4. Click on the Remove button of the Extension
5. Continue the Installation process from step 5

## Tech

- Google - chrome extension and the Extensions APIs.
- [React] - A JavaScript library for building user interfaces.

## Authors

- Linoy Horvat , Dan Karger

[//]: # "These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format it nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax"
[react]: https://reactjs.org/
