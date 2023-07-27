let ipnError = () => {
    const ipnToast = document.querySelector(".ipn-error");
    ipnToast.click();
}
let updateTillPage = async () => {
    const pdfFile = document.getElementById("multiplePagesPDF").files[0];
    if (!pdfFile) {
        const errorToast = document.querySelector(".error-pdf-only");
        errorToast.click();
        return;
    }

    const multiplePagesPDFBuffer = await readFileAsArrayBuffer(pdfFile);
    const pdfDoc = await PDFLib.PDFDocument.load(multiplePagesPDFBuffer);
    const totalPages = pdfDoc.getPageCount();
    const tillPage = document.getElementById("tillPage");
    tillPage.value = totalPages;
}

async function mergePDFs() {
    const progressBar = document.getElementById("progressBar");
    progressBar.style.width = "0%";
    if (progressBar.classList.contains("bg-success"))
        progressBar.classList.remove("bg-success");

    const multiplePagesPDFFile = document.getElementById("multiplePagesPDF").files[0];
    const singlePagePDFFile = document.getElementById("singlePagePDF").files[0];

    if (!multiplePagesPDFFile || !singlePagePDFFile) {
        const errorToast = document.querySelector(".error-pdf-only");
        errorToast.click();
        return;
    }

    try {
        const multiplePagesPDFBuffer = await readFileAsArrayBuffer(multiplePagesPDFFile);
        const singlePagePDFBuffer = await readFileAsArrayBuffer(singlePagePDFFile);

        const multiplePagesPDFDoc = await PDFLib.PDFDocument.load(multiplePagesPDFBuffer);
        const singlePagePDFDoc = await PDFLib.PDFDocument.load(singlePagePDFBuffer);

        const singlePageCount = singlePagePDFDoc.getPageCount();
        if (singlePageCount !== 1) {
            const errorToast = document.querySelector(".error-single-sheet-only");
            errorToast.click();
            return;
        }

        const mergedPDFDoc = await PDFLib.PDFDocument.create();
        const totalPages = multiplePagesPDFDoc.getPageCount();
        // const existingPage = await mergedPDFDoc.copyPages(singlePagePDFDoc, [0]);

        var progressPercentage;
        var fromPage = parseInt(document.getElementById("fromPage").value);
        var tillPage = parseInt(document.getElementById("tillPage").value);
        fromPage -= 1;
        tillPage -= 1;

        if (fromPage < 0 || tillPage < 0) {
            console.log("Page cannot be zero or less than zero!");
            ipnError();
            return;
        }

        if (tillPage > totalPages) {
            console.log("Till page cannot be greater than actual number of pages!");
            ipnError();
            return;
        }

        if (fromPage > tillPage) {
            console.log("From page cannot be greater than till page!");
            ipnError();
            return;
        }

        for (let i = fromPage; i <= tillPage; i++) {
            const sinpage = await mergedPDFDoc.copyPages(singlePagePDFDoc, [0]);
            mergedPDFDoc.addPage(sinpage[0]);
            const mulpage = await mergedPDFDoc.copyPages(multiplePagesPDFDoc, [i]);
            mergedPDFDoc.addPage(mulpage[0]);
        }

        for (let i = 0; i < (tillPage - fromPage + 1); i++) {
            progressPercentage = Math.floor(((i + 1) / (tillPage - fromPage + 1)) * 100);
            progressBar.style.width = `${progressPercentage}%`;
            progressBar.innerText = `${progressPercentage + 1}%`;

            if (progressPercentage >= 99) {
                progressBar.classList.add("bg-success");
                progressBar.innerText = "File merged successfully!";
                const successToast = document.querySelector("#successBtn");
                successToast.click();
            }
        }

        const mergedPDFBytes = await mergedPDFDoc.save();

        // Create a Blob with the merged PDF data and create a download link
        const mergedPDFBlob = new Blob([mergedPDFBytes], { type: "application/pdf" });
        const downloadLink = window.URL.createObjectURL(mergedPDFBlob);

        if (document.getElementById("added-download-btn")) {
            document.getElementById("added-download-btn").remove();
        }
        const actionBtn = document.getElementById("action-buttons");
        actionBtn.innerHTML = actionBtn.innerHTML + "<a href='" + downloadLink + "' download='practical_merged.pdf' class='btn btn-primary rounded-5 px-4 py-2 ms-4'id='added-download-btn'>Download PDF</a>";

        const obj = document.getElementById("pdfPreview");
        obj.innerHTML = "<object data='" + downloadLink + "' type='application/pdf' width='100%' height='600px'>";

        document.body.appendChild(obj);

        console.log("PDFs merged successfully!");
    } catch (error) {
        console.log(error);
        const errorToast = document.querySelector(".error-pdf-only");
        errorToast.click();
    }
}

function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}