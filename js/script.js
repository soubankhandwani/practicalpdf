async function mergePDFs() {
    const progressBar = document.getElementById("progressBar");
    progressBar.style.width = "0%";

    if(progressBar.classList.contains("bg-success"))
        progressBar.classList.remove("bg-success")

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

        const pdfDoc = await PDFLib.PDFDocument.load(multiplePagesPDFBuffer);
        const singlePagePDF = await PDFLib.PDFDocument.load(singlePagePDFBuffer);

        const singlePageCount = singlePagePDF.getPageCount();
        if (singlePageCount != 1) {
            const errorToast = document.querySelector(".error-single-sheet-only");
            errorToast.click();
            return;
        }
        const totalPages = pdfDoc.getPageCount();
        const [existingPage] = await pdfDoc.copyPages(singlePagePDF, [0])
        var progressPercentage;
        for (let i = 0; i < (totalPages * 2); i++) {
            if (i % 2 == 0) {
                pdfDoc.insertPage(i, existingPage)
                // console.log("Performing!")

                //Simulates a sleep function. Only enable to test the coordination between progress bar and actual progress.
                // await new Promise(r => setTimeout(r, 200));
            }
            progressPercentage = Math.floor(((i + 1) / totalPages / 2) * 100);
            progressBar.style.width = `${progressPercentage}%`;
            progressBar.innerText = `${progressPercentage + 1}%`;
            if (progressPercentage >= 99) {
                progressBar.classList.add("bg-success");
                progressBar.innerText = "File merged successfully!";
                const successToast = document.querySelector("#successBtn");
                successToast.click();
            }
        }

        const mergedPDFBytes = await pdfDoc.save();

        // Create a Blob with the merged PDF data and create a download link
        const mergedPDFBlob = new Blob([mergedPDFBytes], { type: "application/pdf" });
        const downloadLink = URL.createObjectURL(mergedPDFBlob);

        // Trigger download
        // const a = document.createElement("a");
        // a.href = downloadLink;
        // a.download = "practical_merged.pdf";
        // a.innerText = "Download";
        // document.body.appendChild(a);

        if(document.getElementById("added-download-btn")){
            document.getElementById("added-download-btn").remove();
        }
        const actionBtn = document.getElementById("action-buttons");
        actionBtn.innerHTML = actionBtn.innerHTML + "<a href='"+ downloadLink +"' download='practical_merged.pdf' class='btn btn-primary rounded-5 px-4 py-2 ms-4'id='added-download-btn'>Download PDF</a>";

        const obj = document.getElementById("pdfPreview")
        obj.innerHTML = "<object data='" + downloadLink + "' type='application/pdf' width='100%' height='600px'>"
        document.body.appendChild(obj);

        // Enable for auto-download
        // a.click();

        // Reset progress
        // progressBar.innerText = "File Merged Successfully"
        document.getElementById("scroll-click").click();

        console.log("PDFs merged successfully!");
    } catch (error) {
        console.log(error)
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