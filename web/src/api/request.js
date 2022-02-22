import axios from 'axios'
// import { Modal } from 'antd'
import {
    trimFieldValues,
} from '@/utils'
import { apis, getBaseURL } from './config'
import qs from 'qs'

const defaultErrorMessage = '网络开小差，请稍候重试'
const curEnv = localStorage.getItem('env')
const CancelToken = axios.CancelToken;

const service = (function serviceFun(env) {
    return axios.create({
        baseURL: getBaseURL(env),
        method: 'POST',
        timeout: 15000
    })
})(curEnv)

service.interceptors.request.use(
    options => {
        // console.log('request: ', options.url, options)
        const config = options
        const method = options.method.toUpperCase()

        // 设置field为参数主体
        const field = method === 'GET' ? 'params' : 'data'
        // const token = appStore.token
        // config.headers['X-ORIGIN'] = '224c823cc700f016521b21386929779d'
        config.headers['Content-Type'] = 'application/json'
        // 添加token到查询参数中
        // if (token) {
        //     config['params'] = {
        //         ...options['params'],
        //         // token,
        //     }
        //     config.headers['token'] = token
        // }

        if(options.data instanceof FormData) { // 上传接口需要改变Content-type
            config.headers['Content-Type'] = 'multipart/form-data'
            config[field] = options[field]
        } else {
            config[field] = {
                ...options[field]
            }
            // post请求时，并且参数为普通对象的话，过滤参数的空格
            if (method === 'POST') {
                config.data = trimFieldValues(config.data)
            }
        }

 
        
        console.info(config.data, 'config.data')
        // 由于IE9只支持XDomainRequest方式跨域，且它有许多的限制，如：不能加入自定义header，只支持text/plain格式报文等
        // 所以这里通过代理的方式处理跨域请求
        // const ie = getIEVersion()
        // if (ie > 0 && ie < 10) {
        //     config.baseURL = '/api'
        // }

        return config
    },
    error => Promise.reject(error)
)

service.interceptors.response.use(
    response => {
        // console.log('response: ', response.data)
        const {
            data
        } = response
        
        const code = +data.code
        const finnalData = data.data || {}
        // Do something
        if (code === 0 || data.msg === 'success') {
            if(data.sdp) {
                finnalData.sdp = data.sdp
                finnalData.server = data.server
                finnalData.sessionid = data.sessionid
            }
            return finnalData
        }
        return Promise.reject(response)
    },
    error => {
        if (error.__CANCEL__) { // 手动block掉的请求直接返回reject
            return Promise.reject(error)
        } else {
            // const modal = Modal.error({
            //     width: 500,
            //     content: error.message,
            //     maskClosable: false,
            //     okText: '知道了',
            //     onOk: () => {
            //         modal.destroy()
            //     }
            // })
            Promise.reject(error)
        }
    }
)

function wrap(errorMessage) {
    return {
        message: errorMessage
    }
}

/**
 * 请求未发出，如：
 * 1. interceptors.request拦截器reject的错误
 * 2. 跨域请求，在OPTIONS请求出错后，真实的请求将不会发送，会直接报错
 * 3. 请求地址错误
 * 4. 其它未知情况
 *
 * @param  {Object} error 错误对象
 * @return {Object}       返回包装后的错识信息对象，如 { message: '' }
 */
function handleRequestError(error) {
    console.error('handleRequestError', error)
    let reason
    const errorMessage = error.message

    if (errorMessage === 'Network Error') { // Axios.onerror 拦截后，统一返回 Network Error
        reason = wrap(defaultErrorMessage)
    } else if (errorMessage && errorMessage.indexOf('timeout of') !== -1) { // 请求超时
        reason = wrap('系统繁忙，请稍候重试')
    } else {
        reason = error
    }

    return reason
}

/**
 * 请求已发出，但http状态码不为2xx的错误
 *
 * @param  {Object} error 错误对象
 * @return {Object}       返回包装后的错识信息对象，如 { message: '' }
 */
function handleResponseError(error) {
    console.error('handleResponseError', error)
    let reason
    const status = error.response.status

    if (status === 404) {
        reason = wrap('接口不存在')
    } else {
        reason = wrap(defaultErrorMessage)
    }
    return reason
}

/**
 * 业务异常，由interceptors.response拦截器reject的错误
 *
 * @param  {Object} error 错误对象
 * @return {Object}       返回包装后的错识信息对象，如 { message: '' }
 */
function handleServiceError(error) {
    console.error('handleServiceError', error)
    // data 为服务器端返回的报文
    const data = error.data || {}
    const code = +data.code
    // 401 token失效
    if (code === 401) {
        // 当前系统使用的是 HashRouter，所以这里取hash部分
        console.log(window.location.search)

        const { source = '', fuid = '', phone = '', channel } = qs.parse(window.location.search, { ignoreQueryPrefix: true })
        // const fromURI = window.location.href
        // appStore.updateTargetPath(fromURI)
        // const href = window.location.hash
        // const loginPath = fuid ? `/login?fuid=${fuid}&phone=${phone}&source=${source}&channel=${channel}` : '/login'

        // // 清空token
        // appStore.setToken(null)
        // 如果当前不是在登录页，即跳转到登录
        // if (href.indexOf(loginPath.substring(1)) === -1) {
        //     window.location.href = loginPath
        // }
        // 这里返回值会被外层捕获，并且设值为appStore.error
        // 为避免在跳转页面后，弹出错误提示，这里需要返回null
        return null
    }

    // 其它业务异常，由外边处理
    return data
}

/**
 * 异常处理
 * @param  {Object} error        错误对象
 * @param  {Boolean} showError   是否显示错误
 * @return {Promise}             返回一个异常处理的promise对象
 */
function handleError(error, requestOptions) {
    appStore.setLoading(false)
    let reason
    if (error.response) {
        reason = handleResponseError(error)
    } else if (error.status >= 200 && error.status < 300) {
        reason = handleServiceError(error)
    } else {
        reason = handleRequestError(error)
    }

    // requestOptions.showError && appStore.setError(reason)

    if (requestOptions.showError) {
        if (reason.msg) {
            let suffix = /(\[error)(.*)\]$/.test(reason.msg)
            if (suffix) {
                reason.msg = RegExp.$2
            }
        }
        // const modal = Modal.error({
        //     width: 500,
        //     title: (error && error.response && error.response.status) || '提示',
        //     content: reason.message || reason.msg || '响应超时！',
        //     maskClosable: false,
        //     okText: '知道了',
        //     onOk: () => {
        //         modal.destroy()
        //     }
        // })
    }
    return Promise.reject(reason)
}

/**
 * 成功处理
 * @param  {Object} res response对象
 * @param  {Boolean} noLoading 不控制loading
 * @return {Object}     返回一个response对象，以便在外层捕获
 */
function handleSuccess(res, noLoading = false) {
    // if (!noLoading) appStore.updateTokenExpires().setLoading(false)
    return res
}

/**
 * 发送请求前的处理
 * 不直接在 axios.request 拦截器中处理，以便可以在外边重置
 */
function handleBeforeSend() {
    // appStore.setLoading(true)
}

const defaultOptions = {
    showError: true, // 是否弹窗显示错误
    beforeSend: handleBeforeSend, // request 前执行的操作
}

/**
 * axios封装
 * @param  {Object} options      axios 的请求参数
 * @param  {String} method       axios 的请求方式，默认为 post，可在 options 中设置
 * @return {Promise}             返回一个Promise对象
 */
function request(options = {}, method = 'POST') {
    const requestOptions = Object.assign({}, defaultOptions, {
        method
    }, options)
    // beforeSend
    requestOptions.url = apis[requestOptions.url] || requestOptions.url
    requestOptions.beforeSend()
    return service(requestOptions).then(res => handleSuccess(res, options.noLoading || false)).catch(error => handleError(error, requestOptions))
}

request.get = options => request(options, 'GET')

request.post = options => request(options, 'POST')

export default request
export { apis, CancelToken }
