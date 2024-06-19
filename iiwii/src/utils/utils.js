// @ts-nocheck
// focuses div at end
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

// focuses div at position
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

// gets the caret offset of an element
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

// gets the start and end positions of a selection
export const getSelectionOffsets = (contentEditableElement) => {
    let selection = window.getSelection();
    let anchorNode = selection.anchorNode;
    let focusNode = selection.focusNode;
    let anchorOffset = selection.anchorOffset;
    let focusOffset = selection.focusOffset;

    function getTextOffset(node, offset) {
        let length = 0;
        let found = false;

        function traverseNodes(currentNode) {
            if (found) return;
            if (currentNode.nodeType === Node.TEXT_NODE) {
                if (currentNode === node) {
                    length += offset;
                    found = true;
                } else {
                    length += currentNode.textContent.length;
                }
            } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
                for (let i = 0; i < currentNode.childNodes.length; i++) {
                    traverseNodes(currentNode.childNodes[i]);
                    if (found) break;
                }
            }
        }

        traverseNodes(contentEditableElement);
        return length;
    }

    // Calculate start and end offsets
    let start = getTextOffset(anchorNode, anchorOffset);
    let end = getTextOffset(focusNode, focusOffset);

    // Ensure start is always less than or equal to end
    if (start > end) {
        [start, end] = [end, start];
    }

    return { start, end };
}

// get the elements that have been selected
export const getCoverage = (start, end, content) => {
    let cum = 0;
    let ids = [];
    let srange = [0, 0];
    for (let i = 0; i < content.length; i++) {
        // start of selection occurs in this node
        if (cum <= start && cum + content[i].content.length > start) {
            ids.push(i);
            // select entirely in one node
            if (cum + content[i].content.length >= end) {
                srange = [start - cum, end - cum]
            } 
            // select starts in this node
            else {
                srange[0] = start - cum;
            }
        // selection covers the entire node
        } else if (cum > start && cum + content[i].content.length < end) {
            ids.push(i);
        // end of selection occurs in this node
        } else if (cum < end && cum + content[i].content.length >= end) {
            ids.push(i);
            srange[1] = end - cum;
        }
        cum += content[i].content.length;
    }
    return [ids, srange];
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
        if (node.nodeName.toLowerCase() === 'span') {
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

// get the current active div
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

// get the current active span
export const getActiveSpan = (div) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return null;
    let node = selection.focusNode;
    while (node && node !== div) {
        // @ts-ignore
        if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'SPAN') {
            return node;
        }
        node = node.parentNode;
    }
    return null;
}

// returns whether an object is deeply equal to each other
export const deepEqual = (obj1, obj2) => {
    // Check if both arguments are objects
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
        return obj1 === obj2;
    }

    // Check if they have the same number of keys
    let keys1 = Object.keys(obj1);
    let keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) {
        return false;
    }

    // Check if all keys and values are the same
    for (let key of keys1) {
        if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
            return false;
        }
    }

    return true;
}

/** Dispatch event on click outside of node */
export const clickOutside = (node) => {
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

// focuses element after creation
export const focusElement = (id) => {
    setTimeout(() => {
        let newline = document.getElementById(id.toString());
        if (newline) {
            newline.tabIndex = -1;
            newline.setAttribute('tabIndex', "-1")
            focuspos(newline, 0);
            newline.removeAttribute('tabIndex')
        }
    }, 100);
}

// hide icons when contextmenu
export const hideIcons = () => {
    const icons = document.getElementsByClassName('icons');
    for (const icon of icons) {
        // @ts-ignore
        icon.style.visibility = 'hidden';
    }
    let body = document.getElementById('homepage');
    if (body) body.style.overflowY = 'hidden';
}
