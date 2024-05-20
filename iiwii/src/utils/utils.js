// @ts-nocheck
export const focusEnd = (element) => {
    element.focus();
    if (typeof window.getSelection != "undefined"
            && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(element);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(element);
        textRange.collapse(false);
        textRange.select();
    }
    
}

export const focuspos = (element, pos) => {
    for(let node of element.childNodes){
        if(node.nodeType == 3){ // we have a text node
            if(node.length >= pos){
                // finally add our range
                let range = document.createRange(),
                    sel = window.getSelection();
                range.setStart(node, pos);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
                return -1; // we are done
            } else{
                pos -= node.length;
            }
        } else{
            pos = focuspos(node, pos + 1);
            if (pos == -1){
                return -1; // no need to finish the for loop
            }
        }
    }
    return pos; // needed because of recursion stuff
}

export const getOffset = (element) => {
    if (!element) return -1;
    let caretOffset = 0;
    if (typeof window.getSelection() != "undefined") {
        let range = window.getSelection().getRangeAt(0);
        let preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        caretOffset = preCaretRange.toString().length;
    } else if (typeof document.getSelection() != "undefined" && document.getSelection().type != "Control") {
        // @ts-ignore
        let textRange = document.getSelection().createRange();
        // @ts-ignore
        let preCaretTextRange = document.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
}

// gets current row the cursor is on
export const getCurrRow = (cursorIndex, wrapped) => {
    let cum = 0;
    for (let i = 0; i < wrapped.length; i++) {
        if (cum + wrapped[i].length >= cursorIndex) return i + 1;
        else cum += wrapped[i].length;
    }
    return 1;
}

// get cursorIndex from position in (last) line
export const getOffsetFromIndex = (index, wrapped) => {
    let cum = 0;
    for (let i = 0; i < wrapped.length - 1; i++) {
        cum += wrapped[i].length;
    }
    return cum + index - 1;
}

// get index from offset
export const getIndexFromOffset = (offset, wrapped) => {
    let cum = 0;
    for (let i = 0; i < wrapped.length; i++) {
        if (cum + wrapped[i].length > offset) return offset - cum;
        else cum += wrapped[i].length;
    }
    return offset;
}

// returns array of text at places of textwrap
export const getWrapped = (element, fontSize) => {
    if (!element) return [];
    let elWidth = window.innerWidth - 288 * 2;
    let spanrow = document.createElement('span');
    let app = document.getElementById('app');
    app.appendChild(spanrow);
    let lines = []

    // Iterate over the child nodes of the element
    for (let j = 0; j < element.childNodes.length; j++) {
        let node = element.childNodes[j];
        if (node.nodeType === Node.TEXT_NODE || node.nodeName.toLowerCase() === 'span') {
            let text = node.textContent;
            const computedStyle = window.getComputedStyle(node);
            const fontWeight = computedStyle.getPropertyValue('font-weight');
            const fontStyle = computedStyle.getPropertyValue('font-style');

            let nodespan = document.createElement('span');
            spanrow.appendChild(nodespan);
            nodespan.style.fontSize = fontSize + 'px';
            nodespan.style.letterSpacing = 0 + 'px';
            nodespan.style.fontWeight = fontWeight;
            nodespan.style.fontStyle = fontStyle;

            for (let i = 0; i < text.length; i++) {

                nodespan.textContent += text[i];
                if (spanrow.offsetWidth >= elWidth) {
                    lines.push(spanrow.textContent)
                    while (spanrow.firstChild) {
                        spanrow.removeChild(spanrow.lastChild);
                    }
                    nodespan.textContent = text[i];
                    spanrow.appendChild(nodespan);
                }
            }
        }
    }
    lines.push(spanrow.textContent);
    app.removeChild(spanrow);
    return lines;
}

export const getActiveDiv = () => {
    let sel = window.getSelection();
    let range = sel.getRangeAt(0);
    let node = document.createElement('span');
    range.insertNode(node);
    range = range.cloneRange();
    range.selectNodeContents(node);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    let activeDiv = node.parentNode;
    node.parentNode.removeChild(node);
    return activeDiv;
}

export const rgbToHex = (rgbString) => {
    const matches = rgbString.match(/\d+/g);
    if (!matches || matches.length !== 3) {
        return null;
    }

    // Convert the extracted values to integers
    const r = parseInt(matches[0]);
    const g = parseInt(matches[1]);
    const b = parseInt(matches[2]);

    const hexR = r.toString(16).padStart(2, '0');
    const hexG = g.toString(16).padStart(2, '0');
    const hexB = b.toString(16).padStart(2, '0');

    // Concatenate the hexadecimal components
    const hexColor = `#${hexR}${hexG}${hexB}`;

    return hexColor.toUpperCase(); // Convert to uppercase for consistency
}

export const invertColor = (hexString) => {

    hexString = hexString.replace(/^#/, '');

    // Parse the r, g, b values
    let r = parseInt(hexString.slice(0, 2), 16);
    let g = parseInt(hexString.slice(2, 4), 16);
    let b = parseInt(hexString.slice(4, 6), 16);

    // Invert each color component
    r = (255 - r).toString(16).padStart(2, '0');
    g = (255 - g).toString(16).padStart(2, '0');
    b = (255 - b).toString(16).padStart(2, '0');

    // Return the inverted color
    return `#${r}${g}${b}`;
}

/** Dispatch event on click outside of node */
export function clickOutside(node) {
    const handleClick = event => {
        if (node && !node.contains(event.target) && !event.defaultPrevented) {
            node.dispatchEvent(
                new CustomEvent('click_outside', node)
            )
        }
    }

    document.addEventListener('click', handleClick, true);
  
    return {
        destroy() {
            document.removeEventListener('click', handleClick, true);
        }
    }
}
