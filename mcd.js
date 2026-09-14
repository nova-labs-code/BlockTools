/*
    MCD.js
    Minecraft Document Renderer
    Version 1.3

    Usage:

        <script src="mcd.js"></script>
        <script>
            MCD.load("guide.mcd");
        </script>

    Collapse behavior:

        - All collapsible things start collapsed.
        - Only one item can be open per hierarchy layer.
        - Topics: one open at a time.
        - Sections: one open at a time within their topic.
        - Subsections: one open at a time within their section.
        - Documents are NOT collapsible when only one document exists.
        - Documents become collapsible when more than one document exists.
        - When documents are collapsible, only one document
          can be open at a time.
*/

(function () {
    "use strict";

    const MCD = {};

    /* =========================================================
       CONFIGURATION
    ========================================================= */

    const CONFIG = {
        defaultWidth: 900,
        defaultImageWidth: 400
    };

    /* =========================================================
       CSS
    ========================================================= */

    function injectCSS() {
        if (document.getElementById("mcd-styles")) {
            return;
        }

        const style = document.createElement("style");

        style.id = "mcd-styles";

        style.textContent = `
            * {
                box-sizing: border-box;
                -webkit-tap-highlight-color: transparent;
            }

            html {
                touch-action: manipulation;
                overscroll-behavior-x: none;
                scroll-behavior: smooth;
            }

            body {
                margin: 0;
                min-height: 100vh;
                background: #090b10;
                color: #e8edf5;
                font-family:
                    -apple-system,
                    BlinkMacSystemFont,
                    "Segoe UI",
                    Roboto,
                    Helvetica,
                    Arial,
                    sans-serif;
                line-height: 1.6;
                touch-action: manipulation;
                overflow-x: hidden;
            }

            button,
            img,
            a {
                touch-action: manipulation;
            }

            a {
                color: #72b2ff;
                text-decoration: none;
            }

            a:hover {
                text-decoration: underline;
            }

            .mcd-app {
                width: 100%;
                min-height: 100vh;
            }

            .mcd-container {
                width: min(100% - 32px, ${CONFIG.defaultWidth}px);
                margin: 0 auto;
                padding: 40px 0 70px;
            }

            .mcd-header {
                margin-bottom: 32px;
                padding-bottom: 24px;
                border-bottom: 1px solid #242a35;
            }

            .mcd-title {
                margin: 0;
                color: #ffffff;
                font-size: clamp(2rem, 6vw, 3rem);
                line-height: 1.15;
                font-weight: 750;
                letter-spacing: -0.035em;
            }

            .mcd-description {
                margin: 14px 0 0;
                color: #9ba5b5;
                font-size: 1rem;
                line-height: 1.7;
            }

            .mcd-document {
                width: 100%;
            }

            /*
                IMPORTANT:

                A single document uses the normal
                .mcd-container layout.

                Multiple documents use the
                .mcd-document-collapsible layout.
            */

            .mcd-document-collapsible {
                width: min(100% - 32px, ${CONFIG.defaultWidth}px);
                margin: 40px auto 70px;
                border: 1px solid #242a35;
                border-radius: 14px;
                background: #10141b;
                overflow: hidden;
            }

            .mcd-document-collapsible > .mcd-document-content {
                width: 100%;
                padding: 0 0 30px;
            }

            .mcd-document-header {
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;

                padding: 18px 20px;

                border: 0;

                color: inherit;
                background: #151a22;

                font: inherit;
                text-align: left;

                cursor: pointer;
                touch-action: manipulation;
            }

            .mcd-document-header:hover {
                background: #191f29;
            }

            .mcd-document-title {
                margin: 0;
                color: #ffffff;
                font-size: 1.3rem;
                font-weight: 700;
            }

            .mcd-topic {
                margin: 0 0 22px;
                border: 1px solid #242a35;
                border-radius: 14px;
                background: #10141b;
                overflow: hidden;
            }

            .mcd-topic-header,
            .mcd-section-header,
            .mcd-subsection-header {
                width: 100%;
                border: 0;
                color: inherit;
                font: inherit;
                text-align: left;
                cursor: pointer;
                touch-action: manipulation;
            }

            .mcd-topic-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                padding: 18px 20px;
                background: #151a22;
            }

            .mcd-topic-header:hover {
                background: #191f29;
            }

            .mcd-topic-title {
                margin: 0;
                color: #ffffff;
                font-size: 1.3rem;
                font-weight: 700;
            }

            .mcd-topic-description {
                margin: 5px 0 0;
                color: #929cac;
                font-size: 0.92rem;
            }

            .mcd-section {
                border-top: 1px solid #242a35;
            }

            .mcd-section:first-child {
                border-top: 0;
            }

            .mcd-section-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 14px;
                padding: 15px 20px;
                background: #11161d;
            }

            .mcd-section-header:hover {
                background: #151a21;
            }

            .mcd-section-title {
                margin: 0;
                color: #edf1f7;
                font-size: 1.05rem;
                font-weight: 650;
            }

            .mcd-subsection {
                margin: 0 16px 14px;
                border: 1px solid #252c37;
                border-radius: 10px;
                overflow: hidden;
                background: #0d1117;
            }

            .mcd-subsection-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 14px;
                padding: 13px 15px;
                background: #131820;
            }

            .mcd-subsection-header:hover {
                background: #171d26;
            }

            .mcd-subsection-title {
                margin: 0;
                color: #e8edf5;
                font-size: 0.98rem;
                font-weight: 620;
            }

            .mcd-chevron {
                flex: 0 0 auto;
                width: 9px;
                height: 9px;
                border-right: 2px solid #8e99aa;
                border-bottom: 2px solid #8e99aa;
                transform: rotate(45deg);
                transition: transform 160ms ease;
                margin-right: 3px;
            }

            .mcd-open > .mcd-document-header .mcd-chevron,
            .mcd-open > .mcd-topic-header .mcd-chevron,
            .mcd-open > .mcd-section-header .mcd-chevron,
            .mcd-open > .mcd-subsection-header .mcd-chevron {
                transform: rotate(225deg);
            }

            .mcd-content {
                padding: 18px 20px 22px;
            }

            .mcd-section > .mcd-content {
                padding-top: 18px;
            }

            .mcd-subsection > .mcd-content {
                padding: 16px;
            }

            .mcd-collapsible-content {
                display: none;
            }

            .mcd-open > .mcd-collapsible-content {
                display: block;
            }

            .mcd-document-content {
                display: block;
            }

            .mcd-text {
                margin: 0 0 16px;
                color: #c4ccd8;
                white-space: pre-wrap;
            }

            .mcd-text:last-child {
                margin-bottom: 0;
            }

            .mcd-link {
                color: #72b2ff;
                font-weight: 500;
                text-decoration: none;
            }

            .mcd-link:hover {
                text-decoration: underline;
            }

            .mcd-link-external::after {
                content: " ↗";
                font-size: 0.8em;
                opacity: 0.7;
            }

            .mcd-image-block {
                margin: 22px 0;
            }

            .mcd-image-wrap {
                width: 100%;
            }

            .mcd-image {
                display: block;
                max-width: 100%;
                height: auto;
                border-radius: 10px;
                border: 1px solid #2a313d;
            }

            .mcd-image-position-left {
                margin-left: 0;
                margin-right: auto;
            }

            .mcd-image-position-center {
                margin-left: auto;
                margin-right: auto;
            }

            .mcd-image-position-right {
                margin-left: auto;
                margin-right: 0;
            }

            .mcd-image-caption {
                margin: 9px 0 0;
                color: #8993a3;
                font-size: 0.88rem;
                text-align: center;
            }

            .mcd-image-title {
                margin: 0 0 8px;
                color: #dce2eb;
                font-weight: 650;
            }

            .mcd-list {
                margin: 0 0 18px;
                padding-left: 24px;
                color: #c4ccd8;
            }

            .mcd-list li {
                margin: 5px 0;
            }

            .mcd-callout {
                margin: 18px 0;
                padding: 15px 17px;
                border: 1px solid #303744;
                border-radius: 10px;
                background: #131820;
            }

            .mcd-callout-title {
                margin: 0 0 6px;
                font-size: 0.78rem;
                font-weight: 750;
                letter-spacing: 0.08em;
                text-transform: uppercase;
            }

            .mcd-callout-content {
                margin: 0;
                color: #c5cdd8;
                white-space: pre-wrap;
            }

            .mcd-tip {
                border-left: 3px solid #4d9cff;
            }

            .mcd-tip .mcd-callout-title {
                color: #72b2ff;
            }

            .mcd-note {
                border-left: 3px solid #8b96a8;
            }

            .mcd-note .mcd-callout-title {
                color: #aeb7c5;
            }

            .mcd-warning {
                border-left: 3px solid #dca73a;
            }

            .mcd-warning .mcd-callout-title {
                color: #e5b64f;
            }

            .mcd-code {
                margin: 18px 0;
                padding: 15px 17px;
                border: 1px solid #292f39;
                border-radius: 10px;
                background: #080a0e;
                overflow-x: auto;
            }

            .mcd-code pre {
                margin: 0;
                color: #d2d9e4;
                font-family:
                    "SFMono-Regular",
                    Consolas,
                    "Liberation Mono",
                    monospace;
                font-size: 0.88rem;
                line-height: 1.6;
                white-space: pre;
            }

            .mcd-table-wrap {
                width: 100%;
                margin: 20px 0;
                overflow-x: auto;
                border: 1px solid #292f39;
                border-radius: 10px;
            }

            .mcd-table {
                width: 100%;
                border-collapse: collapse;
                min-width: 420px;
            }

            .mcd-table th,
            .mcd-table td {
                padding: 11px 13px;
                border-bottom: 1px solid #292f39;
                border-right: 1px solid #292f39;
                text-align: left;
            }

            .mcd-table th:last-child,
            .mcd-table td:last-child {
                border-right: 0;
            }

            .mcd-table tr:last-child td {
                border-bottom: 0;
            }

            .mcd-table th {
                color: #f0f3f8;
                background: #161b23;
                font-weight: 650;
            }

            .mcd-table td {
                color: #c2cad6;
                background: #0e1218;
            }

            .mcd-error {
                width: min(100% - 32px, ${CONFIG.defaultWidth}px);
                margin: 40px auto;
                padding: 18px;
                border: 1px solid #542d35;
                border-radius: 12px;
                background: #211419;
                color: #f1b9c1;
            }

            .mcd-error-title {
                margin: 0 0 6px;
                color: #ffccd2;
                font-weight: 700;
            }

            .mcd-error-message {
                margin: 0;
                white-space: pre-wrap;
                font-family:
                    "SFMono-Regular",
                    Consolas,
                    monospace;
                font-size: 0.85rem;
            }

            @media (max-width: 600px) {
                .mcd-container {
                    width: min(100% - 20px, ${CONFIG.defaultWidth}px);
                    padding-top: 24px;
                }

                .mcd-document-collapsible {
                    width: min(100% - 20px, ${CONFIG.defaultWidth}px);
                }

                .mcd-topic-header {
                    padding: 16px;
                }

                .mcd-section-header {
                    padding: 14px 16px;
                }

                .mcd-content {
                    padding: 15px 16px 18px;
                }

                .mcd-subsection {
                    margin-left: 10px;
                    margin-right: 10px;
                }

                .mcd-subsection > .mcd-content {
                    padding: 14px;
                }

                .mcd-title {
                    font-size: 2rem;
                }
            }
        `;

        document.head.appendChild(style);
    }

    /* =========================================================
       UTILITIES
    ========================================================= */

    function stripNotes(source) {
        return source.replace(/<[\s\S]*?>/g, "");
    }

    function unquote(value) {
        value = value.trim();

        if (
            value.length >= 2 &&
            value.startsWith('"') &&
            value.endsWith('"')
        ) {
            return value
                .slice(1, -1)
                .replace(/\\"/g, '"')
                .replace(/\\\\/g, "\\");
        }

        return value;
    }

    function parseCommand(line) {
        const match =
            line.match(/^([a-zA-Z_][\w-]*)(?:\s+(.*))?$/);

        if (!match) {
            return null;
        }

        return {
            command: match[1].toLowerCase(),
            value: match[2] ? match[2].trim() : ""
        };
    }

    function parseProperty(line) {
        const match =
            line.match(/^([a-zA-Z_][\w-]*)(?:\s+(.*))?$/);

        if (!match) {
            return null;
        }

        let value =
            match[2] ? match[2].trim() : "";

        if (
            value.startsWith('"') &&
            value.endsWith('"')
        ) {
            value = unquote(value);
        } else if (!Number.isNaN(Number(value))) {
            value = Number(value);
        }

        return {
            key: match[1].toLowerCase(),
            value
        };
    }

    function normalizePosition(position) {
        position =
            String(position || "center")
                .toLowerCase();

        if (
            position !== "left" &&
            position !== "right" &&
            position !== "center"
        ) {
            return "center";
        }

        return position;
    }

    function isExternalURL(url) {
        return (
            /^https?:\/\//i.test(url) ||
            /^\/\//.test(url)
        );
    }

    /* =========================================================
       PARSER
    ========================================================= */

    function parse(source) {
        source = stripNotes(source);

        const lines = source
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n")
            .split("\n");

        const root = {
            type: "root",
            children: []
        };

        const stack = [root];

        let i = 0;

        while (i < lines.length) {
            let raw = lines[i];
            let line = raw.trim();

            i++;

            if (!line) {
                continue;
            }

            const parsed =
                parseCommand(line);

            if (!parsed) {
                continue;
            }

            const command = parsed.command;
            const value = parsed.value;

            if (command === "end") {
                if (stack.length > 1) {
                    stack.pop();
                }

                continue;
            }

            if (
                command === "document" ||
                command === "topic" ||
                command === "section" ||
                command === "subsection"
            ) {
                const node = {
                    type: command,
                    title: unquote(value),
                    children: []
                };

                stack[stack.length - 1]
                    .children
                    .push(node);

                stack.push(node);

                continue;
            }

            if (
                command === "text" ||
                command === "tip" ||
                command === "note" ||
                command === "warning" ||
                command === "code"
            ) {
                const node = {
                    type: command,
                    content: []
                };

                while (i < lines.length) {
                    const contentLine =
                        lines[i].trim();

                    if (
                        contentLine.toLowerCase() ===
                        "end"
                    ) {
                        i++;
                        break;
                    }

                    node.content.push(lines[i]);
                    i++;
                }

                node.content =
                    node.content
                        .join("\n")
                        .trim();

                stack[stack.length - 1]
                    .children
                    .push(node);

                continue;
            }

            if (command === "list") {
                const node = {
                    type: "list",
                    items: []
                };

                while (i < lines.length) {
                    const itemLine =
                        lines[i].trim();

                    if (
                        itemLine.toLowerCase() ===
                        "end"
                    ) {
                        i++;
                        break;
                    }

                    if (itemLine) {
                        node.items.push(itemLine);
                    }

                    i++;
                }

                stack[stack.length - 1]
                    .children
                    .push(node);

                continue;
            }

            if (command === "link") {
                const linkMatch =
                    value.match(
                        /^(".*?"|\S+)\s+(".*?"|\S+)(?:\s+(.*))?$/
                    );

                if (linkMatch) {
                    const node = {
                        type: "link",
                        text: unquote(linkMatch[1]),
                        url: unquote(linkMatch[2]),
                        title: ""
                    };

                    if (linkMatch[3]) {
                        node.title =
                            unquote(linkMatch[3]);
                    }

                    stack[stack.length - 1]
                        .children
                        .push(node);
                }

                continue;
            }

            if (command === "image") {
                const node = {
                    type: "image",
                    src: unquote(value),
                    title: "",
                    alt: "",
                    caption: "",
                    width: CONFIG.defaultImageWidth,
                    position: "center"
                };

                while (i < lines.length) {
                    const propertyLine =
                        lines[i].trim();

                    if (
                        propertyLine.toLowerCase() ===
                        "end"
                    ) {
                        i++;
                        break;
                    }

                    if (propertyLine) {
                        const property =
                            parseProperty(
                                propertyLine
                            );

                        if (property) {
                            if (
                                property.key ===
                                "src"
                            ) {
                                node.src =
                                    String(
                                        property.value
                                    );
                            }

                            if (
                                property.key ===
                                "title"
                            ) {
                                node.title =
                                    String(
                                        property.value
                                    );
                            }

                            if (
                                property.key ===
                                "alt"
                            ) {
                                node.alt =
                                    String(
                                        property.value
                                    );
                            }

                            if (
                                property.key ===
                                "caption"
                            ) {
                                node.caption =
                                    String(
                                        property.value
                                    );
                            }

                            if (
                                property.key ===
                                "width"
                            ) {
                                const width =
                                    Number(
                                        property.value
                                    );

                                if (
                                    Number.isFinite(
                                        width
                                    ) &&
                                    width > 0
                                ) {
                                    node.width =
                                        width;
                                }
                            }

                            if (
                                property.key ===
                                "position"
                            ) {
                                node.position =
                                    normalizePosition(
                                        property.value
                                    );
                            }
                        }
                    }

                    i++;
                }

                stack[stack.length - 1]
                    .children
                    .push(node);

                continue;
            }

            if (command === "table") {
                const node = {
                    type: "table",
                    headers: [],
                    rows: []
                };

                while (i < lines.length) {
                    const tableLine =
                        lines[i].trim();

                    if (
                        tableLine.toLowerCase() ===
                        "end"
                    ) {
                        i++;
                        break;
                    }

                    if (
                        tableLine.toLowerCase() ===
                        "headers"
                    ) {
                        i++;

                        while (i < lines.length) {
                            const headerLine =
                                lines[i].trim();

                            if (
                                headerLine.toLowerCase() ===
                                "end"
                            ) {
                                i++;
                                break;
                            }

                            if (headerLine) {
                                node.headers =
                                    headerLine
                                        .split("|")
                                        .map(
                                            cell =>
                                                cell.trim()
                                        );
                            }

                            i++;
                        }

                        continue;
                    }

                    if (
                        tableLine.toLowerCase() ===
                        "row"
                    ) {
                        i++;

                        while (i < lines.length) {
                            const rowLine =
                                lines[i].trim();

                            if (
                                rowLine.toLowerCase() ===
                                "end"
                            ) {
                                i++;
                                break;
                            }

                            if (rowLine) {
                                node.rows.push(
                                    rowLine
                                        .split("|")
                                        .map(
                                            cell =>
                                                cell.trim()
                                        )
                                );
                            }

                            i++;
                        }

                        continue;
                    }

                    i++;
                }

                stack[stack.length - 1]
                    .children
                    .push(node);

                continue;
            }
        }

        return root;
    }

    /* =========================================================
       DOM HELPERS
    ========================================================= */

    function createElement(
        tag,
        className
    ) {
        const element =
            document.createElement(tag);

        if (className) {
            element.className =
                className;
        }

        return element;
    }

    function createChevron() {
        return createElement(
            "span",
            "mcd-chevron"
        );
    }

    function closeOpenSiblings(
        target
    ) {
        const parent =
            target.parentElement;

        if (!parent) {
            return;
        }

        Array.from(
            parent.children
        ).forEach(
            function (child) {
                if (
                    child !== target &&
                    child.classList.contains(
                        "mcd-open"
                    )
                ) {
                    child.classList.remove(
                        "mcd-open"
                    );
                }
            }
        );
    }

    function createCollapsibleHeader(
        className,
        titleClassName,
        title,
        target
    ) {
        const button =
            createElement(
                "button",
                className
            );

        button.type = "button";

        const titleElement =
            createElement(
                "span",
                titleClassName
            );

        titleElement.textContent =
            title;

        button.appendChild(
            titleElement
        );

        button.appendChild(
            createChevron()
        );

        button.addEventListener(
            "click",
            function () {
                const wasOpen =
                    target.classList.contains(
                        "mcd-open"
                    );

                if (wasOpen) {
                    target.classList.remove(
                        "mcd-open"
                    );

                    return;
                }

                closeOpenSiblings(
                    target
                );

                target.classList.add(
                    "mcd-open"
                );
            }
        );

        return button;
    }

    /* =========================================================
       CONTENT RENDERING
    ========================================================= */

    function renderText(
        node,
        parent
    ) {
        const element =
            createElement(
                "p",
                "mcd-text"
            );

        element.textContent =
            node.content;

        parent.appendChild(
            element
        );
    }

    function renderLink(
        node,
        parent,
        baseURL
    ) {
        const link =
            createElement(
                "a",
                "mcd-link"
            );

        link.textContent =
            node.text;

        let destination =
            node.url;

        try {
            destination =
                new URL(
                    node.url,
                    baseURL
                ).href;
        } catch (error) {
            destination =
                node.url;
        }

        link.href =
            destination;

        if (node.title) {
            link.title =
                node.title;
        }

        if (isExternalURL(destination)) {
            link.target = "_blank";
            link.rel =
                "noopener noreferrer";

            link.classList.add(
                "mcd-link-external"
            );
        }

        parent.appendChild(
            link
        );
    }

    function renderImage(
        node,
        parent,
        baseURL
    ) {
        const block =
            createElement(
                "figure",
                "mcd-image-block"
            );

        if (node.title) {
            const title =
                createElement(
                    "div",
                    "mcd-image-title"
                );

            title.textContent =
                node.title;

            block.appendChild(
                title
            );
        }

        const wrap =
            createElement(
                "div",
                "mcd-image-wrap"
            );

        const image =
            createElement(
                "img",
                "mcd-image"
            );

        try {
            image.src =
                new URL(
                    node.src,
                    baseURL
                ).href;
        } catch (error) {
            image.src =
                node.src;
        }

        image.alt =
            node.alt ||
            node.title ||
            "";

        if (node.title) {
            image.title =
                node.title;
        }

        image.style.width =
            `${Math.max(
                1,
                Number(node.width)
            )}px`;

        image.classList.add(
            `mcd-image-position-${node.position}`
        );

        wrap.appendChild(
            image
        );

        block.appendChild(
            wrap
        );

        if (node.caption) {
            const caption =
                createElement(
                    "figcaption",
                    "mcd-image-caption"
                );

            caption.textContent =
                node.caption;

            block.appendChild(
                caption
            );
        }

        parent.appendChild(
            block
        );
    }

    function renderList(
        node,
        parent
    ) {
        const list =
            createElement(
                "ul",
                "mcd-list"
            );

        node.items.forEach(
            function (item) {
                const li =
                    createElement(
                        "li"
                    );

                li.textContent =
                    item;

                list.appendChild(
                    li
                );
            }
        );

        parent.appendChild(
            list
        );
    }

    function renderCallout(
        node,
        parent
    ) {
        const box =
            createElement(
                "div",
                `mcd-callout mcd-${node.type}`
            );

        const title =
            createElement(
                "div",
                "mcd-callout-title"
            );

        const titles = {
            tip: "Tip",
            note: "Note",
            warning: "Warning"
        };

        title.textContent =
            titles[node.type] ||
            node.type;

        const content =
            createElement(
                "p",
                "mcd-callout-content"
            );

        content.textContent =
            node.content;

        box.appendChild(
            title
        );

        box.appendChild(
            content
        );

        parent.appendChild(
            box
        );
    }

    function renderCode(
        node,
        parent
    ) {
        const wrapper =
            createElement(
                "div",
                "mcd-code"
            );

        const pre =
            createElement(
                "pre"
            );

        pre.textContent =
            node.content;

        wrapper.appendChild(
            pre
        );

        parent.appendChild(
            wrapper
        );
    }

    function renderTable(
        node,
        parent
    ) {
        const wrapper =
            createElement(
                "div",
                "mcd-table-wrap"
            );

        const table =
            createElement(
                "table",
                "mcd-table"
            );

        if (node.headers.length) {
            const thead =
                createElement(
                    "thead"
                );

            const tr =
                createElement(
                    "tr"
                );

            node.headers.forEach(
                function (header) {
                    const th =
                        createElement(
                            "th"
                        );

                    th.textContent =
                        header;

                    tr.appendChild(
                        th
                    );
                }
            );

            thead.appendChild(
                tr
            );

            table.appendChild(
                thead
            );
        }

        const tbody =
            createElement(
                "tbody"
            );

        node.rows.forEach(
            function (row) {
                const tr =
                    createElement(
                        "tr"
                    );

                row.forEach(
                    function (cell) {
                        const td =
                            createElement(
                                "td"
                            );

                        td.textContent =
                            cell;

                        tr.appendChild(
                            td
                        );
                    }
                );

                tbody.appendChild(
                    tr
                );
            }
        );

        table.appendChild(
            tbody
        );

        wrapper.appendChild(
            table
        );

        parent.appendChild(
            wrapper
        );
    }

    /* =========================================================
       STRUCTURE RENDERING
    ========================================================= */

    function renderChildren(
        children,
        parent,
        baseURL,
        documentCollapsible
    ) {
        children.forEach(
            function (node) {
                renderNode(
                    node,
                    parent,
                    baseURL,
                    documentCollapsible
                );
            }
        );
    }

    function slugify(value) {
        return String(value || "")
            .toLowerCase()
            .trim()
            .replace(
                /[^a-z0-9]+/g,
                "-"
            )
            .replace(
                /^-+|-+$/g,
                ""
            );
    }

    function applyHeadingID(
        element,
        title
    ) {
        const id =
            slugify(title);

        if (id) {
            element.id =
                id;
        }

        return id;
    }

    /* =========================================================
       DOCUMENT RENDERING
    ========================================================= */

    function renderDocument(
        node,
        parent,
        baseURL,
        collapsible
    ) {
        /*
            SINGLE DOCUMENT

            This is the important fix.

            The document is rendered directly
            into the page as a normal container.

            No collapsible wrapper.
            No hidden content.
            No document header button.
        */

        if (!collapsible) {
            const container =
                createElement(
                    "div",
                    "mcd-container mcd-document"
                );

            const header =
                createElement(
                    "header",
                    "mcd-header"
                );

            const title =
                createElement(
                    "h1",
                    "mcd-title"
                );

            title.textContent =
                node.title;

            applyHeadingID(
                title,
                node.title
            );

            header.appendChild(
                title
            );

            if (node.description) {
                const description =
                    createElement(
                        "p",
                        "mcd-description"
                    );

                description.textContent =
                    node.description;

                header.appendChild(
                    description
                );
            }

            container.appendChild(
                header
            );

            renderChildren(
                node.children,
                container,
                baseURL,
                false
            );

            parent.appendChild(
                container
            );

            return;
        }


        /*
            MULTIPLE DOCUMENTS

            Documents become collapsible only
            when there is more than one.
        */

        const documentElement =
            createElement(
                "section",
                "mcd-document-collapsible mcd-document"
            );

        applyHeadingID(
            documentElement,
            node.title
        );

        const header =
            createCollapsibleHeader(
                "mcd-document-header",
                "mcd-document-title",
                node.title,
                documentElement
            );

        documentElement.appendChild(
            header
        );

        const content =
            createElement(
                "div",
                "mcd-document-content mcd-collapsible-content"
            );

        if (node.description) {
            const description =
                createElement(
                    "p",
                    "mcd-description"
                );

            description.textContent =
                node.description;

            content.appendChild(
                description
            );
        }

        renderChildren(
            node.children,
            content,
            baseURL,
            true
        );

        documentElement.appendChild(
            content
        );

        parent.appendChild(
            documentElement
        );
    }

    /* =========================================================
       TOPIC
    ========================================================= */

    function renderTopic(
        node,
        parent,
        baseURL,
        documentCollapsible
    ) {
        const topic =
            createElement(
                "section",
                "mcd-topic"
            );

        applyHeadingID(
            topic,
            node.title
        );

        const header =
            createCollapsibleHeader(
                "mcd-topic-header",
                "mcd-topic-title",
                node.title,
                topic
            );

        topic.appendChild(
            header
        );

        const content =
            createElement(
                "div",
                "mcd-collapsible-content mcd-content"
            );

        renderChildren(
            node.children,
            content,
            baseURL,
            documentCollapsible
        );

        topic.appendChild(
            content
        );

        parent.appendChild(
            topic
        );
    }

    /* =========================================================
       SECTION
    ========================================================= */

    function renderSection(
        node,
        parent,
        baseURL,
        documentCollapsible
    ) {
        const section =
            createElement(
                "section",
                "mcd-section"
            );

        applyHeadingID(
            section,
            node.title
        );

        const header =
            createCollapsibleHeader(
                "mcd-section-header",
                "mcd-section-title",
                node.title,
                section
            );

        section.appendChild(
            header
        );

        const content =
            createElement(
                "div",
                "mcd-collapsible-content mcd-content"
            );

        renderChildren(
            node.children,
            content,
            baseURL,
            documentCollapsible
        );

        section.appendChild(
            content
        );

        parent.appendChild(
            section
        );
    }

    /* =========================================================
       SUBSECTION
    ========================================================= */

    function renderSubsection(
        node,
        parent,
        baseURL,
        documentCollapsible
    ) {
        const subsection =
            createElement(
                "section",
                "mcd-subsection"
            );

        applyHeadingID(
            subsection,
            node.title
        );

        const header =
            createCollapsibleHeader(
                "mcd-subsection-header",
                "mcd-subsection-title",
                node.title,
                subsection
            );

        subsection.appendChild(
            header
        );

        const content =
            createElement(
                "div",
                "mcd-collapsible-content mcd-content"
            );

        renderChildren(
            node.children,
            content,
            baseURL,
            documentCollapsible
        );

        subsection.appendChild(
            content
        );

        parent.appendChild(
            subsection
        );
    }

    /* =========================================================
       NODE RENDERER
    ========================================================= */

    function renderNode(
        node,
        parent,
        baseURL,
        documentCollapsible
    ) {
        switch (node.type) {

            case "document":
                renderDocument(
                    node,
                    parent,
                    baseURL,
                    documentCollapsible
                );
                break;

            case "topic":
                renderTopic(
                    node,
                    parent,
                    baseURL,
                    documentCollapsible
                );
                break;

            case "section":
                renderSection(
                    node,
                    parent,
                    baseURL,
                    documentCollapsible
                );
                break;

            case "subsection":
                renderSubsection(
                    node,
                    parent,
                    baseURL,
                    documentCollapsible
                );
                break;

            case "text":
                renderText(
                    node,
                    parent
                );
                break;

            case "link":
                renderLink(
                    node,
                    parent,
                    baseURL
                );
                break;

            case "image":
                renderImage(
                    node,
                    parent,
                    baseURL
                );
                break;

            case "list":
                renderList(
                    node,
                    parent
                );
                break;

            case "table":
                renderTable(
                    node,
                    parent
                );
                break;

            case "tip":
            case "note":
            case "warning":
                renderCallout(
                    node,
                    parent
                );
                break;

            case "code":
                renderCode(
                    node,
                    parent
                );
                break;
        }
    }

    /* =========================================================
       DOCUMENT DESCRIPTION
    ========================================================= */

    function extractDocumentDescription(
        source
    ) {
        const match =
            source.match(
                /^\s*description\s+"([\s\S]*?)"\s*$/m
            );

        return match
            ? match[1]
            : "";
    }

    function applyDocumentDescription(
        tree,
        source
    ) {
        const description =
            extractDocumentDescription(
                stripNotes(source)
            );

        const documents =
            tree.children.filter(
                node =>
                    node.type ===
                    "document"
            );

        /*
            Apply the description to the first
            document, matching the existing format.
        */

        if (documents.length) {
            documents[0].description =
                description;
        }
    }

    /* =========================================================
       ERROR UI
    ========================================================= */

    function showError(
        target,
        message
    ) {
        target.innerHTML = "";

        const error =
            createElement(
                "div",
                "mcd-error"
            );

        const title =
            createElement(
                "div",
                "mcd-error-title"
            );

        title.textContent =
            "Unable to load Minecraft document";

        const text =
            createElement(
                "p",
                "mcd-error-message"
            );

        text.textContent =
            message;

        error.appendChild(
            title
        );

        error.appendChild(
            text
        );

        target.appendChild(
            error
        );
    }

    /* =========================================================
       TARGET RESOLUTION
    ========================================================= */

    function resolveTarget(
        target
    ) {
        if (!target) {
            return document.body;
        }

        if (
            typeof target ===
            "string"
        ) {
            return document.querySelector(
                target
            );
        }

        if (
            target instanceof Element
        ) {
            return target;
        }

        return null;
    }

    /* =========================================================
       LOAD
    ========================================================= */

    MCD.load = async function (
        url,
        target
    ) {
        injectCSS();

        const targetElement =
            resolveTarget(target);

        if (!targetElement) {
            throw new Error(
                "MCD target element could not be found."
            );
        }

        targetElement.innerHTML =
            "";

        try {
            const response =
                await fetch(
                    url,
                    {
                        cache: "no-cache"
                    }
                );

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status} while loading "${url}".`
                );
            }

            const source =
                await response.text();

            const tree =
                parse(source);

            applyDocumentDescription(
                tree,
                source
            );

            targetElement.classList.add(
                "mcd-app"
            );

            const baseURL =
                new URL(
                    url,
                    document.baseURI
                ).href;

            /*
                Count ONLY top-level documents.

                One document:
                    normal document

                Multiple documents:
                    collapsible documents
            */

            const documents =
                tree.children.filter(
                    node =>
                        node.type ===
                        "document"
                );

            const documentCollapsible =
                documents.length > 1;

            renderChildren(
                tree.children,
                targetElement,
                baseURL,
                documentCollapsible
            );

            return tree;

        } catch (error) {

            showError(
                targetElement,
                error.message ||
                "An unknown error occurred."
            );

            throw error;
        }
    };

    /* =========================================================
       PARSER API
    ========================================================= */

    MCD.parse = function (
        source
    ) {
        return parse(source);
    };

    /* =========================================================
       GLOBAL API
    ========================================================= */

    window.MCD = MCD;

})();