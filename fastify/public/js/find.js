var log = console.log
$().ready(function() {
    // gen conditions part
    setDefaultValues()
    genConditions()
    genPrices()
    genYears()
    genAges()
    $('#btnSearch').click(function() {
        var query = getQueryConditions()
        $.ajax({
            url: '/product/findConditions',
            type: 'GET',
            data: { query: JSON.stringify(query) },
            success: function(products) {
                try {
                    drawProduct(products)
                    log(`[${products.map(product => product.id).sort((a,b)=> a- b).toString()}]`)
                } catch (e) {
                    log(e)
                }
            },
            error: function(err) {
                log(err)
            }
        });
    })
})

function getQueryConditions() {
    var query = []
    if ($('#cbName').is(':checked'))
        query.push(`name.toLowerCase().indexOf('${$('#txtName').val().toLowerCase()}')>-1`)
    if ($('#cbPrice').is(':checked'))
        query.push(`price ${$('#conditionsPrice option:selected').text()} ${$('#ddlPrice option:selected').text()}`)
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

function setDefaultValues() {
    let checkboxsControl = [
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
        $('#' + checkboxId).change(function() {
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
    products.forEach(product => {
        var productLastUpdateTime = new Date(product.lastUpdateStamp * 1000)
        strHtml = strHtml + `
        <div class="productItem">
            <i class="fa fa-user"></i><span class="productName">${product.name}</span><i class="fa fa-film"></i><span class="productId">${product.id}</span><br />
            <i class="fa fa-money"></i><span class="productPrice ">${product.price}</span>
            <i class="fa fa-bolt"></i><span class="productStatus">${product.status == 1 ? 'Active' : 'Off'}</span>
            <i class="fa fa-user-plus"></i><span class="productRatingCount">${product.ratingCount}</span>
            <i class="fa fa-phone"></i><span class="productPhone">${product.phone}</span><br/>
            <i class="fa fa-calendar"></i><span class="productDate">${productLastUpdateTime.toLocaleDateString() + ' ' + productLastUpdateTime.toLocaleTimeString()}</span><br />
            <i class="fa fa-heartbeat"></i><span class="productAge">${new Date(product.attributes['42'] * 1000).getFullYear()}</span>
            <!-- <i class="fa fa-american-sign-language-interpreting"></i> -->
            <i class="fa fa-stethoscope"></i><span class="productV1">${product.attributes['51']}</span>
            <i class="fa fa-wheelchair"></i><span class="productV3">${product.attributes['49']}</span>
            <i class="fa fa-child"></i><span>${product.attributes['46']}</span><br />
            <i class="fa fa-windows"></i></i><span><a href="#" onclick="openProductFolder('${product.id}'); return false">Open</a></span>
            <i class="fa fa-refresh"></i><span><a href="#" onclick="updateReviews('${product.id}',this); return false;">Update Reviews</a></span>
            <i class="fa fa-cloud-download"></i><span><a href="#" onclick="fetchAllReviews('${product.id}'); return false;">Fetch All Reviews</a></span>
        </div>`
    })
    $('#divProducts').html(strHtml)
        // register event runtime
    $('.productItem').click(function() {
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
        success: function(isOpen) {
            try {
                console.log(isOpen)
            } catch (e) {
                console.log(e)
            }
        },
        error: function(err) {
            console.log(err)
        }
    });
}

function updateReviews(productId, e) {
    $(e).parent().prev().prop('class', 'fas fa-sync fa-spin')
    $.ajax({
        url: '/product/updateReview/' + productId,
        type: 'GET',
        success: function(data) {
            try {
                $(e).parent().prev().prop('class', 'fa fa-refresh')
                if (data.newReviewIds.length > 0) {
                    alert(`Has ${data.newReviewIds.length} new reviews`)
                }
                console.log(data)
            } catch (e) {
                console.log(e)
            }
        },
        error: function(err) {
            console.log(err)
        }
    });
}