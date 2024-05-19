// see getOffsetFromIndex
export const getPosFromIndex = (index, element, lines) => {
    let cursorIndex = index;
    let elWidth = window.innerWidth - 288 * 2;
    let linesCount = 1;

    let spanrow = document.createElement('span');
    let app = document.getElementById('app');
    app.appendChild(spanrow);

    let charactersCount = 0;

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
                if (spanrow.offsetWidth >= elWidth) {
                    while (spanrow.firstChild) {
                        spanrow.removeChild(spanrow.lastChild);
                    }
                    nodespan.textContent = text[i];
                    spanrow.appendChild(nodespan);
                    linesCount++;
                }
                if (linesCount == lines) {
                    cursorIndex = index + charactersCount;
                    break;
                }
                charactersCount++;
            }
        }
    }

    app.removeChild(spanrow);
    return cursorIndex;
}

// see getIndexFromOffset
export const  getIndexInCurrentLine = (cursorIndex, element) => {
    let index = cursorIndex;
    let inline = 0;
    let elWidth = window.innerWidth - 288 * 2;

    let spanrow = document.createElement('span');
    let app = document.getElementById('app');
    app.appendChild(spanrow);

    let charactersCount = 0;
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
                if (spanrow.offsetWidth >= elWidth) {
                    inline = 0;
                    while (spanrow.firstChild) {
                        spanrow.removeChild(spanrow.lastChild);
                    }
                    nodespan.textContent = text[i];
                    spanrow.appendChild(nodespan);
                } else {
                    inline++;
                }

                if (charactersCount === cursorIndex || (i == text.length - 1 && j == element.childNodes.length - 1)) {
                    index = inline;
                    break;
                }
                charactersCount++;
            }
        }
    }

    app.removeChild(spanrow);
    return index;
}

// see getCurrRow
export const getLine = (element) => {
    let selection = window.getSelection();
    let range = selection.getRangeAt(0);
    let startNode = range.startContainer;
    let startOffset = range.startOffset;

    let textNodeRange = document.createRange();
    textNodeRange.selectNodeContents(element);

    textNodeRange.setEnd(startNode, startOffset);
    textNodeRange.collapse(true);

    let rect = range.getBoundingClientRect();
    let lineHeight = 24;
    let currentRow = Math.ceil((rect.top - element.getBoundingClientRect().top) / lineHeight) + 1;

    return currentRow;
}

// gets total line in span
// can get this from the length of the array returned from getWrap
export const getTotalLines = (element, lineHeight) => {      
    let divHeight = element.offsetHeight 
    let lines = divHeight / lineHeight; 
    return lines;
}
