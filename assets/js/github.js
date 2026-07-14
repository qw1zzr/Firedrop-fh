/*
    FIREDROP — GITHUB API

    Отвечает за:
    - проверку GitHub key
    - проверку доступа к storage repository
    - загрузку файлов
*/


const GITHUB_API =
    "https://api.github.com";


const STORAGE_OWNER =
    "qw1zzr";


const STORAGE_REPO =
    "firedrop-storage";


const STORAGE_BRANCH =
    "main";





/*
    BASE REQUEST HEADERS
*/


function getGitHubHeaders(token){


    return {

        "Authorization":
            `Bearer ${token}`,

        "Accept":
            "application/vnd.github+json",

        "X-GitHub-Api-Version":
            "2022-11-28"

    };


}







/*
    CHECK TOKEN

    Проверяет, существует ли key
    и принимает ли его GitHub.
*/


async function checkToken(token){


    try {


        const response = await fetch(

            `${GITHUB_API}/user`,

            {

                method:
                    "GET",


                headers:
                    getGitHubHeaders(token)

            }

        );



        if(!response.ok){


            console.warn(

                "[FireDrop] Invalid GitHub key",

                response.status

            );


            return {

                valid: false,

                status:
                    response.status

            };


        }



        const user =
            await response.json();



        console.log(

            "[FireDrop] GitHub key valid"

        );


        console.log(

            "[FireDrop] Authenticated as:",

            user.login

        );



        return {

            valid: true,

            status:
                response.status,

            user:
                user

        };


    }


    catch(error){


        console.error(

            "[FireDrop] Token check failed:",

            error

        );


        return {

            valid: false,

            status: 0,

            error:
                error.message

        };


    }


}







/*
    CHECK STORAGE ACCESS

    Проверяет:
    - существует ли repository
    - видит ли его текущий key
    - какие permissions GitHub вернул
*/


async function checkStorageAccess(token){


    try {


        const response = await fetch(

            `${GITHUB_API}/repos/${STORAGE_OWNER}/${STORAGE_REPO}`,

            {

                method:
                    "GET",


                headers:
                    getGitHubHeaders(token)

            }

        );



        if(!response.ok){


            console.error(

                "[FireDrop] Storage access denied",

                {

                    repository:
                        `${STORAGE_OWNER}/${STORAGE_REPO}`,

                    status:
                        response.status

                }

            );



            return {

                accessible: false,

                writable: false,

                status:
                    response.status

            };


        }



        const repository =
            await response.json();



        const permissions =
            repository.permissions || {};



        /*
            Для записи нас интересует
            push permission.
        */


        const writable =
            permissions.push === true ||
            permissions.admin === true ||
            permissions.maintain === true;



        console.log(

            "[FireDrop] Storage repository accessible:",

            `${STORAGE_OWNER}/${STORAGE_REPO}`

        );


        console.log(

            "[FireDrop] Storage permissions:",

            permissions

        );



        if(writable){


            console.log(

                "[FireDrop] Storage write access: ALLOWED"

            );


        }

        else {


            console.warn(

                "[FireDrop] Storage write access: NOT CONFIRMED"

            );


        }



        return {

            accessible: true,

            writable:
                writable,

            status:
                response.status,

            repository:
                repository,

            permissions:
                permissions

        };


    }


    catch(error){


        console.error(

            "[FireDrop] Storage access check failed:",

            error

        );


        return {

            accessible: false,

            writable: false,

            status: 0,

            error:
                error.message

        };


    }


}







/*
    UPLOAD FILE

    Получает:
    - token
    - path
    - base64 content

    uploader.js позже будет
    подготавливать content.
*/


async function uploadFile(

    token,

    path,

    base64Content

){


    try {


        const response = await fetch(

            `${GITHUB_API}/repos/${STORAGE_OWNER}/${STORAGE_REPO}/contents/${path}`,

            {

                method:
                    "PUT",


                headers: {

                    ...getGitHubHeaders(token),

                    "Content-Type":
                        "application/json"

                },


                body:
                    JSON.stringify({

                        message:
                            `Upload ${path}`,

                        content:
                            base64Content,

                        branch:
                            STORAGE_BRANCH

                    })

            }

        );



        const data =
            await response.json();



        if(!response.ok){


            console.error(

                "[FireDrop] Upload failed:",

                data

            );


            return {

                success: false,

                status:
                    response.status,

                error:
                    data

            };


        }



        console.log(

            "[FireDrop] Upload successful:",

            data

        );



        return {

            success: true,

            status:
                response.status,

            data:
                data,

            downloadUrl:
                data.content?.download_url || null

        };


    }


    catch(error){


        console.error(

            "[FireDrop] Upload request failed:",

            error

        );


        return {

            success: false,

            status: 0,

            error:
                error.message

        };


    }


}