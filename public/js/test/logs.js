$().ready(function () {
    var data = { logs: JSON.stringify([{ "productId": 1234, "status": 2, "date": "" }, { "productId": 1234, "status": 2, "date": "" }, { "productId": 1234, "status": 2, "date": "" }]) }
    request('POST', 'products/update/logs', {
        success: function (data) {
            log(data)
        },
        error: function (err) {
            log(err)
        }
    }, data)
    $.ajax({
        url: '/products/update/logs/',
        type: 'POST',
        data: data,
        success: function (data) {
            log(data)
        },
        timeout: 150000,
        error: function (error) {
            log(error)
        }
    })
})