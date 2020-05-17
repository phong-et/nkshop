$().ready(function () {
    $('#btnDeleteAllProducts').click(function () {
        var isDeleted = confirm('Are you sure delete all product ?')
        if (isDeleted) deleteProducts($('#txtStartIndexUpdateReviews').val(), globalProducts.length)
    })

})
function deleteProduct(productId, btnDelete) {
    var isAccepted = confirm('Are you sure delete product has id=' + productId)
    if (isAccepted) {
        $.ajax({
            url: '/products/delete/' + productId,
            type: 'GET',
            data: {
                isDeleteAtDatabase: $('#cbDeleteProductAtDatabase').is(':checked')
            },
            success: function (res) {
                try {
                    if (res.success) {
                        alert('deleted')
                        $(btnDelete).parent().parent().detach()
                    }
                    else
                        log(res.responseText.msg)
                } catch (e) {
                    log(e)
                }
            },
            error: function (err) {
                log(err)
            }
        });
    }
}
// function deleteProducts(index, limitIndex) {
//     // use recursive native
//     let productId = globalProducts[index].id
//     let btnDelete = document.getElementsByClassName('btnDelete')[index];
//     $(btnDelete).parent().parent().parent().addClass('active')
//     if ($('#cbFocusProductItem').is(':checked')) $(btnDelete).focus()
//     let spiner = $(btnDelete).parent().prev()
//     spiner.prop('class', 'fas fa-sync fa-spin')
//     $.ajax({
//         url: '/products/delete/' + productId,
//         type: 'GET',
//         data: {
//             isDeleteAtDatabase: $('#cbDeleteProductAtDatabase').is(':checked')
//         },
//         success: function (res) {
//             try {
//                 if (res.success) {
//                     $(btnDelete).parent().parent().parent().detach()
//                 }
//                 console.log(res)
//                 index++
//                 if (index < limitIndex)
//                     deleteProducts(index, limitIndex)
//                 else {
//                     log('Done Delete All Products')
//                     drawProduct(globalReviewedProduct)
//                 }
//             } catch (error) {
//                 log(error)
//             }
//         },
//         error: function (err) {
//             log(err)
//         }
//     });
// }