
export function getUserMedia() {
    //兼容浏览器的getUserMedia写法
    navigator.getUserMedia = navigator.getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia;
    const op = {
        video: {
            width: { min: 160, ideal: 160, max: 160 },
            height: { min: 120, ideal: 120, max: 120 }
        },
        audio: {
            noiseSuppression: true, //降噪
            echoCancellation: true   // 回音消除
        }
    };
    //获取本地的媒体流，并绑定到一个video标签上输出，并且发送这个媒体流给其他客户端
    return new Promise((resolve, reject) => {
        navigator.getUserMedia(
            op,
            stream => {
                resolve(stream);
            }, function(error){
                reject(error);
                // console.log(error);
                //处理媒体流创建失败错误
            }
        );
    })
}

export const once = fn => {
    let called = false;
    return function(...args) {
        if (called) return;
        called = true;
        return fn.apply(this, args);
    };
};


export function trim(str) {
    return typeof str === 'string' ? str.replace(/(^\s*)|(\s*$)/g, "") : str
}

/**
 * @param {any} obj The object to inspect.
 * @returns {boolean} True if the argument appears to be a plain object.
 */
 export function isPlainObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return false
    }

    // 普通的对象while循环结束后proto的值是：Object.prototype，
    // 通过Object.create(null)生成的对象proto的值是：null
    // 不直接使用 Object.getPrototypeOf(obj) === Object.prototype || Object.getPrototypeOf(obj) === null 判断
    // 是为了防止一些边界情况的出现，如frame访问变量时
    let proto = obj
    while (Object.getPrototypeOf(proto) !== null) {
        proto = Object.getPrototypeOf(proto)
    }

    return Object.getPrototypeOf(obj) === proto
}

/**
 * 去除 data 所有的属性值的空格，不考虑深层次属性，主要用于表单提交
 */
 export function trimFieldValues(data) {
    if (data && isPlainObject(data)) {
        const newData = {}
        for (let key in data) {
            newData[key] = trim(data[key])
        }
        return newData
    }
    return data
}



//兼容浏览器的PeerConnection写法
export const PeerConnection = (window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection) 