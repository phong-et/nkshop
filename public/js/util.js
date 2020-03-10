const requestType = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'DELETE',
    DELETE: 'DELETE'
}
const requestConfig = {
    TIMEOUT: 15000
}
const log = console.log

function request(type, url, callbackObject, requestPayload) {
    var ajaxOptions = {
        url: url,
        type: type,
        timeout: requestConfig.TIMEOUT
    }
    if (requestPayload)
        ajaxOptions['data'] = requestPayload
    if (callbackObject && callbackObject.success)
        ajaxOptions['success'] = callbackObject.success
    if (callbackObject && callbackObject.error)
        ajaxOptions['error'] = callbackObject.error
    $.ajax(ajaxOptions)
}