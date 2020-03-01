$().ready(function () {
    $('body').dblclick(function () {
        $('#cbPrivateMode').prop('checked', true)
        $('#cbPrivateMode').trigger('change')
    })

    $('#cbHideProductCover').change(function () {
        if ($(this).is(':checked')) {
            $('.productCover').css('display', 'none')
            $('.productItem').css('width', '300px')
        }
        else {
            $('.productItem').css('width', '500px')
            $('.productCover').css('display', '')
        }
    })

    $('#ddlSorting').change(function () {
        var typeSorting = $('#ddlSorting option:selected').val()
        var filteredStatus = $('#ddlProductStatus option:selected').val()
        var products = filterProductByStatus(filteredStatus)
        drawProduct(sort(typeSorting, products))
    })

    $('#cbPrivateMode').change(function () {
        if (this.checked) {
            $('#cbHideProductCover').prop('checked', true)
            $('#cbHideProductCover').trigger('change')
            $('.productRegion').hide()
            $('.productRegion').prev().hide()
            $('.productPlace').hide()
            $('.productPlace').prev().hide()
            $('.productAuthor').hide()
            $('.productAuthor').prev().hide()
            $('.productName').hide()
            $('.productPhone').hide()
            $('.productPhone').prev().hide()
        }
        else {
            $('#cbHideProductCover').prop('checked', false)
            $('#cbHideProductCover').trigger('change')
            $('.productRegion').show()
            $('.productRegion').prev().show()
            $('.productPlace').show()
            $('.productPlace').prev().show()
            $('.productAuthor').show()
            $('.productAuthor').prev().show()
            $('.productName').show()
            $('.productPhone').show()
            $('.productPhone').prev().show()
        }
    })

    $('#btnRefresh').click(function () {
        $('#ddlSorting').trigger('change')
    })

    // show hide left quick-controller
    $('.slider-arrow').on('click mouseover', function () {
        if ($(this).hasClass('show')) {
            $(".slider-arrow, .quick-controller").animate({
                left: "+=222"
            }, 200, function () {
            })
            $(this).html('&laquo;').removeClass('show').addClass('hide');
        }
        else {
            $(".slider-arrow, .quick-controller").animate({
                left: "-=222"
            }, 200, function () {
            })
            $(this).html('&raquo;').removeClass('hide').addClass('show');
        }
    })
})
function filterProductByStatus(status) {
    var products = []
    switch (status) {
        case 'off':
            products = globalOffProducts
            break
        case 'onleave':
            products = globalOnLeaveProducts
            break
        case 'reviewed':
            products = globalReviewedProduct
            break
        default: products = globalProducts
            break
    }
    return products
}