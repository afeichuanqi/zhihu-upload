const express = require("express");
const {
    get_temp_id
} = require('./getTempId');
const fs = require("fs");
const OSS = require('ali-oss');
const path = require('path');

const {
    getHash,
    getCS
} = require('./filehash');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const multipart = require('connect-multiparty');
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(multipart());
const transCookies = (cookie) => {
    let cookiesText = '';
    Object.keys(cookie).map(key => {
        cookiesText = `${cookiesText}${key}=${cookie[key]}; `
    })
    return cookiesText;
}
app.post("/upload-video", async function (request, response) {
    const body = request.body;
    let cookies = request.cookies;
    cookies = transCookies(cookies);
    const {
        filePath: localFilePath,
        title,
        description,
        image_url,
    } = body;
    if (!localFilePath || !title || !description || !image_url) {
        response.setHeader("Content-Type", "text/plain; charset=utf-8");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "*");
        response.send("参数请输入完整");
        response.end();
        return;
    }
    const filePath = localFilePath;
    console.log(filePath)
    let data = null;
    try {
        data = fs.readFileSync(filePath);
    } catch (error) {
        response.setHeader("Content-Type", "text/plain; charset=utf-8");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "*");
        response.send(error.toString());
        response.end();
        return;
    }
    const fileBase64 = Buffer.from(data).toString('base64')
    const fileHash = getHash(fileBase64);
    // const fileXsrftoken = getCS(fileBase64);
    let config = await getOSSConfig(fileHash, cookies);
    config = JSON.parse(config);
    const {
        upload_file,
        upload_vendor
    } = config;
    if (upload_vendor) {
        const {
            object_key,
            state,
            video_id
        } = upload_file;
        const {
            endpoint,
            upload_token
        } = upload_vendor;
        const {
            access_id,
            access_key,
            access_timestamp,
            access_token
        } = upload_token;
        const client = new OSS({
            "endpoint": endpoint,
            "bucket": "zhihu-video-input",
            "cname": true,
            "timeout": 90000,
            "secure": true,
            "accessKeyId": access_id,
            "accessKeySecret": access_key,
            "stsToken": access_token
        });
        let result = await client.multipartUpload(object_key, path.normalize(filePath), {});
        const temp_id = get_temp_id();
        const videoInfo = await getVideoInfo(video_id, temp_id, cookies);
        const videoInfoId = JSON.parse(videoInfo).id;
        result = await saveVideoInfo(videoInfoId, title, description,
            image_url, cookies)
        result = await publish(videoInfoId, cookies)
        response.setHeader("Content-Type", "text/plain; charset=utf-8");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "*");
        response.send(result);
        response.end();
    } else {
        if (!upload_file.video_id) {
            response.setHeader("Content-Type", "text/plain; charset=utf-8");
            response.setHeader("Access-Control-Allow-Origin", "*");
            response.setHeader("Access-Control-Allow-Methods", "*");
            response.send(`cookie错误`);
            response.end();
            return 
        }
        const {
            video_id
        } = upload_file;
        const temp_id = get_temp_id();
        const videoInfo = await getVideoInfo(video_id, temp_id, cookies);
        const videoInfoId = JSON.parse(videoInfo).id;
        result = await saveVideoInfo(videoInfoId, title, description,
            image_url, cookies)
        result = await publish(videoInfoId, cookies)
        response.setHeader("Content-Type", "text/plain; charset=utf-8");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "*");
        response.send(result);
        response.end();
    }
})
app.post("/upload-photo", async function (request, response) {
    const body = request.body;
    let cookies = request.cookies;

    cookies = transCookies(cookies);
    const {
        filePath: localFilePath,
    } = body;
    if (!localFilePath) {
        response.setHeader("Content-Type", "text/plain; charset=utf-8");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "*");
        response.send("参数请输入完整");
        response.end();
        return;
    }
    const filePath = localFilePath;
    console.log(filePath)
    let data = null;
    try {
        data = fs.readFileSync(filePath);
    } catch (error) {
        response.setHeader("Content-Type", "text/plain; charset=utf-8");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "*");
        response.send(error.toString());
        response.end();
        return;
    }
    const fileBase64 = Buffer.from(data).toString('base64')
    let mime = filePath.split('.')[1];
    const fileHash = getHash(fileBase64);
    let config = await getImageOSSConfig(fileHash, cookies);
    config = JSON.parse(config);
    const {
        upload_file,
        upload_token
    } = config;
    if (upload_token) {
        const {
            object_key,
        } = upload_file;
        const {
            access_id,
            access_key,
            access_token
        } = upload_token;
        const client = new OSS({
            "endpoint": "https://zhihu-pics-upload.zhimg.com",
            "bucket": "zhihu-pics",
            "cname": true,
            "timeout": 90000,
            "secure": true,
            "accessKeyId": access_id,
            "accessKeySecret": access_key,
            "stsToken": access_token
        });
        let result = await client.multipartUpload(object_key, path.normalize(filePath), {});
        response.setHeader("Content-Type", "text/plain; charset=utf-8");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "*");
        response.send(`https://pica.zhimg.com/${result.name}.${mime}`);
        response.end();
    } else {
        if (!upload_file.image_id) {
            response.setHeader("Content-Type", "text/plain; charset=utf-8");
            response.setHeader("Access-Control-Allow-Origin", "*");
            response.setHeader("Access-Control-Allow-Methods", "*");
            response.send(`cookie错误`);
            response.end();
            return 
        }
        const {
            image_id,
        } = upload_file;
        let imgUrlInfo = await getImgUrl(image_id, cookies);
        const {
            original_src
        } = imgUrlInfo = JSON.parse(imgUrlInfo);
        response.setHeader("Content-Type", "text/plain; charset=utf-8");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "*");
        response.send(original_src);
        response.end();
    }

})
const getImgUrl = async (image_id, cookies) => {
    const data = await fetch("https://api.zhihu.com/images/" + image_id, {
        "headers": {
            "accept": "*/*",
            "accept-language": "zh-CN,zh;q=0.9",
            "cache-control": "no-cache",
            "content-type": "application/json",
            "pragma": "no-cache",
            "sec-ch-ua": "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "cookie": cookies,
            "Referer": "https://www.zhihu.com/zvideo/upload-video",
            "Referrer-Policy": "no-referrer-when-downgrade"
        },
        "body": null,
        "method": "GET"
    });
    const body = data.body;
    const reader = body.getReader();
    const {
        done,
        value
    } = await reader.read();
    var enc = new TextDecoder("utf-8");
    var uint8_msg = new Uint8Array(value);
    return enc.decode(uint8_msg);
}
const getOSSConfig = async (fileHash, cookies) => {
    const data = await fetch("https://lens.zhihu.com/api/v5/videos", {
        "headers": {
            "accept": "application/json",
            "accept-language": "zh-CN,zh;q=0.9",
            "cache-control": "no-cache",
            "content-type": "application/json",
            "pragma": "no-cache",
            "sec-ch-ua": "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "x-ab-param": "",
            "x-requested-with": "fetch",
            "x-upload-content-type": "video/mp4",
            "cookie": cookies,
            "Referer": "https://www.zhihu.com/zvideo/upload-video",
            "Referrer-Policy": "no-referrer-when-downgrade"
        },
        "body": "{\"file_md5\":\"" + fileHash + "\",\"source\":\"zvideo\"}",
        "method": "POST"
    });
    const body = data.body;
    const reader = body.getReader();
    const {
        done,
        value
    } = await reader.read();
    var enc = new TextDecoder("utf-8");
    var uint8_msg = new Uint8Array(value);
    return enc.decode(uint8_msg);
}

const getImageOSSConfig = async (fileHash, cookies) => {
    const data = await fetch("https://api.zhihu.com/images", {
        "headers": {
            "accept": "*/*",
            "accept-language": "zh-CN,zh;q=0.9",
            "cache-control": "no-cache",
            "content-type": "application/json",
            "pragma": "no-cache",
            "sec-ch-ua": "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "cookie": cookies,
            "Referer": "https://www.zhihu.com/zvideo/upload-video",
            "Referrer-Policy": "no-referrer-when-downgrade"
        },
        "body": "{\"image_hash\":\"" + fileHash + "\",\"source\":\"zvideo\"}",
        "method": "POST"
    });
    const body = data.body;
    const reader = body.getReader();
    const {
        done,
        value
    } = await reader.read();
    var enc = new TextDecoder("utf-8");
    var uint8_msg = new Uint8Array(value);
    return enc.decode(uint8_msg);
}
const updateUploadStatus = async (video_id, object_key, upload_id, upload_event) => {
    console.log(video_id, object_key, upload_id, upload_event)

    const data = await fetch("https://lens.zhihu.com/api/v4/videos/" + video_id + "/uploading_status", {
        "headers": {
            "accept": "application/json",
            "accept-language": "zh-CN,zh;q=0.9",
            "cache-control": "no-cache",
            "content-type": "application/json",
            "pragma": "no-cache",
            "sec-ch-ua": "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "cookie": "_zap=dd24fe72-c140-4121-8c5e-1ede142e20ad; d_c0=AKBTk2wOVBaPTmJa60FMaYx_npS9s8pYVo8=|1676378047; dream_token=YTcwYzNkODgxYjk5ZjcyNmQwMDBlZTliZGY4N2VkZmZiYjIyZWRhYjJlZmIyMWFlNmE4ODg5NzMyNTAzZWU0Yw==; _xsrf=L53VUMJXW8fiG2jF73EGoXzoxgzlzNvX; Hm_lvt_98beee57fd2ef70ccdd5ca52b9740c49=1679878384,1680064023,1680676503,1681034542; z_c0=2|1:0|10:1682001377|4:z_c0|80:MS4xb1ZKZkJnQUFBQUFtQUFBQVlBSlZUZUdiTG1WSkRLc1VpdENlam5RcXhCSFNESnlCNWI3aTJ3PT0=|7c4aa43c7ddd2ce2984d9ab5b4fc6d9cd922e45ea73a8d2ecfc49ee5be06bae3; tst=r; KLBRSID=d1f07ca9b929274b65d830a00cbd719a|1682435620|1682431195",
            "Referer": "https://www.zhihu.com/zvideo/upload-video",
            "Referrer-Policy": "no-referrer-when-downgrade"
        },
        "body": "{\"object_key\":\"" + object_key + "\",\"upload_id\":\"" + upload_id + "\",\"video_source\":\"origin\",\"upload_event\":\"" + upload_event + "\"}",
        "method": "PUT"
    });
    const body = data.body;
    const reader = body.getReader();
    const {
        done,
        value
    } = await reader.read();
    var enc = new TextDecoder("utf-8");
    var uint8_msg = new Uint8Array(value);
    return enc.decode(uint8_msg);
}

const saveVideoInfo = async (videoInfoId, title, description, image_url, cookies) => {
    const data = await fetch("https://www.zhihu.com/api/v4/zvideos/drafts/" + videoInfoId, {
        "headers": {
            "accept": "*/*",
            "accept-language": "zh-CN,zh;q=0.9",
            "cache-control": "no-cache",
            "content-type": "application/json",
            "pragma": "no-cache",
            "sec-ch-ua": "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-ab-param": "",
            "x-requested-with": "fetch",
            "cookie": cookies,
            "Referer": "https://www.zhihu.com/zvideo/upload-video",
            "Referrer-Policy": "no-referrer-when-downgrade"
        },
        "body": "{\"title\":\"" + title + "\",\"description\":\"" + description + "\",\"category\":{\"first_level\":3014000,\"second_level\":3014001},\"zvideo_type\":\"reprint\",\"topic_ids\":[\"20048508\"],\"image_url\":\"" + image_url + "\",\"image_url_from\":2,\"is_visible\":true,\"reference\":{\"reference_type\":0,\"reference_content_token\":\"0\"},\"chapters\":[]}",
        "method": "PATCH"
    });
    const body = data.body;
    const reader = body.getReader();
    const {
        done,
        value
    } = await reader.read();
    var enc = new TextDecoder("utf-8");
    var uint8_msg = new Uint8Array(value);
    return enc.decode(uint8_msg);
}

const getVideoInfo = async (video_id, temp_id, cookies) => {
    const data = await fetch("https://www.zhihu.com/api/v4/zvideos/drafts", {
        "headers": {
            "accept": "*/*",
            "accept-language": "zh-CN,zh;q=0.9",
            "cache-control": "no-cache",
            "content-type": "application/json",
            "pragma": "no-cache",
            "sec-ch-ua": "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-ab-param": "",
            "x-requested-with": "fetch",
            "cookie": cookies,
            "Referer": "https://www.zhihu.com/zvideo/upload-video",
            "Referrer-Policy": "no-referrer-when-downgrade"
        },
        "body": "{\"temp_id\":\"" + temp_id + "\",\"file\":{\"duration\":4310},\"title\":\"美女1\",\"status\":\"uploaded\",\"video_id\":\"" + video_id + "\",\"image_url\":\"https://pic2.zhimg.com/v2-feb96045745dac939aa2a900c6d6845d.jpg\",\"image_url_from\":2,\"video\":{\"id\":\"" + video_id + "\",\"duration\":4.31}}",
        "method": "POST"
    });
    const body = data.body;
    const reader = body.getReader();
    const {
        done,
        value
    } = await reader.read();
    var enc = new TextDecoder("utf-8");
    var uint8_msg = new Uint8Array(value);
    return enc.decode(uint8_msg);
}

const publish = async (videoInfoId, cookies) => {
    const data = await fetch("https://www.zhihu.com/api/v4/zvideos/" + videoInfoId + "/actions/publish", {
        "headers": {
            "accept": "*/*",
            "accept-language": "zh-CN,zh;q=0.9",
            "cache-control": "no-cache",
            "content-type": "application/json",
            "pragma": "no-cache",
            "sec-ch-ua": "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-ab-param": "",
            "x-requested-with": "fetch",
            "cookie": cookies,
            "Referer": "https://www.zhihu.com/zvideo/upload-video",
            "Referrer-Policy": "no-referrer-when-downgrade"
        },
        "body": "{}",
        "method": "POST"
    });
    const body = data.body;
    const reader = body.getReader();
    const {
        done,
        value
    } = await reader.read();
    var enc = new TextDecoder("utf-8");
    var uint8_msg = new Uint8Array(value);
    return enc.decode(uint8_msg);
}
app.listen(10099, function () {
    console.log("启动成功");
})