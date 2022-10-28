// ==UserScript==
// @name         Automatic swagger auth
// @namespace    https://github.com/Miicroo/TamperMonkey/tree/master/swagger-ui
// @version      1.0
// @description  Automatic swagger auth
// @author       Miicroo
// @match        <your_swagger_ui_url>
// @icon         https://www.google.com/s2/favicons?sz=64&domain=swagger.io
// @grant        none
// @copyright    2022+, Miicroo
// ==/UserScript==


// Value of the auth input, e.g. an api_key
const AUTH_VALUE = '';
// Index of the auth form in the GUI, e.g. 0 if the form is on top of the auth dialogue box, 1 if it is in second place...
const AUTH_INDEX = -1;

const inputTypesWithValueSetter = [
    window.HTMLInputElement,
    window.HTMLSelectElement,
    window.HTMLTextAreaElement,
];

waitForDialogThenAuth();

// Taken from https://stackoverflow.com/a/47409362/1137118
function reactTriggerInputChange(node, value) {
    // Only process the change on elements we know have a value setter in their constructor
    if (inputTypesWithValueSetter.indexOf(node.__proto__.constructor) > -1) {
        const setValue = Object.getOwnPropertyDescriptor(node.__proto__, 'value').set;
        const event = new Event('input', { bubbles: true });

        setValue.call(node, value);
        node.dispatchEvent(event);
    }
};

function getAuthDialogButton() {
    return document.querySelector('.btn.authorize.unlocked');
}

function waitForDialogThenAuth() {
    const authDialogButton = getAuthDialogButton();
    if (document.querySelector('.btn.authorize.unlocked') === null) {
        setTimeout(waitForDialogThenAuth, 100);
    } else {
        authorize();
    }
}

function authorize() {
    const authDialogButton = getAuthDialogButton();
    authDialogButton.click();

    const authContainers = document.querySelectorAll('.auth-container');
    const authContainer = authContainers[AUTH_INDEX];
    const buttons = Array.from(authContainer.querySelectorAll('button'));

    const authInput = authContainer.querySelector('input[type="text"]');
    const authButton = buttons.filter(button => button.innerText === 'Authorize')[0]; // There can be only one...
    const closeButton = buttons.filter(button => button.innerText === 'Close')[0];

    reactTriggerInputChange(authInput, AUTH_VALUE);

    authButton.click();
    closeButton.click();
}
