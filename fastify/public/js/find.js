let log = console.log,
    globalProducts = [],
    globalDistricts = {},
    globalConfiguration = {},
    globalUpdatedReviewProducts = []
/**
 * todo 
 *  - add setting bar for find page (hide all conditions, show cover ...)
 *  - stop/start focus when run scaper tool (done)
 *  - position of fetch all revews button and input startIndex must be fixed (bottom-right)
 *  - add month condition (done)
 *  - add id condition
 *  - FETCH ALL STOP IMEDIATELY -> ADD ERROR HANLDER AJAX NEXT (done)
 *  - show cover photo(latest photo type is cover) (done)
 *  - Fix : (node:20896) DeprecationWarning: current Server Discovery and Monitoring engine is deprecated, and will be removed in a future version. 
 *          To use the new Server Discover and Monitoring engine, pass option { useUnifiedTopology: true } to the MongoClient constructor.
 */
$().ready(function () {
    // gen conditions part
    fetchConfiguration(() => {
        genRegions()
        genGroupBy()
        genStatus()
    })
    genConditions()
    genBackground()
    genDistricts(2)
    genCities(1)
    genPrices()
    genMonths()
    genYears()
    genAges()
    config()

    $('#btnSearch').click(function () {
        let spiner = $(this).children()
        spiner.prop('class', 'fas fa-sync fa-spin')
        var query = getQueryConditions()
        $.ajax({
            url: '/products/findConditions',
            type: 'GET',
            data: { query: JSON.stringify(query) },
            success: function (products) {
                spiner.prop('class', 'fab fa-searchengin')
                try {
                    globalProducts = products
                    var typeSorting = $('#ddlSorting option:selected').val()
                    $('#productTitleCount').text(`Product Result [${products.length}]`)
                    drawProduct(sort(typeSorting, products))
                    //log(`[${products.map(product => product.id).sort((a, b) => a - b).toString()}]`)
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

    $('#btnDeleteAllProducts').click(function () {
        var isDeleted = confirm('Are you sure delete all product ?')
        if (isDeleted) deleteProducts($('#txtStartIndexUpdateReviews').val(), globalProducts.length)
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

    $('#cbHideProductName').change(function () {
        if ($(this).is(':checked')) {
            $('.productName').css('display', 'none')
        }
        else {
            $('.productName').css('display', '')
        }
    })

    $('#ddlSorting').change(function () {
        var typeSorting = $('#ddlSorting option:selected').val()
        drawProduct(sort(typeSorting, globalProducts))
    })

    $('#btnFetchListId').click(function () {
        let btnFetchListId = $(this),
            spiner = btnFetchListId.children(),
            txtListId = $('#txtListId')
        spiner.prop('class', 'fas fa-sync fa-spin')
        var pageRange = txtListId.val()
        $.ajax({
            url: '/products/new/listid/' + pageRange,
            type: 'GET',
            success: function (data) {
                btnFetchListId.html(`<i class="fa fa-cloud-download-alt"></i> Fetch New Products (${data.length})`)
                txtListId.val(data)
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

    $('#btnFetchNewProducts').click(function () {
        let btnFetchNewProduct = $(this),
            spiner = btnFetchNewProduct.children(),
            data = { listId: JSON.stringify($('#txtListId').val().split(',')), acceptedMinPrice: $('#txtAcceptedMinPrice').val() }
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

    $('#ddlCity').change(function () {
        genDistricts(this.value)
    })

    $('#cbDistrict').change(function () {
        if (this.checked)
            $('#cbCity').prop('checked', true).change()
    })

    $('#cbId').change(function () {
        if (this.checked)
            $('input[name!=id]').prop('checked', false).change()
    })

    $('#btnOpenChart').click(function () {
        genChart(globalProducts, $('#ddlGroupBy option:selected').val())
    })

    $('#btnFetchLastId').click(function () {
        fetchLastProductId()
    })

    $('#txtName, #txtId').keyup(function (e) {
        var code = e.which;
        if (code === 13) $('#btnSearch').trigger('click')
    })

    // show hide lef quick-controller
    $('.slider-arrow').on('click mouseover', function () {
        if ($(this).hasClass('show')) {
            $(".slider-arrow, .quick-controller").animate({
                left: "+=182"
            }, 200, function () {
                // Animation complete.
            })
            $(this).html('&laquo;').removeClass('show').addClass('hide');
        }
        else {
            $(".slider-arrow, .quick-controller").animate({
                left: "-=182"
            }, 200, function () {
                // Animation complete.
            })
            $(this).html('&raquo;').removeClass('hide').addClass('show');
        }
    })

    $('#btnRefresh').click(function () {
        drawProduct(globalProducts)
    })
})

// use for button update all product
function getQueryConditions() {
    var query = []
    if ($('#cbId').is(':checked'))
        query.push(`id ${$('#conditionsId option:selected').text()} ${$('#txtId').val()}`)
    if ($('#cbName').is(':checked') && $('#txtName').val() !== '')
        query.push(`name.toLowerCase().indexOf('${$('#txtName').val().toLowerCase()}')>-1`)
    if ($('#cbPrice').is(':checked'))
        query.push(`price ${$('#conditionsPrice option:selected').text()} ${$('#ddlPrice option:selected').text()}`)
    if ($('#cbPriceRange').is(':checked')) {
        query.push(`price ${$('#conditionsPriceFrom option:selected').val()} ${$('#ddlPriceFrom option:selected').text()}`)
        query.push(`price ${$('#conditionsPriceTo option:selected').val()} ${$('#ddlPriceTo option:selected').text()}`)
    }
    if ($('#cbDistrict').is(':checked') && $('#cbCity').is(':checked'))
        query.push(`districtId == ${$('#ddlDisctrict option:selected').val()}`)
    else if ($('#cbDistrict').is(':checked'))
        query.push(`districtId == ${$('#ddlDisctrict option:selected').val()}`)
    else if ($('#cbCity').is(':checked'))
        query.push(`cityId == ${$('#ddlCity option:selected').val()}`)

    if ($('#cbRatingCount').is(':checked'))
        query.push(`ratingCount ${$('#conditionsRatingCount option:selected').text()} ${$('#txtRatingCount').val()}`)
    if ($('#cbStatus').is(':checked')) {
        var status = parseInt($('#ddlStatus option:selected').val())
        if (status === 3) {
            query.push('meta !== undefined')
            query.push(`meta.onLeave === true`)
        }
        else query.push(`status === ${status}`)
    }
    if ($('#cbPhotoCount').is(':checked'))
        query.push(`photos.length ${$('#conditionsPhotoCount option:selected').text()} ${$('#txtPhotoCount').val()}`)
    if ($('#cbMonth').is(':checked'))
        query.push(`parseInt(new Date(this.lastUpdateStamp * 1000).toJSON().slice(5,7)) ${$('#conditionsMonth option:selected').text()} ${$('#ddlMonth option:selected').text()}`)
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

function sort(type, products) {
    log(type)
    var sortedProducts = []
    switch (type) {
        case "price":
            sortedProducts = _u.orderBy(products, ['price'])
            break
        case "time":
            sortedProducts = _u.orderBy(products, ['lastUpdateStamp'])
            break
        case "rating":
            sortedProducts = _u.orderBy(products, ['ratingCount'])
            break
        default: sortedProducts = products
            break
    }
    return sortedProducts.reverse()
}

function config() {
    let checkboxsControl = [
        { cbCity: ['ddlCity'] },
        { cbRegion: ['ddlRegion'] },
        { cbStatus: ['ddlStatus'] },
        { cbDistrict: ['ddlDisctrict'] },
        { cbName: ['lbName', 'txtName'] },
        { cbId: ['lbId', 'conditionsId', 'txtId'] },
        { cbV1: ['lbV1', 'conditionsV1', 'txtV1'] },
        { cbV3: ['lbV3', 'conditionsV3', 'txtV3'] },
        { cbAge: ['lbAge', 'conditionsAge', 'ddlAge'] },
        { cbYear: ['lbYear', 'conditionsYear', 'ddlYear'] },
        { cbMonth: ['lbMonth', 'conditionsMonth', 'ddlMonth'] },
        { cbPrice: ['lbPrice', 'conditionsPrice', 'ddlPrice'] },
        { cbPhotoCount: ['lbPhotoCount', 'conditionsPhotoCount', 'txtPhotoCount'] },
        { cbRatingCount: ['lbRatingCount', 'conditionsRatingCount', 'txtRatingCount'] },
        { cbPriceRange: ['lbPriceRange', 'conditionsPriceFrom', 'conditionsPriceTo', 'ddlPriceFrom', 'ddlPriceTo'] },
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
            //case 'cbAge':
            //case 'cbYear':
            case 'cbStatus':
                //case 'cbMonth':
                $('#' + checkboxId).prop('checked', true).change();
                break
            default:
                $('#' + checkboxId).prop('checked', false).change();
                break
        }
    })
    // default price group
    $('#conditionsPriceFrom option[value="<="]').prop('selected', 'selected')
    $('#conditionsPriceTo option[value="<="]').prop('selected', 'selected')
    // default time group
    $('#conditionsAge option[value="<="]').prop('selected', 'selected')
    $('#conditionsYear option[value="=="]').prop('selected', 'selected')
    $('#conditionsMonth option[value="=="]').prop('selected', 'selected')
    $(`#ddlMonth option[value=${new Date().getMonth() + 1}]`).prop('selected', 'selected')
    // set default cover setting
    $('#cbHideProductCover').prop('checked')
    $('.productCover').css('display', 'none')
    $('.productItem').css('width', '300px')
    // default photo count
    $('#conditionsPhotoCount option[value=">"]').prop('selected', 'selected')
    $('#txtPhotoCount').val(1)
}

function drawProduct(products) {
    var strHtml = '';
    products.forEach((product, index) => {
        let _age = product.attributes && product.attributes['42'] || 1,
            _1v = product.attributes && product.attributes['51'] || 'N',
            _3v = product.attributes && product.attributes['49'] || 'N',
            _t = product.attributes && product.attributes['46'] || 'N',
            _author = product.author && product.author.displayName || 'N',
            _authorName = product.author && product.author.username || 'N',
            _cover = product.cover && product.cover.dimensions && product.cover.dimensions.small && product.cover.dimensions.small.file || 'NULL',
            productLastUpdateTime = new Date(product.lastUpdateStamp * 1000),
            _dateFormating = productLastUpdateTime.toLocaleDateString().split('/'),
            _date = _dateFormating[1] + '/' + _dateFormating[0] + '/' + _dateFormating[2],
            _region = product.attributes && product.attributes['68'] || 'N'
        _cover = $('#cbUseCoverUrl').is(':checked') ? globalConfiguration.coverUrl + _cover : `/public/products/${product.id}/${_cover}`
        strHtml = strHtml + `
        <div class="productItem">
            <span class="productIndex rounded-circle">${index + 1}</span>
            <div class="productIdName">
            <i class="fa fa-user"></i>
            <a href="#" onclick="openTabProduct('${product.id}'); return false;">[${product.id}]</a>
            <span class="productName"> ${product.name}</span>
            </div>
            <div class="productCover">
                ${($('#cbHideProductCover').is(':checked') ? '' : `<img src="${_cover}">`)}
            </div>
            <div class="productInfo">
                <i class="fa fa-money"></i><span class="productPrice">${product.price} $</span>
                <i class="fa fa-bolt"></i><span class="productStatus${'-' + globalConfiguration.statuses[product.status] || ''}">${globalConfiguration.statuses[product.status]}</span><br />
                <i class="fa fa-phone"></i><span class="productPhone">${product.phone}</span>
                <i class="fas fa-map-marked-alt"></i><span class="productRegion">${globalConfiguration.regions[_region]}</span>
                <br />
                <i class="fas fa-map-marker-alt"></i><span class="productPlace">${globalDistricts[product.districtId]}</span>
                <i class="fa fa-user-plus"></i><span class="productRatingCount">${product.ratingCount}(${product.ratingCountTotal || 'N'})</span>
                <i class="fa fa-trophy"></i><span class="productRatingScore">${product.ratingScore}</span><br />
                <i class="fa fa-calendar"></i><span class="productDate">${_date}</span>
                <i class="fa fa-user-secret"></i>
                <span class="productAuthor">
                    <a href="#" onclick="openTabAuthor('${_authorName}'); return false;">${_author}</a>
                </span><br />
                <i class="fa fa-stethoscope"></i><span class="productV1">${_1v}</span>
                <i class="fa fa-wheelchair"></i><span class="productV3">${_3v}</span>
                <i class="fa fa-child"></i><span>${_t}</span><br />
                <i class="fa fa-heartbeat"></i><span class="productAge">${new Date(_age * 1000).getFullYear()}</span>
                <i class="fa fa-refresh"></i><span style="margin-right: 0!important;">
                <a class="btnUpdateReviews action" href="#" onclick="updateReviews('${product.id}',this); return false;">Update Reviews</a></span><br />
                <i class="far fa-folder-open"></i>
                <span><a class="action" href="#" onclick="openProductFolder('${product.id}'); return false">Open Folder</a></span>
                <i class="fas fa-globe"></i>
                <span><a class="action" href="#" onclick="openWeb('${product.id}'); return false;">Open Web</a></span><br />
                <i class="fa fa-cloud-download-alt"></i><span>
                <a class="btnFetchAllReviews action" href="#" onclick="fetchAllImagesReviews('${product.id}', this); return false;">Fetch All Reviews</a></span>
                <i class="fa fa-trash-alt"></i>
                <span><a class="action-delete btnDelete" href="#" onclick="deleteProduct('${product.id}', this); return false;">Delete</a></span><br />
                <i class="fas fa-chart-line"></i>
                <span><a class="action" href="#" onclick="openChartReview('${product.id}','${product.name}'); return false;">Open Statistic Chart</a></span><br />
            </div>
            </div>
        `
    })
    $('#divProducts').html(strHtml)
    // register event runtime
    $('.productItem').click(function () {
        let productItem = $(this)
        if (!productItem.hasClass('selected')) {
            $('.productItem').removeClass('selected')
            productItem.addClass('selected')
        } else
            productItem.removeClass('selected')
    })
    $('#cbHideProductCover').trigger('change')
}

//////////////////////////////////////// GENERATION FUNCTIONS GROUP ////////////////////////////////////////
function genBackground() {
    //src : http://wallpaperswide.com
    let bgRandomNumber = Math.floor(Math.random() * 8)
    bgRandomNumber = bgRandomNumber === 0 ? bgRandomNumber + 1 : bgRandomNumber
    $('body').css('background', `url('img/bg/1 (${bgRandomNumber}).jpg')`)
    $('body').css('background-repeat', 'no-repeat')
    $('body').css('background-attachment', 'fixed')
    $('body').css('background-size', 'cover')
}

function genConditions() {
    let conditions = ['&gt;=', '&lt;=', '==', '&gt;', '&lt;', '!='],
        ddlIds = [
            'conditionsPrice', 'conditionsRatingCount',
            'conditionsPhotoCount', 'conditionsMonth', 'conditionsYear',
            'conditionsV1', 'conditionsV3',
            'conditionsAge', 'conditionsId'
        ]
    strHtml = ''
    conditions.forEach(condition => {
        strHtml += `<option value="${condition}">${condition}</option>`
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
    $('#ddlPriceFrom').html(strHtml)
    $('#ddlPriceTo').html(strHtml)
}

function genYears() {
    let strHtml = ''
    for (let i = new Date().getFullYear(); i >= 2016; i--) {
        strHtml += `<option>${i}</option>`
    }
    $('#ddlYear').html(strHtml)
}

function genMonths() {
    let strHtml = ''
    for (let i = 1; i <= 12; i++) {
        strHtml += `<option value="${i}">${i}</option>`
    }
    $('#ddlMonth').html(strHtml)
}

function genAges() {
    let strHtml = ''
    for (let i = 101; i >= 86; i--) {
        strHtml += `<option>${1900 + i}</option>`
    }
    $('#ddlAge').html(strHtml)
}

function genStatus() {
    let ddlStatus = $('#ddlStatus')
    Object.keys(globalConfiguration.statuses).forEach(id => ddlStatus.append(`<option value="${id}">${globalConfiguration.statuses[id]}</option>`))
}

function genGroupBy() {
    let ddlGroupBy = $('#ddlGroupBy')
    globalConfiguration.groups.forEach(group => ddlGroupBy.append(`<option value="${group.key}">${group.name}</options>`))
}

function genRegions(){
    let ddlRegion = $('#ddlRegion')
    Object.keys(globalConfiguration.regions).forEach(id => ddlRegion.append(`<option value="${id}">${globalConfiguration.regions[id]}</option>`))
}

function openTabProduct(id) {
    window.open(globalConfiguration.productDetailUrl + id, '_blank')
}

function openTabAuthor(authorName) {
    window.open(globalConfiguration.authorUrl + authorName, '_blank')
}


//////////////////////////////////////// AJAX FUNCTIONS GROUP ////////////////////////////////////////

function openProductFolder(productId) {
    $.ajax({
        url: '/products/openFolder/' + productId,
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

function fetchConfiguration(callback) {
    $.ajax({
        url: '/products/configurations/',
        type: 'GET',
        success: function (configs) {
            try {
                globalConfiguration = configs
                callback(configs)
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
        url: '/products/review/update/' + productId,
        type: 'GET',
        data: { isFetchImage: $('#cbIsFetchImage').is(':checked') },
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

function genCities(countryId) {
    $.ajax({
        url: '/products/cities/' + countryId,
        type: 'GET',
        success: function (cities) {
            try {
                cities.forEach(city => $('#ddlCity').append(`<option value="${city.id}">${city.name}</option>`))
            } catch (e) {
                log(e)
            }
        },
        error: function (err) {
            log(err)
        }
    });
}

function genDistricts(cityId) {
    $.ajax({
        url: '/products/districts/' + cityId,
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
                    globalDistricts[district.id] = district.name
                })
                log(globalDistricts)
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

function openChartReview(productId, productName) {
    window.chartReview = {
        cfg: {
            title: globalConfiguration.titleByReport + ' ' + productName + '(' + new Date().toLocaleDateString() + ')',
            subTitle: `${globalConfiguration.subTitle}`,
            titleX: globalConfiguration.titleX,
            titleY: globalConfiguration.titleY
        }
    }
    log(window['chart'])
    window.open('chart-review.html?id=' + productId, 'Chart', 'width=' + 1360 + ',height=' + 1000 + ',toolbars=no,scrollbars=no,status=no,resizable=no');
}

function genChart(products, type) {
    let ddlGroupBy = $('#ddlGroupBy option:selected')
    window["chart"] = {
        data: [],
        cfg: {
            title: globalConfiguration.title + ddlGroupBy.text().toUpperCase() + '(' + new Date().toLocaleDateString() + ')',
            subTitle: `${globalConfiguration.subTitle} query: ${getQueryConditions().toString()}`,
            titleX: ddlGroupBy.text(),
            titleY: globalConfiguration.titleY
        }
    }
    if (type === 'author') {
        window.chart.data = _u.chain(products)
            .groupBy(function (product) { return product.author.displayName })
            .map((value, key) => {
                return { name: key, y: value.length }
            })
            .value()
        window.chart.cfg.titleX = window.chart.data.length + ' ' + ddlGroupBy.text().toUpperCase()
    }
    else {
        window.chart.data =
            _u.chain(products)
                .groupBy(type)
                .map((value, key) => {
                    let item = {}
                    item[type] = key
                    item['products'] = value
                    return item
                })
        let groups = window.chart.data
        switch (type) {
            case "price":
                window.chart.data = groups.map(group => {
                    let price = group.price;
                    return { name: price >= 1000 ? price / 1000 + globalConfiguration.priceUnit[1] : price + globalConfiguration.priceUnit[0], y: group.products.length }
                }).value()
                break;
            case "districtId":
                window.chart.data = groups.map(group => {
                    let districtName = globalDistricts[group.districtId] || 'districtId=' + group.districtId
                    return { name: districtName, y: group.products.length }
                }).value()
                break;
            case "status":
                window.chart.data = groups.map(group => {
                    let statusName = globalConfiguration.statuses[group.status] || 'status=' + group.status
                    return { name: statusName, y: group.products.length }
                }).value()
                break;
        }
    }
    let sumOfYValue = _u.sumBy(window.chart.data, 'y')
    window.chart.data.map(group => {
        group.percent = (group.y / sumOfYValue) * 100
        return group
    })
    log(window.chart)
    window.open('chart.html', 'Chart', 'width=' + 1360 + ',height=' + 1000 + ',toolbars=no,scrollbars=no,status=no,resizable=no');
}

function updateReiewsProducts(index, limitIndex) {
    // use recursive native
    let productId = globalProducts[index].id
    let btnUpdateReview = document.getElementsByClassName('btnUpdateReviews')[index];
    $(btnUpdateReview).parent().parent().parent().addClass('active')
    if ($('#cbFocusProductItem').is(':checked')) $(btnUpdateReview).focus()
    let spiner = $(btnUpdateReview).parent().prev()
    spiner.prop('class', 'fas fa-sync fa-spin')
    $.ajax({
        url: '/products/review/update/' + productId,
        type: 'GET',
        data: { isFetchImage: $('#cbIsFetchImage').is(':checked') },
        success: function (data) {
            try {
                $(btnUpdateReview).parent().parent().parent().removeClass('active')
                spiner.prop('class', 'fa fa-refresh')

                if (data.newReviewIds.length > 0) {
                    // effect to html layout
                    $(btnUpdateReview).parent().parent().parent().addClass('reviewUpdated')
                    $(btnUpdateReview).html(`Updated<span class="newReview">(${data.newReviewIds.length})</span>`)
                    // push updated product 
                    globalUpdatedReviewProducts.push(globalProducts[index])
                } else {
                    $(btnUpdateReview).html(`Updated<span>(${data.newReviewIds.length})</span>`)
                }
                console.log(data)
                index++
                if (index < limitIndex)
                    updateReiewsProducts(index, limitIndex)
                else {
                    log('Done Update Reviews All Product')
                    // use for sorting after updated reviews
                    globalProducts = globalUpdatedReviewProducts
                    drawProduct(globalUpdatedReviewProducts)
                }
            } catch (error) {
                $(btnUpdateReview).parent().parent().parent().addClass('errorTry')
                index++
                if (index < limitIndex)
                    updateReiewsProducts(index, limitIndex)
                else
                    log('Done Update Reviews All Product')
                log(error)
            }
        },
        error: function (err) {
            $(btnUpdateReview).parent().parent().parent().addClass('errorAjax')
            index++
            if (index < limitIndex)
                updateReiewsProducts(index, limitIndex)
            else
                log('Done Update Reviews All Product')
            console.log(err)
        }
    });
}

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
                        $(btnDelete).parent().parent().parent().detach()
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

function deleteProducts(index, limitIndex) {
    // use recursive native
    let productId = globalProducts[index].id
    let btnDelete = document.getElementsByClassName('btnDelete')[index];
    $(btnDelete).parent().parent().parent().addClass('active')
    if ($('#cbFocusProductItem').is(':checked')) $(btnDelete).focus()
    let spiner = $(btnDelete).parent().prev()
    spiner.prop('class', 'fas fa-sync fa-spin')
    $.ajax({
        url: '/products/delete/' + productId,
        type: 'GET',
        data: {
            isDeleteAtDatabase: $('#cbDeleteProductAtDatabase').is(':checked')
        },
        success: function (res) {
            try {
                if (res.success) {
                    $(btnDelete).parent().parent().parent().detach()
                }
                console.log(res)
                index++
                if (index < limitIndex)
                    deleteProducts(index, limitIndex)
                else {
                    log('Done Delete All Products')
                    drawProduct(globalUpdatedReviewProducts)
                }
            } catch (error) {
                log(error)
            }
        },
        error: function (err) {
            log(err)
        }
    });
}


