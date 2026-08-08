import * as pdfjsLib
    from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";


const {
    PDFDocument,
    rgb,
    StandardFonts
} = window.PDFLib;


let pdfFile = null;

let pdfBytes = null;

let pdfDocument = null;

let currentPage = 1;

let currentTool = "select";

let scale = 1.4;

let drawing = false;

let startX = 0;
let startY = 0;


/* ELEMENTS ADDED BY USER */

let pageElements = {};


/* DOM */

const pdfInput =
    document.getElementById("pdfInput");

const imageInput =
    document.getElementById("imageInput");

const openBtn =
    document.getElementById("openBtn");

const startBtn =
    document.getElementById("startBtn");

const textBtn =
    document.getElementById("textBtn");

const imageBtn =
    document.getElementById("imageBtn");

const drawBtn =
    document.getElementById("drawBtn");

const whiteoutBtn =
    document.getElementById("whiteoutBtn");

const undoBtn =
    document.getElementById("undoBtn");

const downloadBtn =
    document.getElementById("downloadBtn");

const emptyState =
    document.getElementById("emptyState");

const editor =
    document.getElementById("editor");

const pageList =
    document.getElementById("pageList");

const pdfCanvas =
    document.getElementById("pdfCanvas");

const drawingCanvas =
    document.getElementById("drawingCanvas");

const elementsLayer =
    document.getElementById("elementsLayer");

const pdfCtx =
    pdfCanvas.getContext("2d");

const drawingCtx =
    drawingCanvas.getContext("2d");


/* OPEN PDF */

openBtn.onclick = () => {

    pdfInput.click();

};


startBtn.onclick = () => {

    pdfInput.click();

};


pdfInput.onchange = async (event) => {

    const file = event.target.files[0];

    if (!file) return;

    pdfFile = file;

    pdfBytes =
        await file.arrayBuffer();

    await loadPDF(pdfBytes);

};


/* LOAD PDF */

async function loadPDF(bytes) {

    pdfDocument =
        await pdfjsLib.getDocument({
            data: bytes
        }).promise;

    emptyState.classList.add("hidden");

    editor.classList.remove("hidden");

    pageElements = {};

    createThumbnails();

    await renderPage(1);

}


/* RENDER PAGE */

async function renderPage(pageNumber) {

    currentPage = pageNumber;

    const page =
        await pdfDocument.getPage(pageNumber);


    const viewport =
        page.getViewport({
            scale
        });


    pdfCanvas.width =
        viewport.width;

    pdfCanvas.height =
        viewport.height;


    drawingCanvas.width =
        viewport.width;

    drawingCanvas.height =
        viewport.height;


    drawingCanvas.style.width =
        viewport.width + "px";

    drawingCanvas.style.height =
        viewport.height + "px";


    elementsLayer.style.width =
        viewport.width + "px";

    elementsLayer.style.height =
        viewport.height + "px";


    await page.render({

        canvasContext: pdfCtx,

        viewport

    }).promise;


    drawingCtx.clearRect(
        0,
        0,
        drawingCanvas.width,
        drawingCanvas.height
    );


    renderElements();

}


/* THUMBNAILS */

async function createThumbnails() {

    pageList.innerHTML = "";

    for (
        let i = 1;
        i <= pdfDocument.numPages;
        i++
    ) {

        const page =
            await pdfDocument.getPage(i);

        const viewport =
            page.getViewport({
                scale: .2
            });


        const canvas =
            document.createElement("canvas");

        canvas.width =
            viewport.width;

        canvas.height =
            viewport.height;

        canvas.className =
            "thumbnail";


        await page.render({

            canvasContext:
                canvas.getContext("2d"),

            viewport

        }).promise;


        canvas.onclick =
            () => renderPage(i);


        pageList.appendChild(canvas);

    }

}


/* TEXT TOOL */

textBtn.onclick = () => {

    currentTool = "text";

    alert(
        "Click anywhere on the PDF to add text."
    );

};


/* CLICK TO ADD TEXT */

elementsLayer.addEventListener(
    "click",
    (event) => {

        if (currentTool !== "text")
            return;


        const rect =
            elementsLayer.getBoundingClientRect();


        const x =
            event.clientX - rect.left;

        const y =
            event.clientY - rect.top;


        addTextElement(
            x,
            y
        );


        currentTool = "select";

    }
);


function addTextElement(x, y) {

    const div =
        document.createElement("div");


    div.className =
        "text-element";


    div.contentEditable =
        "true";


    div.innerText =
        "Edit this text";


    div.style.left =
        x + "px";


    div.style.top =
        y + "px";


    div.style.fontSize =
        "18px";


    div.onclick =
        (event) => {

            event.stopPropagation();

        };


    div.oninput =
        saveElements;


    elementsLayer.appendChild(div);


    if (!pageElements[currentPage])
        pageElements[currentPage] = [];


    pageElements[currentPage].push({

        type: "text",

        x,

        y,

        text: "Edit this text",

        fontSize: 18

    });


    saveElements();

}


/* SAVE ELEMENT POSITIONS */

function saveElements() {

    if (!pageElements[currentPage])
        pageElements[currentPage] = [];


    const elements =
        elementsLayer.querySelectorAll(
            ".text-element"
        );


    pageElements[currentPage] = [];


    elements.forEach(el => {

        pageElements[currentPage].push({

            type: "text",

            x: parseFloat(el.style.left),

            y: parseFloat(el.style.top),

            text: el.innerText,

            fontSize:
                parseFloat(el.style.fontSize)

        });

    });

}


/* DISPLAY ELEMENTS */

function renderElements() {

    elementsLayer.innerHTML = "";


    const elements =
        pageElements[currentPage] || [];


    elements.forEach(item => {

        if (item.type === "text") {

            const div =
                document.createElement("div");


            div.className =
                "text-element";


            div.contentEditable =
                "true";


            div.innerText =
                item.text;


            div.style.left =
                item.x + "px";


            div.style.top =
                item.y + "px";


            div.style.fontSize =
                item.fontSize + "px";


            div.oninput =
                saveElements;


            elementsLayer.appendChild(div);

        }

    });

}


/* IMAGE TOOL */

imageBtn.onclick = () => {

    currentTool = "image";

    imageInput.click();

};


imageInput.onchange = async (event) => {

    const file =
        event.target.files[0];

    if (!file) return;


    const dataURL =
        await fileToDataURL(file);


    const img =
        document.createElement("img");


    img.src = dataURL;

    img.className =
        "image-element";


    img.style.left = "100px";

    img.style.top = "100px";


    elementsLayer.appendChild(img);


    if (!pageElements[currentPage])
        pageElements[currentPage] = [];


    pageElements[currentPage].push({

        type: "image",

        src: dataURL,

        x: 100,

        y: 100

    });


    imageInput.value = "";

};


function fileToDataURL(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();

            reader.onload =
                () => resolve(reader.result);

            reader.onerror =
                reject;

            reader.readAsDataURL(file);

        }
    );

}


/* DRAW TOOL */

drawBtn.onclick = () => {

    currentTool = "draw";

    drawingCanvas.style.pointerEvents =
        "auto";

};


/* DRAWING */

drawingCanvas.addEventListener(
    "mousedown",
    event => {

        if (currentTool !== "draw")
            return;


        drawing = true;


        startX =
            event.offsetX;

        startY =
            event.offsetY;


        drawingCtx.beginPath();

        drawingCtx.moveTo(
            startX,
            startY
        );

    }
);


drawingCanvas.addEventListener(
    "mousemove",
    event => {

        if (!drawing)
            return;


        drawingCtx.lineWidth = 3;

        drawingCtx.lineCap = "round";

        drawingCtx.strokeStyle =
            "#ef4444";


        drawingCtx.lineTo(
            event.offsetX,
            event.offsetY
        );


        drawingCtx.stroke();

    }
);


drawingCanvas.addEventListener(
    "mouseup",
    () => {

        drawing = false;

    }
);


/* WHITEOUT */

whiteoutBtn.onclick = () => {

    currentTool = "whiteout";

    drawingCanvas.style.pointerEvents =
        "auto";

};


drawingCanvas.addEventListener(
    "mousedown",
    event => {

        if (currentTool !== "whiteout")
            return;


        drawing = true;

        startX =
            event.offsetX;

        startY =
            event.offsetY;

    }
);


drawingCanvas.addEventListener(
    "mouseup",
    event => {

        if (
            currentTool !==
            "whiteout"
        )
            return;


        drawing = false;


        const width =
            event.offsetX - startX;

        const height =
            event.offsetY - startY;


        drawingCtx.fillStyle =
            "white";


        drawingCtx.fillRect(
            startX,
            startY,
            width,
            height
        );

    }
);


/* DOWNLOAD */

downloadBtn.onclick =
    async () => {

        if (!pdfBytes) {

            alert(
                "Please open a PDF first."
            );

            return;

        }


        const pdfDoc =
            await PDFDocument.load(
                pdfBytes
            );


        const font =
            await pdfDoc.embedFont(
                StandardFonts.Helvetica
            );


        const pages =
            pdfDoc.getPages();


        for (
            let pageIndex = 0;
            pageIndex < pages.length;
            pageIndex++
        ) {

            const page =
                pages[pageIndex];


            const elements =
                pageElements[
                    pageIndex + 1
                ] || [];


            const {
                width,
                height
            } = page.getSize();


            for (
                const element
                of elements
            ) {

                if (
                    element.type ===
                    "text"
                ) {

                    const pdfX =
                        element.x /
                        scale;


                    const pdfY =
                        height -
                        (element.y /
                        scale) -
                        element.fontSize;


                    page.drawText(
                        element.text,
                        {

                            x: pdfX,

                            y: pdfY,

                            size:
                                element.fontSize,

                            font,

                            color:
                                rgb(
                                    0,
                                    0,
                                    0
                                )

                        }
                    );

                }

            }

        }


        const finalBytes =
            await pdfDoc.save();


        downloadFile(
            finalBytes,
            "edited.pdf"
        );

    };


/* DOWNLOAD HELPER */

function downloadFile(
    bytes,
    filename
) {

    const blob =
        new Blob(
            [bytes],
            {
                type:
                    "application/pdf"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const a =
        document.createElement("a");


    a.href = url;

    a.download = filename;

    a.click();


    URL.revokeObjectURL(url);

}
