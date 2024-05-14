export const focusEnd = (element) => {
    element.focus();
    if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
        let range = document.createRange();
        range.selectNodeContents(element);
        range.collapse(false);
        let sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    // @ts-ignore
    } else if (typeof document.body.createTextRange != "undefined") {
        // @ts-ignore
        let textRange = document.body.createTextRange();
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
            }else{
                pos -= node.length;
            }
        } else{
            pos = focuspos(node,pos + 1);
            if(pos == -1){
                return -1; // no need to finish the for loop
            }
        }
    }
    return pos; // needed because of recursion stuff
}

export const getCursorPos = (element) => {
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
        if (cum + wrapped[i].length > cursorIndex) return i + 1;
        else cum += wrapped[i].length;
    }
    return 1;
}

// gets total line in span
export const getTotalLines = (element) => {      
    let divHeight = element.offsetHeight 
    let lines = divHeight / 24; 
    return lines;
}

// get cursorIndex from position in (last) line
export const getOffsetFromIndex = (index, wrapped) => {
    let cum = 0;
    for (let i = 0; i < wrapped - 1; i++) {
        cum += wrapped[i].length;
    }
    return cum + index;
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
export const getWrapped = (element) => {
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
            nodespan.style.fontSize = 16 + 'px';
            nodespan.style.letterSpacing = 0 + 'px';
            nodespan.style.fontWeight = fontWeight;
            nodespan.style.fontStyle = fontStyle;

            for (let i = 0; i < text.length; i++) {

                nodespan.textContent += text[i];
                console.log(text[i], spanrow.offsetWidth)
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
