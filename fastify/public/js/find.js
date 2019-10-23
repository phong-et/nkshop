var log = console.log
var globalProducts = []
$().ready(function () {
    // gen conditions part
    configureConditionsController()
    genConditions()
    genDistrict(2)
    genPrices()
    genYears()
    genAges()
    $('#btnSearch').click(function () {
        var query = getQueryConditions()
        $.ajax({
            url: '/product/findConditions',
            type: 'GET',
            data: { query: JSON.stringify(query) },
            success: function (products) {
                try {
                    globalProducts = products
                    drawProduct(products)
                    log(`[${products.map(product => product.id).sort((a, b) => a - b).toString()}]`)
                } catch (e) {
                    log(e)
                }
            },
            error: function (err) {
                log(err)
            }
        });
    })
    $('#btnUpdateReviewsAllProducts').click(function () {
        updateReiewsProducts($('#txtStartIndexUpdateReviews').val(), globalProducts.length)
    })
})

// use for button update all product
function updateReiewsProducts(index, limitIndex) {
    // use trigger  -> don't asynchronous
    // $.when($('.btnUpdateReviews').eq(index).triggerHandler('click')).done(() => {
    //     setTimeout(() => {
    //         index++
    //         if (index < limitIndex)
    //             updateReiewsProducts(index, limitIndex)
    //         else
    //             log('Done Update Reviews All Product')
    //     }, 2000)
    // })

    // use function directly -> don't asynchronous
    // $.when(updateReviews(globalProducts[index].id, document.getElementsByClassName('btnUpdateReviews')[index])).then(() => {
    //     //setTimeout(() => {
    //         index++
    //         if (index < limitIndex)
    //             updateReiewsProducts(index, limitIndex)
    //         else
    //             log('Done Update Reviews All Product')
    //     //}, 2000)
    // })

    // use recursive native
    let productId = globalProducts[index].id
    let e = document.getElementsByClassName('btnUpdateReviews')[index];
    let spiner = $(e).parent().prev()
    spiner.prop('class', 'fas fa-sync fa-spin')
    $.ajax({
        url: '/product/updateReview/' + productId,
        type: 'GET',
        success: function (data) {
            try {
                spiner.prop('class', 'fa fa-refresh')
                if (data.newReviewIds.length > 0) {
                    $(e).parent().parent().addClass('reviewUpdated')
                    $(e).html(`Updated<span class="newReview">(${data.newReviewIds.length})</span>`)
                } else {
                    $(e).html(`Updated<span>(${data.newReviewIds.length})</span>`)
                }
                console.log(data)
                index++
                if (index < limitIndex)
                    updateReiewsProducts(index, limitIndex)
                else
                    log('Done Update Reviews All Product')
            } catch (e) {
                console.log(e)
            }
        },
        error: function (err) {
            console.log(err)
        }
    });
}
function getQueryConditions() {
    var query = []
    if ($('#cbName').is(':checked'))
        query.push(`name.toLowerCase().indexOf('${$('#txtName').val().toLowerCase()}')>-1`)
    if ($('#cbPrice').is(':checked'))
        query.push(`price ${$('#conditionsPrice option:selected').text()} ${$('#ddlPrice option:selected').text()}`)
    if ($('#cbDistrict').is(':checked'))
        query.push(`districtId == ${$('#ddlDisctrict option:selected').val()}`)
    if ($('#cbRatingCount').is(':checked'))
        query.push(`ratingCount ${$('#conditionsRatingCount option:selected').text()} ${$('#txtRatingCount').val()}`)
    if ($('#cbStatus').is(':checked'))
        query.push(`status === ${$('#ddlStatus option:selected').val()}`)
    if ($('#cbPhotoCount').is(':checked'))
        query.push(`photos.length ${$('#conditionsPhotoCount option:selected').text()} ${$('#ddlPhotoCount option:selected').text()}`)
    if ($('#cbYear').is(':checked'))
        query.push(`parseInt(new Date(this.lastUpdateStamp * 1000).toJSON().slice(0,4)) ${$('#conditionsYear option:selected').text()} ${$('#ddlYear option:selected').text()}`)
    if ($('#cbV1').is(':checked') || $('#cbV3').is(':checked') || $('#cbAge').is(':checked')) {
        query.push('attributes !== undefined')
        if ($('#cbV1').is(':checked'))
            query.push(`attributes['51'] ${$('#conditionsV1 option:selected').text()} ${$('#txtV1').val()}`)
        if ($('#cbV3').is(':checked'))
            query.push(`attributes['49'] ${$('#conditionsV3 option:selected').text()} ${$('#txtV3').val()}`)
        if ($('#cbAge').is(':checked'))
            query.push(`new Date(this.attributes['42']*1000).getFullYear() ${$('#conditionsAge option:selected').text()} ${$('#ddlAge option:selected').text()}`)
    }
    return query
}

function configureConditionsController() {
    let checkboxsControl = [
        { cbDistrict: ['ddlDisctrict'] },
        { cbName: ['lbName', 'txtName'] },
        { cbPrice: ['lbPrice', 'conditionsPrice', 'ddlPrice'] },
        { cbRatingCount: ['lbRatingCount', 'conditionsRatingCount', 'txtRatingCount'] },
        { cbStatus: ['ddlStatus'] },
        { cbPhotoCount: ['lbPhotoCount', 'conditionsPhotoCount', 'ddlPhotoCount'] },
        { cbYear: ['lbYear', 'conditionsYear', 'ddlYear'] },
        { cbV1: ['lbV1', 'conditionsV1', 'txtV1'] },
        { cbV3: ['lbV3', 'conditionsV3', 'txtV3'] },
        { cbAge: ['lbAge', 'conditionsAge', 'ddlAge'] }
    ]
    // bind event change show hide component conditions
    checkboxsControl.forEach(checkbox => {
        var checkboxId = Object.keys(checkbox)[0]
        $('#' + checkboxId).change(function () {
            let checkboxIsChecked = $('#' + checkboxId).is(':checked')
            if (checkboxIsChecked) {
                checkbox[checkboxId].forEach(e => {
                    var eE = $('#' + e)
                    eE.show()
                    if (eE.is('input') || eE.is('select')) eE.focus()
                })
            } else {
                checkbox[checkboxId].forEach(e => {
                    $('#' + e).hide()
                })
            }
        })
        // set checked default
        switch (checkboxId) {
            case 'cbPrice':
            case 'cbAge':
            case 'cbYear':
                $('#' + checkboxId).prop('checked', true).change();
                break
            default:
                $('#' + checkboxId).prop('checked', false).change();
                break
        }
    })
}

function drawProduct(products) {
    var strHtml = '';
    products.forEach((product, index) => {
        let productLastUpdateTime = new Date(product.lastUpdateStamp * 1000),
            _age = product.attributes && product.attributes['42'] || 1,
            _1v = product.attributes && product.attributes['51'] || 'NULL',
            _3v = product.attributes && product.attributes['49'] || 'NULL',
            _t = product.attributes && product.attributes['46'] || 'NULL'
        strHtml = strHtml + `
        <div class="productItem">
            <span class="productIndex rounded-circle">${index + 1}</span>
            <i class="fa fa-user"></i><span class="productName">${product.name}</span><i class="fa fa-film"></i><span class="productId">${product.id}</span><br />
            <i class="fa fa-money"></i><span class="productPrice ">${product.price}</span>
            <i class="fa fa-bolt"></i><span class="productStatus">${product.status == 1 ? 'Active' : 'Off'}</span>
            <i class="fa fa-user-plus"></i><span class="productRatingCount">${product.ratingCount}</span>
            <i class="fa fa-phone"></i><span class="productPhone">${product.phone}</span><br/>
            <i class="fa fa-calendar"></i><span class="productDate">${productLastUpdateTime.toLocaleDateString() + ' ' + productLastUpdateTime.toLocaleTimeString()}</span><br />
            <i class="fa fa-heartbeat"></i><span class="productAge">${new Date(_age * 1000).getFullYear()}</span>
            <!-- <i class="fa fa-american-sign-language-interpreting"></i> -->
            <i class="fa fa-stethoscope"></i><span class="productV1">${_1v}</span>
            <i class="fa fa-wheelchair"></i><span class="productV3">${_3v}</span>
            <i class="fa fa-child"></i><span>${_t}</span><br />
            <i class="fa fa-windows"></i></i><span><a href="#" onclick="openProductFolder('${product.id}'); return false">Open</a></span>
            <i class="fa fa-refresh"></i><span><a href="#" class="btnUpdateReviews" onclick="updateReviews('${product.id}',this); return false;">Update Reviews</a></span>
            <i class="fa fa-cloud-download"></i><span><a href="#" onclick="fetchAllReviews('${product.id}'); return false;">Fetch All Reviews</a></span>
        </div>`
    })
    $('#divProducts').html(strHtml)
    // register event runtime
    $('.productItem').click(function () {
        let productItem = $(this)
        if (!productItem.hasClass('active')) {
            $('.productItem').removeClass('active')
            productItem.addClass('active')
        } else
            productItem.removeClass('active')
    })
}

function genConditions() {
    let conditions = ['&gt;=', '&lt;=', '==', '&gt;', '&lt;'],
        ddlIds = [
            'conditionsPrice', 'conditionsRatingCount',
            'conditionsPhotoCount', 'conditionsYear',
            'conditionsV1', 'conditionsV3',
            'conditionsAge'
        ]
    strHtml = ''
    conditions.forEach(condition => {
        strHtml += `<option>${condition}</option>`
    })
    ddlIds.forEach(ddlId => {
        $('#' + ddlId).html(strHtml)
    })
}

function genPrices() {
    let strHtml = ''
    for (let i = 2; i <= 40; i++) {
        strHtml += `<option ${i === 20 ? 'selected' : ''}>${i * 100}</option>`
    }
    $('#ddlPrice').html(strHtml)
}

function genYears() {
    let strHtml = ''
    for (let i = new Date().getFullYear(); i >= 2015; i--) {
        strHtml += `<option>${i}</option>`
    }
    $('#ddlYear').html(strHtml)
}

function genAges() {
    let strHtml = ''
    for (let i = 101; i >= 86; i--) {
        strHtml += `<option>${1900 + i}</option>`
    }
    $('#ddlAge').html(strHtml)
}
//////////////////////////////////////// AJAX FUNCTIONS ////////////////////////////////////////
function openProductFolder(productId) {
    $.ajax({
        url: '/product/openFolder/' + productId,
        type: 'GET',
        success: function (isOpen) {
            try {
                console.log(isOpen)
            } catch (e) {
                console.log(e)
            }
        },
        error: function (err) {
            console.log(err)
        }
    });
}

// only use for click button a at product item
function updateReviews(productId, e) {
    let spiner = $(e).parent().prev()
    spiner.prop('class', 'fas fa-sync fa-spin')
    $.ajax({
        url: '/product/updateReview/' + productId,
        type: 'GET',
        success: function (data) {
            try {
                spiner.prop('class', 'fa fa-refresh')
                if (data.newReviewIds.length > 0) {
                    $(e).parent().parent().addClass('reviewUpdated')
                    $(e).html(`Updated<span class="newReview">(${data.newReviewIds.length})</span>`)
                } else {
                    $(e).html(`Updated<span>(${data.newReviewIds.length})</span>`)
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

function genDistrict(cityId) {
    $.ajax({
        url: '/product/fetchDistrict/' + cityId,
        type: 'GET',
        success: function (districts) {
            let html = ''
            try {
                districts.sort(function (a, b) {
                    if (a.name < b.name) { return -1; }
                    if (a.name > b.name) { return 1; }
                    return 0;
                })
                districts.forEach(district => {
                    html = html + `<option value="${district.id}">${district.name}</option>`
                })
                $('#ddlDisctrict').html(html)
            } catch (e) {
                log(e)
            }
        },
        error: function (err) {
            log(err)
        }
    });
}