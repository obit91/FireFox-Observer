# FireFox-Observer
Easily see which information is stored on you, for the current active session.

## Debugging:
about:debugging#/runtime/this-firefox

## Building the extension
1. Download NodeJS (comes built with npm).
2. Within the repository run 'npm install'.
3. Type 'npm run build', this will trigger build1 and build2 scripts that will fire web-ext and webpack accordingly.
4. An intermediate minified build will be created by web-pack within addon/ directory.
5. The complete extension will be built by web-ext and place within /web-ext-artifacts as a deployable zip file.

## Running the extension locally
* 'npm run start' - Will bundle the code via webpack, build the extension via web-ext and start firefox with it installed.
* 'npm run start:firefox' - Will run the extension via web-ext.

## Next release TODO list:
* Publish to the open-source community on npm.
* Implement the permissions code from within the active tab (instead of the extension, inject it).
* Attempt to retrieve the trackers from the browser, instead of calculating them manually - [stackoverflow](https://stackoverflow.com/questions/59910455/is-it-possible-to-access-the-detected-trackers-via-an-addon-using-javascript "Active question on SO.").
* Extra - create a better looking UI for the cookies.