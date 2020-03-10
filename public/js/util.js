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

function request(type, url, calbackObject, requestPayload) {
    var ajaxOptions = {
        url: url,
        type: type,
        timeout: requestConfig.TIMEOUT
    }
    if (requestPayload)
        ajaxOptions['data'] = requestPayload
    if (calbackObject && calbackObject.success)
        ajaxOptions['success'] = calbackObject.success
    if (calbackObject && calbackObject.error)
        ajaxOptions['error'] = calbackObject.error
    $.ajax(ajaxOptions)
}