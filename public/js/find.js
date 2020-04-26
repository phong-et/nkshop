
let globalProducts = [],
    globalDistricts = {},
    globalCities = {},
    globalConfiguration = {},
    globalReviewedProduct = [],
    globalOffProducts = [],
    globalOnLeaveProducts = [],
    globalErrorProducts = []
/**
 * todo 
 * Ad
 *  - stop fetching
 *  - write log product when update reviews
 *  - authenticated user
 * Co
 *  - multi-languages
 *  - public site (mobile and web) - make new branch
 *  - split api to product and review path (need fix mongoose model again)
 *  - caching performance 
 *  - log query 
 *  - write docs about knowledge during doing product
 *  - write api docs
 *  - 
 *  - Fix : (node:20896) DeprecationWarning: current Server Discovery and Monitoring engine is deprecated, and will be removed in a future version. 
 *          To use the new Server Discover and Monitoring engine, pass option { useUnifiedTopology: true } to the MongoClient constructor.
 */
$().ready(function () {
    // gen conditions part
    fetchConfiguration(() => {
        genRegions()
        genGroupBy()
        genStatus()
        $('#txtAcceptedMinPrice').val(globalConfiguration.minPriceFetchImage)
    })
    genConditions()
    genBackground()
    genDistricts(2)
    genCities(1)
    genPrices()
    genMonths()
    genYears()
    genDays()
    genAges()
    config()

    $('#btnSearch').click(function () {
        let spiner = $(this).children(),
            data = {},
            expandedQuery = {}
        data['query'] = JSON.stringify(getQueryConditions()),
            spiner.prop('class', 'fas fa-sync fa-spin')
        if ($('#cbInReview').is(':checked') || $('#cbInLog').is(':checked')) {
            // format layout : 14/11/2019
            // format database : d.toJSON() => 2019-11-14T13:49:40.346Z
            var dateFormating = $('#datepickerReview').val().split('/')
            switch ($('input[type=radio][name=datereview]:checked').val()) {
                case "month":
                    expandedQuery['date'] = dateFormating[1] + '-' + dateFormating[0]
                    break
                case "year":
                    expandedQuery['date'] = dateFormating[0]
                    break
                case "day":
                    expandedQuery['date'] = dateFormating[2] + '-' + dateFormating[1] + '-' + dateFormating[0]
                    break
            }

            if ($('#cbInReview').is(':checked') && $('#cbInLog').is(':checked'))
                expandedQuery['collection'] = 'review-log'
            else if ($('#cbInReview').is(':checked'))
                expandedQuery['collection'] = 'review'
            else if ($('#cbInLog').is(':checked'))
                expandedQuery['collection'] = 'log'
            data['expandedQuery'] = JSON.stringify(expandedQuery)
            log(expandedQuery)
        }
        $.ajax({
            url: '/products/findConditions',
            type: 'GET',
            data: data,
            success: function (products) {
                spiner.prop('class', 'fab fa-searchengin')
                try {
                    globalProducts = products
                    ////////////////////////////// calc duplicate product ids ///////////////////////////////
                    let productIds = products.map(product => product.id);
                    //productIds = Array.from(new Set(productIds))
                    log(productIds.length)
                    let ids = _u.filter(productIds, (val, i, iteratee) => _u.includes(iteratee, val, i + 1));
                    log('Duplicate product ids:')
                    log(ids)
                    ////////////////////////////// calc duplicate phone number ///////////////////////////////
                    let phones = products.map(product => product.phone);
                    //phones = Array.from(new Set(phones))
                    log(phones.length)
                    let duplicatePhones = _u.filter(phones, (val, i, iteratee) => _u.includes(iteratee, val, i + 1));
                    log('duplicate phones:')
                    log(duplicatePhones)
                    log(duplicatePhones.toString())
                    //////////////////////////////////////////////////////////////////////////////////////////
                    var typeSorting = $('#ddlSorting option:selected').val()
                    $('#productTitleCount').text(`Product Result [${products.length}]`)
                    globalProducts = sort(typeSorting, products)

                    let isRenderProduct = $('#cbRenderProduct').is(':checked')
                    if (isRenderProduct) drawProduct(globalProducts)
                    //log(`[${products.map(product => product.id).sort((a, b) => a - b).toString()}]`)
                    //log(products.map(product => product.id).sort((a, b) => a - b).toString())
                } catch (e) {
                    log(e)
                }
            },
            timeout: 150000,
            error: function (err) {
                log(err)
            }
        });
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
            $('input[id!=cbId]').prop('checked', false).change() \
        $('#cbRenderProduct').prop('checked', true)
    })

    $('#cbPhone').change(function () {
        if (this.checked)
            $('input[id!=cbPhone]').prop('checked', false).change()
        $('#cbRenderProduct').prop('checked', true)
    })

    $('#txtPhone').focus(function () {
        $(this).val('')
    })

    $('#btnOpenChart').click(function () {
        genChart(globalProducts, $('#ddlGroupBy option:selected').val())
    })

    $('#txtName, #txtId, #txtPhone').keyup(function (e) {
        var code = e.which
        if (e.target.id === 'txtPhone')
            $(this).val($(this).val().replace(/\./g, ""))
        if (code === 13) {
            $('#btnSearch').trigger('click')
        }
    })

    var options = {
        format: 'dd/mm/yyyy',
        setDate: new Date(),
        defaultViewDate: new Date(),
        autoclose: true,
        todayHighlight: true,
    }

    $('#datepickerReview').datepicker(options).datepicker("setDate", 'now')

    $('input[name=datereview]').change(function () {
        log(this.value)
        var datePicker = $('#datepickerReview')
        datePicker.datepicker('destroy');
        switch (this.value) {
            case "month":
                options.format = 'mm/yyyy'
                options.minViewMode = 1
                break
            case "year":
                options.format = 'yyyy'
                options.minViewMode = 2
                break
            case "day":
                delete options.minViewMode
                options.format = 'dd/mm/yyyy'
                break
        }
        datePicker.datepicker(options).datepicker("setDate", 'now')
    })

    $('#ddlPrice, #ddlPriceFrom, #ddlPriceTo').change(function () {
        if (this.value <= 300) {
            $('#cbIsFetchImageReview').prop('checked', false)
            $('#cbIsFetchImageProduct').prop('checked', false)
        } else {
            $('#cbIsFetchImageReview').prop('checked', true)
            $('#cbIsFetchImageProduct').prop('checked', true)
        }
    })

})
// use for button update all product
function getQueryConditions() {
    var query = []
    if ($('#cbId').is(':checked'))
        query.push(`id ${$('#conditionsId option:selected').text()} ${$('#txtId').val()}`)
    if ($('#cbPhone').is(':checked') && $('#txtPhone').val() !== '')
        query.push(`phone === '${$('#txtPhone').val().trim()}'`)
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
        var statusId = +$('#ddlStatus option:selected').val()
        switch (statusId) {
            case 3: // LEAVE
                query.push('meta !== undefined')
                query.push(`meta.onLeave === true`)
                //query.push(`status != 2`)
                query.push(`status != 99`)
                break
            case 2: // OFF
                query.push('meta !== undefined')
                query.push(`meta.onLeave === undefined`)
                //query.push(`meta.onLeave === false`)
                query.push(`status === ${statusId}`)
                break
            default: query.push(`status === ${statusId}`)
                break
        }
    }
    if ($('#cbPhotoCount').is(':checked'))
        query.push(`photos.length ${$('#conditionsPhotoCount option:selected').text()} ${$('#txtPhotoCount').val()}`)
    if ($('#cbDay').is(':checked'))
        query.push(`parseInt(new Date(this.lastUpdateStamp * 1000).toJSON().slice(8,10)) ${$('#conditionsMonth option:selected').text()} ${$('#ddlDay option:selected').text()}`)
    if ($('#cbMonth').is(':checked'))
        query.push(`parseInt(new Date(this.lastUpdateStamp * 1000).toJSON().slice(5,7)) ${$('#conditionsMonth option:selected').text()} ${$('#ddlMonth option:selected').text()}`)
    if ($('#cbYear').is(':checked'))
        query.push(`parseInt(new Date(this.lastUpdateStamp * 1000).toJSON().slice(0,4)) ${$('#conditionsYear option:selected').text()} ${$('#ddlYear option:selected').text()}`)
    if ($('#cbV1').is(':checked') || $('#cbV3').is(':checked') || $('#cbAge').is(':checked') || $('#cbRegion').is(':checked')) {
        query.push('attributes !== undefined')
        if ($('#cbV1').is(':checked'))
            query.push(`attributes['51'] ${$('#conditionsV1 option:selected').text()} ${$('#txtV1').val()}`)
        if ($('#cbV3').is(':checked'))
            query.push(`attributes['49'] ${$('#conditionsV3 option:selected').text()} ${$('#txtV3').val()}`)
        if ($('#cbAge').is(':checked'))
            query.push(`new Date(this.attributes['42']*1000).getFullYear() ${$('#conditionsAge option:selected').text()} ${$('#ddlAge option:selected').text()}`)
        if ($('#cbRegion').is(':checked'))
            query.push(`attributes['68'] == ${$('#ddlRegion option:selected').val()}`)
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
        { cbPhone: ['lbPhone', 'txtPhone'] },
        { cbId: ['lbId', 'conditionsId', 'txtId'] },
        { cbV1: ['lbV1', 'conditionsV1', 'txtV1'] },
        { cbV3: ['lbV3', 'conditionsV3', 'txtV3'] },
        { cbAge: ['lbAge', 'conditionsAge', 'ddlAge'] },
        { cbDay: ['lbDay', 'conditionsDay', 'ddlDay'] },
        { cbYear: ['lbYear', 'conditionsYear', 'ddlYear'] },
        { cbMonth: ['lbMonth', 'conditionsMonth', 'ddlMonth'] },
        { cbPrice: ['lbPrice', 'conditionsPrice', 'ddlPrice'] },
        { cbInReview: ['datepickerContainer', 'datepickerInReviewAndLogFormat'] },
        { cbInLog: ['datepickerContainer', 'datepickerInReviewAndLogFormat'] },
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
                //case 'cbInReview':
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
    $('#conditionsDay option[value="=="]').prop('selected', 'selected')
    $(`#ddlMonth option[value="${new Date().getMonth() + 1}"]`).prop('selected', 'selected')
    $(`#ddlDay option[value="${new Date().getDate()}"]`).prop('selected', 'selected')
    // set default cover setting
    $('#cbHideProductCover').prop('checked')
    $('.productCover').css('display', 'none')
    $('.productItem').css('width', '300px')
    // default photo count
    $('#conditionsPhotoCount option[value=">"]').prop('selected', 'selected')
    $('#txtPhotoCount').val(1)
    // default rating count
    $('#txtRatingCount').val(0)
    // fetchImage
    $('#cbIsFetchImageReview').prop('checked', true)
    $('#cbIsFetchImageProduct').prop('checked', false)
}

function drawProduct(products) {
    var strHtml = '';
    products.forEach((product, index) => {
        let _age = product.attributes && product.attributes['42'] || 1,
            _1v = product.attributes && product.attributes['49'] || 'N',
            _2v = product.attributes && product.attributes['50'] || 'N',
            _3v = product.attributes && product.attributes['51'] || 'N',
            _t = product.attributes && product.attributes['46'] || 'N',
            _author = product.author && product.author.displayName || 'N',
            _authorName = product.author && product.author.username || 'N',
            _cover = product.cover && product.cover.dimensions && product.cover.dimensions.small && product.cover.dimensions.small.file || 'NULL',
            productLastUpdateTime = new Date(product.lastUpdateStamp * 1000),
            _dateFormating = productLastUpdateTime.toLocaleDateString().split('/'),
            _date = _dateFormating[1] + '/' + _dateFormating[0] + '/' + _dateFormating[2],
            _region = product.attributes && product.attributes['68'] || 'N',
            _city = globalCities[product.cityId],
            _onleave = product.meta && product.meta["onLeave"] ? '(on leave)' : '',
            _status = product.status,
            isFindingDeletedProduct = +$('#ddlStatus option:selected').val() === 99,
            coverDeletedProduct = '/products/' + product.id + '/' + _cover,
            coverProduct = `/covers/${_cover}`
        _cover = $('#cbUseCoverUrl').is(':checked') ? globalConfiguration.coverUrl + _cover : isFindingDeletedProduct ? coverDeletedProduct : coverProduct
        strHtml = strHtml + `
        <div class="productItem">
            <span class="productIndex rounded-circle">${index + 1}</span>
            <div class="productIdName">
            <i class="fa fa-user"></i>
            <a href="#" onclick="openTabProduct('${product.id}'); return false;">${product.id}</a>
            <span class="productName"> ${product.name}</span> <img style="cursor:pointer" onclick="updateCover('${product.id}')" src="img/refresh-cover.png" />
            </div>
            <div class="productCover">
                ${($('#cbHideProductCover').is(':checked') ? '' : `<img id="cover-product-${product.id}" src="${_cover}">`)}
            </div>
            <div class="productInfo">
                <i class="fa fa-money"></i><span class="productPrice">${product.price / 100}<label class="productUnitPrice"> RM</label></span>
                <i class="fa fa-bolt"></i><span class="productStatus${'-' + globalConfiguration.statuses[_status] || ''}">${globalConfiguration.statuses[_status] + _onleave}</span>
                <i class="fas fa-map-marked-alt"></i><span class="productRegion">${globalConfiguration.regions[_region]}</span>
                <br />
                <i class="fa fa-phone"></i><span class="productPhone" onclick="copyPhone(this)">${product.phone}</span>
                <i class="fas fa-map-marked-alt"></i><span class="productRegion">${_city}</span>
                <br />
                <i class="fas fa-map-marker-alt"></i><span class="productPlace">${globalDistricts[product.districtId]}</span>
                <i class="fa fa-user-plus"></i><span class="productRatingCount">${product.ratingCount}(${product.ratingCountTotal || 'N'})</span>
                <i class="fa fa-trophy"></i><span class="productRatingScore">${product.ratingScore}</span><br />
                <i class="fa fa-calendar"></i><span class="productDate">${_date}</span>
                <i class="fa fa-user-secret"></i>
                <span class="productAuthor">
                    <a href="#" onclick="openTabAuthor('${_authorName}'); return false;">${_author}</a>
                </span><br />
                <i class="fa fa-dot-circle-o"></i><span class="productV1">${_1v}</span>
                <i class="fa fa-hourglass"></i></i><span class="productV1">${_2v}</span>
                <i class="fa fa-wheelchair"></i><span class="productV3">${_3v}</span>
                <i class="fa fa-child"></i><span>${_t}</span><br />
                <i class="fa fa-heartbeat"></i><span class="productAge">${new Date(_age * 1000).getFullYear()}</span>
                <i class="fa fa-refresh"></i><span style="margin-right: 0!important;">
                <a class="btnUpdateReviews action" href="#" onclick="updateReviews('${product.id}',this); return false;">Update Reviews</a></span><br />
                <i class="far fa-folder-open"></i>
                <span><a class="action" href="#" onclick="openProductFolder('${product.id}'); return false">Open Folder</a></span>
                <i class="fas fa-globe"></i>
                <span><a class="action" href="#" onclick="openWeb('${product.id}'); return false;">Open Web</a></span><br />
                <i class="fa fa-cloud-download-alt" title="Fetch All Reviews"></i><span>
                <a class="btnFetchAllReviews action" href="#" onclick="fetchAllImagesReviews('${product.id}', this); return false;">Fetch All Reviews</a></span>
                <i onclick="deleteProduct('${product.id}', this); return false;" class="fa fa-trash-alt"></i>
                <br />
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
    $('#cbPrivateMode').trigger('change')
}

//////////////////////////////////////// GENERATION FUNCTIONS GROUP ////////////////////////////////////////
function genCities(countryId) {
    let ddlCity = $('#ddlCity')
    Object.keys(cities).forEach(id => {
        ddlCity.append(`<option value="${id}">${cities[id].name}</option>`)
        globalCities[id] = cities[id].name
        let districts = cities[id].districts
        districts.forEach(district => {
            globalDistricts[district.id] = district.name
        })
    })
    log(globalDistricts)
}

function genDistricts(cityId) {
    var districts = cities[cityId].districts
    $('#ddlDisctrict').empty()
    districts.forEach(district => {
        $('#ddlDisctrict').append(`<option value="${district.id}">${district.name}</option>`)
    })
}
function genBackground() {
    //src : http://wallpaperswide.com
    //let bgRandomNumber = Math.floor(Math.random() * 8)
    let time = new Date().getTime().toString()
    let bgRandomNumber = time.substr(time.length - 1, 1);
    log(bgRandomNumber)
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
            'conditionsPhotoCount', 'conditionsMonth', 'conditionsYear', 'conditionsDay',
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
    for (let i = new Date().getFullYear(); i >= 2018; i--) {
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
function genDays() {
    let strHtml = ''
    for (let i = 1; i <= 31; i++)
        strHtml += `<option value="${i}">${i}</option>`
    $('#ddlDay').html(strHtml)
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
    globalConfiguration.chart.groups.forEach(group => ddlGroupBy.append(`<option value="${group.key}">${group.name}</options>`))
}

function genRegions() {
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

function openChartReview(productId, productName) {
    window.chartReview = {
        cfg: {
            title: globalConfiguration.chart.titleByReport + ' ' + productName + '(' + new Date().toLocaleDateString() + ')',
            subTitle: `${globalConfiguration.chart.subTitle}`,
            titleX: globalConfiguration.chart.titleX,
            titleY: globalConfiguration.chart.titleY
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
            title: globalConfiguration.chart.title + ddlGroupBy.text().toUpperCase() + '(' + new Date().toLocaleDateString() + ')',
            subTitle: `${globalConfiguration.chart.subTitle} query: ${getQueryConditions().toString()}`,
            titleX: ddlGroupBy.text(),
            titleY: globalConfiguration.chart.titleY
        }
    }
    if (type === 'author') {
        window.chart.data = _u.chain(products)
            .groupBy(function (product) { return product.author.displayName })
            .map((value, key) => {
                return { name: key, y: value.length }
            })
            .value()
        window.chart.cfg.titleX = `${window.chart.data.length} ${ddlGroupBy.text().toUpperCase()}`
    }
    else if (type === 'region') {
        window.chart.data = _u.chain(products)
            .groupBy(function (product) { return product.attributes["68"] })
            .map((value, key) => {
                return { name: globalConfiguration.regions[key], y: value.length }
            })
            .value()
        window.chart.cfg.titleX = `${window.chart.data.length} ${ddlGroupBy.text().toUpperCase()}`
    }
    else if (type === '1v') {
        window.chart.data = _u.chain(products)
            .groupBy(function (product) { return product.attributes["49"] })
            .map((value, key) => {
                return { name: key, y: value.length }
            })
            .value()
        window.chart.cfg.titleX = `${window.chart.data.length} ${ddlGroupBy.text().toUpperCase()} (${globalConfiguration.chart.units.number})`
    }
    else if (type === '2v') {
        window.chart.data = _u.chain(products)
            .groupBy(function (product) { return product.attributes["50"] })
            .map((value, key) => {
                return { name: key, y: value.length }
            })
            .value()
        window.chart.cfg.titleX = `${window.chart.data.length} ${ddlGroupBy.text().toUpperCase()} (${globalConfiguration.chart.units.number})`
    }
    else if (type === '3v') {
        window.chart.data = _u.chain(products)
            .groupBy(function (product) { return product.attributes["51"] })
            .map((value, key) => {
                return { name: key, y: value.length }
            })
            .value()
        window.chart.cfg.titleX = `${window.chart.data.length} ${ddlGroupBy.text().toUpperCase()} (${globalConfiguration.chart.units.number})`
    }
    else if (type === 'w') {
        window.chart.data = _u.chain(products)
            .groupBy(function (product) { return product.attributes["48"] })
            .map((value, key) => {
                return { name: key, y: value.length }
            })
            .value()
        window.chart.cfg.titleX = `${window.chart.data.length} ${ddlGroupBy.text().toUpperCase()} (${globalConfiguration.chart.units.w})`
    }
    else if (type === 'h') {
        window.chart.data = _u.chain(products)
            .groupBy(function (product) { return product.attributes["46"] })
            .map((value, key) => {
                return { name: key, y: value.length }
            })
            .value()
        window.chart.cfg.titleX = `${window.chart.data.length} ${ddlGroupBy.text().toUpperCase()} (${globalConfiguration.chart.units.number})`
    }
    else if (type === 'age') {
        window.chart.data = _u.chain(products)
            .groupBy(function (product) { return product.attributes["42"] })
            .map((value, key) => {
                return { name: new Date().getFullYear() - new Date(key * 1000).getFullYear() + `(${new Date(key * 1000).getFullYear()})`, y: value.length }
            })
            .value()
        window.chart.cfg.titleX = `${window.chart.data.length} ${ddlGroupBy.text().toUpperCase()} (${globalConfiguration.chart.units.age})`
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
                    return { name: price >= 1000 ? price / 1000 + globalConfiguration.chart.units.price[1] : price + globalConfiguration.chart.units.price[0], y: group.products.length }
                }).value()
                break;
            case "districtId":
                window.chart.data = groups.map(group => {
                    let districtName = globalDistricts[group.districtId] || 'districtId=' + group.districtId
                    return { name: districtName, y: group.products.length }
                }).value()
                break;
            case "cityId":
                window.chart.data = groups.map(group => {
                    let cityName = globalCities[group.cityId] || 'cityId=' + group.cityId
                    return { name: cityName, y: group.products.length }
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
    window.chart.data = sortYChart(window.chart.data)
    log(window.chart)
    window.open('chart.html', 'Chart', 'width=' + 1360 + ',height=' + 1000 + ',toolbars=no,scrollbars=no,status=no,resizable=no');
}
function sortYChart(array, order) {
    return _u.orderBy(array, ['y'], [order ? 'asc' : order]).reverse()
}
function copyPhone(e) {
    $(e).select()
    document.execCommand("copy");
}





