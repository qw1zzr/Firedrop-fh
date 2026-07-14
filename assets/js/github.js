

const GITHUB_API =
    "https://api.github.com";

const STORAGE_OWNER =
    "qw1zzr";

const STORAGE_REPO =
    "firedrop-storage";

const STORAGE_BRANCH =
    "main";

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

            return {

                valid: false,

                status:
                    response.status

            };

        }

        const user =
            await response.json();

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

        

        const writable =
            permissions.push === true ||
            permissions.admin === true ||
            permissions.maintain === true;

        if(writable){

            }

        else {

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