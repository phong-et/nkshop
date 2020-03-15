let STOP = false, updatedSpiner, logs = []
$().ready(function () {
    updatedSpiner = $('#btnUpdateReviewsAllProducts').children().eq(0)
    $('#btnUpdateReviewsAllProducts').click(function () {
        if (globalProducts.length > 0) {
            updatedSpiner.prop('class', 'fas fa-sync fa-spin')
            updateReiewsProducts($('#txtStartIndexUpdateReviews').val() || 0, globalProducts.length)
        }
    })
})
var START = true;
function stopSyncReview() {
    if (START) {
        STOP = true
        $('#btnStopSync').html('<i class="fa fa-play"></i> Start Sync')
        START = false
    }
    else {
        STOP = false
        $('#btnStopSync').html('<i class="fa fa-stop"></i> Stop Sync')
        $('#btnUpdateReviewsAllProducts').trigger('click')
        START = true
    }
}
function updateCover(productId) {
    $.ajax({
        url: '/products/update/cover/' + productId,
        type: 'GET',
        success: function (data) {
            setTimeout(() => {
                $('#cover-product-' + productId).prop('src', data.coverName)
            }, 3000)
        },
        timeout: 150000,
        error: function (error) {
            log(error)
        }
    })
}
function updateReviews(productId, btn, index, callback) {
    let spiner = $(btn).parent().prev()
    $(btn).parent().parent().parent().addClass('active')
    spiner.prop('class', 'fas fa-sync fa-spin')
    $.ajax({
        url: '/products/review/update/' + productId,
        type: 'GET',
        data: {
            isFetchImageProduct: $('#cbIsFetchImageProduct').is(':checked'),
            isFetchImageReview: $('#cbIsFetchImageReview').is(':checked')
        },
        success: function (data) {
            try {
                // stop icon spin and blinking
                spiner.prop('class', 'fa fa-refresh')
                $(btn).parent().parent().parent().removeClass('active')

                // update number review
                var productItem = $(btn).parent().parent().parent()
                if (data.newReviewIds.length > 0) {
                    productItem.addClass('reviewUpdated')
                    $(btn).html(`Updated<span class="newReview">(${data.newReviewIds.length})</span>`)
                    if (index)
                        globalReviewedProduct.push(globalProducts[index])
                } else
                    $(btn).html(`Updated<span>(0)</span>`)
                
                // set status background item
                var statuser = spiner.parent().parent().children().next().next().next().children().next().next().next()
                var statusId = data.status
                statuser.eq(0).text(globalConfiguration.statuses[statusId])
                setProductItemStatus(productItem, statusId, index)

                // update cover 
                setTimeout(() => {
                    $('#cover-product-' + productId).prop('src', data.coverName)
                }, 2000)

                // set log product
                if (statusId !== 1) logs.push({ productId: productId, status: statusId, date: new Date().toJSON() })
                if (callback) callback(true)
            } catch (error) {
                log(error)
                setProductItemStatus(productItem, statusId, index, error)
                if (callback) callback(false, { position: 'error at success try catch', error: error })
            }
        },
        timeout: 150000,
        error: function (error) {
            log(error)
            if (index) globalErrorProducts.push(globalProducts[index])
            //setProductItemStatus(productItem, statusId, index, error)
            if (callback) callback(false, { position: 'error at updateReviews ajax ', error: error })
        }
    })
}

function updateReiewsProducts(index, limitIndex) {
    let productId = globalProducts[index].id
    let btnUpdateReview = document.getElementsByClassName('btnUpdateReviews')[index];
    if ($('#cbFocusProductItem').is(':checked'))
        $(btnUpdateReview).focus()
    updateReviews(productId, btnUpdateReview, index, function (done, error) {
        if (done === true)
            log(done)
        else
            log(JSON.stringify(error))

        index++
        if (index < limitIndex && !STOP)
            updateReiewsProducts(index, limitIndex)
        else {
            if (STOP) {
                $('#txtStartIndexUpdateReviews').val(index);
                //alert('Stopped Sync')
            }
            else {
                alert('Done Update Reviews All Product')
                log('Done Update Reviews All Product')

            }
            if (logs.length > 0)
                request('POST', 'products/update/logs', {
                    success: function (data) {
                        log(JSON.stringify(data))
                        logs = []
                    },
                    error: function (err) {
                        log(err)
                    }
                }, { logs: JSON.stringify(logs) })

            updatedSpiner.prop('class', 'fa fa-refresh')
        }
    })
}
function fetchAllImagesReviews(productId, e) {
    let spiner = $(e).parent().prev()
    spiner.prop('class', 'fas fa-sync fa-spin')
    $.ajax({
        url: '/products/currentreviews/' + productId,
        type: 'GET',
        success: function (data) {
            try {
                spiner.prop('class', 'fa fa-refresh')
                if (data.currentReviewIds.length > 0) {
                    $(e).html(`Updated<span class="newReview">(${data.currentReviewIds.length})</span>`)
                } else {
                    $(e).html(`Updated<span>(${data.currentReviewIds.length})</span>`)
                }
                console.log(data)
            } catch (e) {
                console.log(e)
            }
        },
        error: function (err) {
            console.log(err)
        }
    });
}
function setProductItemStatus(productItem, statusId, index, error) {
    switch (statusId) {
        case 2:
            productItem.addClass('productOff')
            if (index) globalOffProducts.push(globalProducts[index])
            break
        case 3:
            productItem.addClass('productOnLeave')
            if (index) globalOnLeaveProducts.push(globalProducts[index])
            break
    }
    if (error) {
        productItem.addClass('productError')
        if (index) globalErrorProducts.push(globalProducts[index])
    }

}