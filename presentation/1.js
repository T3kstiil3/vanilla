const bindPattern = "z-bind:";
const bindSugarPattern = ":";
const attributeRegex = new RegExp(`\^${bindPattern}|${bindSugarPattern}`);
let attributesObservers = {};

function bindData(element, state) {
    this._state = state;
    forEachChildren(app, bindElement);
    return new Proxy(state, handler);
}

function forEachChildren(app, doStuffOnChildren) {
    let flatChildren = app.querySelectorAll('*');
    flatChildren.forEach((child) => {
        doStuffOnChildren(child);
    });
}

function bindElement(element) {
    forEachAttribute(element, bindAttribute)
}

const handler = {
    get: (target, key) => {
        return this._state[key];
    },
    set: (target, key, value) => {
        this._state[key] = value;
        updateAttributes(key, value);
    }
};

/**
 * Attributes
 */
function forEachAttribute(element, doStuffOnAttribute) {
    Object.values(element.attributes).forEach((attribute) => {
        if (attributeRegex.test(attribute.localName) && attribute.specified) {
            doStuffOnAttribute(element, attribute)
        }
    })
}

function bindAttribute(element, attribute) {
    let attributeName = extractAttribute(element, attribute.localName);

    if (!Array.isArray(attributesObservers[attribute.value])) {
        attributesObservers[attribute.value] = [];
    }
    attributesObservers[attribute.value].push({element, attribute: attributeName})

    element.setAttribute(attributeName, this._state[attribute.value]);
}

function extractAttribute(element, localName) {
    element.removeAttribute(localName)
    return localName.replace(bindPattern, '');
}

function updateAttributes(attribute, value) {
    const observers = attributesObservers[attribute];

    if (observers) {
        observers.forEach((observer) => {
            observer.element.setAttribute(observer.attribute, value);
        })
    }
}