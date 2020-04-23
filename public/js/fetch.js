$().ready(function(){
    $('#btnFetchLastId').click(function () {
        fetchLastProductId()
    })
    // disable because of stopping service by cloudfire
    // $('#btnFetchListId').click(function () {
    //     let btnFetchListId = $(this),
    //         spiner = btnFetchListId.children(),
    //         txtListId = $('#txtListId')
    //     spiner.prop('class', 'fas fa-sync fa-spin')
    //     var pageRange = txtListId.val()
    //     $.ajax({
    //         url: '/products/new/listid/' + pageRange,
    //         type: 'GET',
    //         success: function (data) {
    //             if (data === 503) alert(globalConfiguration.errors["503"])
    //             else {
    //                 btnFetchListId.html(`<i class="fa fa-cloud-download-alt"></i> Fetch New Products (${data.length})`)
    //                 txtListId.val(data)
    //             }
    //         },
    //         error: function (err) {
    //             spiner.prop('class', 'fa fa-cloud-download-alt')
    //             log(err)
    //         }
    //     })
    // })
    
    $('#btnFetchNewProducts').click(function () {
        let btnFetchNewProduct = $(this),
            spiner = btnFetchNewProduct.children(),
            txtListId = $('#txtListId'),
            pageRange = txtListId.val().split(','),
            listId = genListId(parseInt(pageRange[0]), parseInt(pageRange[1])),
            data = { listId: JSON.stringify(listId), acceptedMinPrice: $('#txtAcceptedMinPrice').val() }
    
        spiner.prop('class', 'fas fa-sync fa-spin')
        $.ajax({
            url: '/products/add/',
            type: 'GET',
            data: data,
            success: function (data) {
                spiner.prop('class', 'fa fa-cloud-download-alt')
                try {
                    log(data)
                } catch (e) {
                    log(e)
                }
            },
            error: function (err) {
                spiner.prop('class', 'fa fa-cloud-download-alt')
                log(err)
            }
        })
    })
})
///////////////////////////////////// FETCH NEW PRODUCT /////////////////////////////////////
function fetchLastProductId() {
    $.ajax({
        url: '/products/latest/',
        type: 'GET',
        success: function (productId) {
            try {
                $('#txtListId').val(productId)
            } catch (e) {
                log(e)
            }
        },
        error: function (err) {
            log(err)
        }
    });
}
function genListId(startId, endId) {
    var listId = [];
    for (i = startId + 1; i <= endId; i++)
        listId.push(i)
    return listId
}
///////////////////////////////////// FETCH REVIEW /////////////////////////////////////
