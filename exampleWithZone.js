require('zone.js');
let domino = require('domino-custom-elements');

//// SET UP RENDER ENV ...

// exposing required types, and objetcs
HTMLElement = domino.impl.HTMLElement;
customElements = domino.customElements;

// for each server request we have to have separate window and document
// so we will evaluate each request in separate zone,
// on each such zone we will create separate instance of document and window
// and ...
function runInDomZone(fn) {
    let window = domino.createWindow();
    let document = window.document;
    // fix for allow render on document level
    // document.ownerDocument = document;
    return Zone.current.fork({
        name: 'DOMZone',
        properties: {
            window: window,
            document: document
        }
    }).run(fn);
}

// we will expose global getters which will take the window from zone, and ..
Object.defineProperty(global, 'window', {
    get: function () {
        return Zone.current.get('window') || {customElements};
    }
});

// we will expose global getters which will take the document from zone
Object.defineProperty(global, 'document', {
    get: function () {
        return Zone.current.get('document') || {};
    }
});

//// DECLARATION OF COMPONENT ...

let { Component, h, propString } = require('skatejs');

// We can register custom elements to window.customElements
// or to domino, in such case custom elements will be defined in each created window
customElements.define('x-hello',
    class XHello extends Component {
        static get props() {
            return {
                name: {attribute: true}
            }
        }
        get renderRoot() {
            return this;
        }
        renderCallback ({ name }) {
            return h('span', null, `Hello, ${name}`);
        }
    });

//// HANDLING REQUESTS ...

function handleRequest(req, name) {
    runInDomZone(() =>{
        // Render in to dom
        document.body.innerHTML = `<x-hello name="Empty for request: ${req}">`;

        // PROBLEM 2
        // skatejs is using debounce for render, that is why we need to 'wait'
        setTimeout(() => {
            console.log(req, document.documentElement.innerHTML);
            // some async code
            setTimeout(() => {
                // we are able to trigger next render just by setting attribute
                document.querySelector('x-hello').setAttribute('name', name);
                // again we have to wait for render
                setTimeout((() => {
                    console.log(req, document.documentElement.innerHTML);
                }));
            }, 1000);
        });
    });
}

handleRequest(1, 'Pawel');
handleRequest(2, 'Peter');
handleRequest(3, 'Ola');
