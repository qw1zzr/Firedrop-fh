console.log("[FireDrop] uploader.js loaded");
/*
    FIREDROP — FILE UPLOADER

    Отвечает за:
    - преобразование File в Base64
    - генерацию ID
    - создание безопасного пути
*/


/*
    FILE → BASE64
*/


function fileToBase64(file){


    return new Promise((resolve, reject) => {


        const reader =
            new FileReader();



        reader.onload = () => {


            /*
                FileReader возвращает:

                data:text/plain;base64,SGVsbG8...

                GitHub API нужен только:

                SGVsbG8...
            */


            const result =
                reader.result;


            const base64 =
                result.split(",")[1];


            resolve(base64);


        };



        reader.onerror = () => {


            reject(
                new Error(
                    `Failed to read file: ${file.name}`
                )
            );


        };



        reader.readAsDataURL(file);


    });


}





/*
    GENERATE RANDOM ID

    Например:
    a8f31c92
*/


function generateFileId(){


    const bytes =
        new Uint8Array(4);


    crypto.getRandomValues(bytes);



    return Array
        .from(bytes)
        .map(byte =>
            byte
                .toString(16)
                .padStart(2, "0")
        )
        .join("");


}





/*
    SAFE FILE NAME

    Убираем символы, которые могут
    сломать URL или путь GitHub.
*/


function sanitizeFileName(fileName){


    return fileName

        .replace(/[\/\\]/g, "_")

        .replace(/\s+/g, "_")

        .replace(
            /[^a-zA-Z0-9._\-]/g,
            "_"
        );


}





/*
    PREPARE FILE

    File
      ↓
    Base64
      ↓
    random ID
      ↓
    storage path
*/


async function prepareFile(file){


    const id =
        generateFileId();


    const safeName =
        sanitizeFileName(file.name);


    const path =
        `files/${id}/${safeName}`;


    const content =
        await fileToBase64(file);



    return {

        id:
            id,

        originalName:
            file.name,

        fileName:
            safeName,

        path:
            path,

        content:
            content,

        size:
            file.size,

        type:
            file.type

    };


}