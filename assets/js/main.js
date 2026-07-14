const MAX_FILE_SIZE =
    30 * 1024 * 1024;

const keyStatus =
    document.getElementById("keyStatus");

const errorBox =
    document.getElementById("errorBox");

const attachBtn =
    document.getElementById("attachBtn");

const fileInput =
    document.getElementById("fileInput");

const dropZone =
    document.getElementById("dropZone");

const fileInfo =
    document.getElementById("fileInfo");

const tokenInput =
    document.getElementById("tokenInput");

const uploadBtn =
    document.getElementById("uploadBtn");

const showToken =
    document.getElementById("showToken");

const multiToggle =
    document.getElementById("multiToggle");

const uploadArea =
    document.getElementById("uploadArea");

const progressSection =
    document.getElementById("progressSection");

const progressFile =
    document.getElementById("progressFile");

const progressPercent =
    document.getElementById("progressPercent");

const progressBar =
    document.getElementById("progressBar");

const resultSection =
    document.getElementById("resultSection");

const resultList =
    document.getElementById("resultList");

let selectedFiles = [];

let multiUpload = false;

let tokenVisible = false;

let tokenTimer;

let tokenValid = false;

let tokenRequestId = 0;

let uploading = false;

disableUpload();

attachBtn.addEventListener(
"click",
() => {

    if(uploading){

        return;

    }

    fileInput.click();

});

fileInput.addEventListener(
"change",
(event) => {

    handleFiles(
        event.target.files
    );

});

dropZone.addEventListener(
"dragover",
(event) => {

    event.preventDefault();

    if(!uploading){

        dropZone.classList.add(
            "dragging"
        );

    }

});

dropZone.addEventListener(
"dragleave",
() => {

    dropZone.classList.remove(
        "dragging"
    );

});

dropZone.addEventListener(
"drop",
(event) => {

    event.preventDefault();

    dropZone.classList.remove(
        "dragging"
    );

    if(uploading){

        return;

    }

    handleFiles(
        event.dataTransfer.files
    );

});

multiToggle.addEventListener(
"click",
() => {

    if(uploading){

        return;

    }

    multiUpload =
        !multiUpload;

    multiToggle.classList.toggle(
        "active",
        multiUpload
    );

    fileInput.multiple =
        multiUpload;

    if(
        !multiUpload &&
        selectedFiles.length > 1
    ){

        selectedFiles = [
            selectedFiles[0]
        ];

        updateFileText();

    }

});

function handleFiles(files){

    const incoming =
        Array.from(files);

    if(incoming.length === 0){

        return;

    }

    const oversizedFile =
        incoming.find(
            file =>
                file.size > MAX_FILE_SIZE
        );

    if(oversizedFile){

        showError(
            "Files over 30 MB are not supported."
        );

        return;

    }

    if(multiUpload){

        selectedFiles.push(
            ...incoming
        );

    }

    else {

        selectedFiles = [
            incoming[0]
        ];

    }

    updateFileText();

    hideError();

}

function updateFileText(){

    if(selectedFiles.length === 0){

        fileInfo.textContent =
            "No files selected";

        return;

    }

    if(selectedFiles.length === 1){

        fileInfo.textContent =
            selectedFiles[0].name;

    }

    else {

        fileInfo.textContent =
            `${selectedFiles.length} files selected`;

    }

}

tokenInput.addEventListener(
"input",
() => {

    let value =
        tokenInput.value;

    value = value
        .replaceAll(
            "github_pat_",
            ""
        )
        .trim();

    tokenInput.value =
        value;

    tokenValid = false;

    disableUpload();

    hideKeyStatus();

    clearTimeout(
        tokenTimer
    );

    tokenRequestId++;

    if(value.length < 18){

        return;

    }

    const requestId =
        tokenRequestId;

    tokenTimer =
        setTimeout(
        async () => {

            const fullToken =
                "github_pat_" +
                value;

            const result =
                await checkToken(
                    fullToken
                );

            if(
                requestId !==
                tokenRequestId
            ){

                return;

            }

            if(!result.valid){

                tokenValid = false;

                showKeyStatus(
                    "Invalid key!",
                    false
                );

                disableUpload();

                return;

            }

            const storage =
                await checkStorageAccess(
                    fullToken
                );

            if(
                requestId !==
                tokenRequestId
            ){

                return;

            }

            tokenValid =
                storage.accessible &&
                storage.writable;

            if(tokenValid){

                showKeyStatus(
                    "Valid key!",
                    true
                );

                enableUpload();

            }

            else {

                showKeyStatus(
                    "Invalid key!",
                    false
                );

                disableUpload();

            }

        },
        700
    );

});

function enableUpload(){

    if(uploading){

        return;

    }

    uploadBtn.disabled =
        false;

    uploadBtn.classList.add(
        "active"
    );

}

function disableUpload(){

    uploadBtn.disabled =
        true;

    uploadBtn.classList.remove(
        "active"
    );

}

function showKeyStatus(
    text,
    valid
){

    keyStatus.textContent =
        text;

    keyStatus.className =
        "key-status show " +
        (
            valid
                ? "valid"
                : "invalid"
        );

}

function hideKeyStatus(){

    keyStatus.className =
        "key-status";

}

showToken.addEventListener(
"click",
() => {

    tokenVisible =
        !tokenVisible;

    if(tokenVisible){

        tokenInput.type =
            "text";

        showToken.innerHTML = `

            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
            >

                <path
                    d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.8 21.8 0 0 1 5.06-5.94"
                />

                <path
                    d="M1 1l22 22"
                />

                <circle
                    cx="12"
                    cy="12"
                    r="3"
                />

            </svg>

        `;

    }

    else {

        tokenInput.type =
            "password";

        showToken.innerHTML = `

            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
            >

                <path
                    d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
                />

                <circle
                    cx="12"
                    cy="12"
                    r="3"
                />

            </svg>

        `;

    }

});

uploadBtn.addEventListener(
"click",
async () => {

    

    if(!selectedFiles.length){

        showError(
            "Select file first!"
        );

        return;

    }

    const oversizedFile =
        selectedFiles.find(
            file =>
                file.size > MAX_FILE_SIZE
        );

    if(oversizedFile){

        showError(
            "Files over 30 MB are not supported."
        );

        return;

    }

    if(!tokenValid){

        showKeyStatus(
            "Invalid key!",
            false
        );

        return;

    }

    hideError();

    const token =
        "github_pat_" +
        tokenInput.value.trim();

    uploading = true;

    disableUpload();

    uploadBtn.textContent =
        "Uploading...";

    uploadBtn.classList.add(
        "uploading"
    );

    progressSection.classList.add(
        "show"
    );

    resultList.innerHTML =
        "";

    resultSection.classList.remove(
        "show"
    );

    const uploadedFiles =
        [];

    for(
        let index = 0;
        index < selectedFiles.length;
        index++
    ){

        const file =
            selectedFiles[index];

        try {

            setProgress(
                file.name,
                5
            );

            const prepared =
                await prepareFile(
                    file
                );

            const progressAnimation =
    animateProgressTo99(
        file.name,
        file.size
    );

const result =
    await uploadFile(

        token,

        prepared.path,

        prepared.content

    );

await progressAnimation;

            if(!result.success){

                throw new Error(
                    `Upload failed: ${file.name}`
                );

            }

            setProgress(
                file.name,
                100
            );

            uploadedFiles.push({

                name:
                    file.name,

                url:
                    result.downloadUrl

            });

            await wait(300);

        }

        catch(error){

            console.error(
                "[FireDrop] Upload failed:",
                error
            );

            uploading = false;

            uploadBtn.textContent =
                "Upload";

            uploadBtn.classList.remove(
                "uploading"
            );

            progressSection.classList.remove(
                "show"
            );

            showError(
                "Upload failed. Try again."
            );

            if(tokenValid){

                enableUpload();

            }

            return;

        }

    }

   

await wait(250);

hideKeyStatus();

uploadArea.classList.add(
    "finished"
);

    await wait(300);

    showResults(
        uploadedFiles
    );

    uploading = false;

});

function setProgress(
    fileName,
    percent
){

    const safePercent =
        Math.max(
            0,
            Math.min(
                100,
                Math.round(percent)
            )
        );

    progressFile.textContent =
        fileName;

    progressPercent.textContent =
        `${safePercent}%`;

    progressBar.style.width =
        `${safePercent}%`;

}

function animateProgressTo99(
    fileName,
    fileSize
){

    return new Promise(resolve => {

        

        const sizeInMB =
            fileSize / (1024 * 1024);

        const duration =
            Math.min(
                7000,
                Math.max(
                    800,
                    700 + sizeInMB * 220
                )
            );

        const start =
            performance.now();

        const startPercent =
            5;

        function frame(now){

            const elapsed =
                now - start;

            const progress =
                Math.min(
                    elapsed / duration,
                    1
                );

            

            const eased =
                1 - Math.pow(
                    1 - progress,
                    3
                );

            const percent =
                startPercent +
                (
                    99 - startPercent
                ) * eased;

            setProgress(
                fileName,
                percent
            );

            if(progress < 1){

                requestAnimationFrame(
                    frame
                );

            }

            else {

                setProgress(
                    fileName,
                    99
                );

                resolve();

            }

        }

        requestAnimationFrame(
            frame
        );

    });

}

function wait(ms){

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );

}

function showResults(files){

    resultList.innerHTML =
        "";

    for(const file of files){

        const item =
            document.createElement(
                "div"
            );

        item.className =
            "result-item";

        const name =
            document.createElement(
                "div"
            );

        name.className =
            "result-name";

        name.textContent =
            file.name;

        const field =
            document.createElement(
                "div"
            );

        field.className =
            "result-field";

        const link =
            document.createElement(
                "div"
            );

        link.className =
            "result-link";

        link.textContent =
            file.url;

        link.title =
            file.url;

        const copyButton =
            createCopyButton(
                file.url
            );

        const shareButton =
            createShareButton(
                file.name,
                file.url
            );

        field.append(
            link,
            copyButton,
            shareButton
        );

        item.append(
            name,
            field
        );

        resultList.append(
            item
        );

    }

    resultSection.classList.add(
        "show"
    );

}

function createCopyButton(url){

    const button =
        document.createElement(
            "button"
        );

    button.type =
        "button";

    button.className =
        "result-action";

    button.title =
        "Copy link";

    button.innerHTML = `

        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
        >

            <rect
                x="9"
                y="9"
                width="11"
                height="11"
                rx="2"
            />

            <path
                d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
            />

        </svg>

    `;

    button.addEventListener(
    "click",
    async () => {

        try {

            await navigator.clipboard.writeText(
                url
            );

            button.classList.add(
                "copied"
            );

            button.title =
                "Copied";

            setTimeout(
                () => {

                    button.classList.remove(
                        "copied"
                    );

                    button.title =
                        "Copy link";

                },
                1200
            );

        }

        catch(error){

            

            const textarea =
                document.createElement(
                    "textarea"
                );

            textarea.value =
                url;

            document.body.appendChild(
                textarea
            );

            textarea.select();

            document.execCommand(
                "copy"
            );

            textarea.remove();

            button.classList.add(
                "copied"
            );

        }

    });

    return button;

}

function createShareButton(
    fileName,
    url
){

    const button =
        document.createElement(
            "button"
        );

    button.type =
        "button";

    button.className =
        "result-action";

    button.title =
        "Share";

    button.innerHTML = `

        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
        >

            <circle
                cx="18"
                cy="5"
                r="3"
            />

            <circle
                cx="6"
                cy="12"
                r="3"
            />

            <circle
                cx="18"
                cy="19"
                r="3"
            />

            <path
                d="M8.59 10.51l6.83-3.98"
            />

            <path
                d="M8.59 13.49l6.83 3.98"
            />

        </svg>

    `;

    button.addEventListener(
    "click",
    async () => {

        if(navigator.share){

            try {

                await navigator.share({

                    title:
                        fileName,

                    url:
                        url

                });

            }

            catch(error){

                if(
                    error.name !==
                    "AbortError"
                ){

                    console.error(
                        error
                    );

                }

            }

        }

        else {

            await copyText(
                url
            );

            button.classList.add(
                "copied"
            );

            setTimeout(
                () =>
                    button.classList.remove(
                        "copied"
                    ),
                1200
            );

        }

    });

    return button;

}

async function copyText(text){

    if(
        navigator.clipboard &&
        window.isSecureContext
    ){

        await navigator.clipboard.writeText(
            text
        );

        return;

    }

    const textarea =
        document.createElement(
            "textarea"
        );

    textarea.value =
        text;

    document.body.appendChild(
        textarea
    );

    textarea.select();

    document.execCommand(
        "copy"
    );

    textarea.remove();

}

function showError(text){

    errorBox.textContent =
        text;

    errorBox.classList.add(
        "show"
    );

}

function hideError(){

    errorBox.classList.remove(
        "show"
    );

}