let domino = require('domino-custom-elements');

// We can expose global types which not existing on node.js like
// HTMLElement, Node, Document, ect...

HTMLElement = domino.impl.HTMLElement;

// PROBLEM 1
// But instance of document and window should be crated one time per request
// unfortunately skatejs is using window and document statically
// that is why I needed to do this before require skatejs
window = domino.createWindow('');
document = window.document;

let { Component, h, propString } = require('skatejs');

// We can register custom elements to window.customElements
// or to domino, in such case custom elements will be defined in each created window
domino.customElements.define('x-hello',
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


// Render in to dom
document.body.innerHTML = '<x-hello name="Pawel"/>';

// PROBLEM 2
// skatejs is using debounce for render, that is why we need to 'wait'
setTimeout(() => {
    console.log(document.documentElement.innerHTML);
}, 1);
