let log = console.log
function getQueryParam(name, queryString) {
    var match = RegExp(name + '=([^&]*)').exec(queryString || location.search);
    return match && decodeURIComponent(match[1]);
}
function fetchReview(productId, callback) {
    $.ajax({
        url: '/products/review/' + productId,
        type: 'GET',
        success: function (data) {
            try {
                callback(data.reviews)
            } catch (e) {
                log(e)
            }
        },
        error: function (err) {
            log(err)
        }
    });
}
function drawChart(data, title, subTitle, titleX, titleY) {
    return Highcharts.chart('container', {
        chart: {
            type: 'column',
        },
        title: {
            text: title
        },
        subtitle: {
            text: subTitle
        },
        accessibility: {
            announceNewData: {
                enabled: true
            }
        },
        xAxis: {
            type: 'category',
            title: {
                text: titleX
            }
        },
        yAxis: {
            title: {
                text: titleY
            }
        },
        legend: {
            enabled: true
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y}'
                }
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
        },
        series: [
            {
                name: "Price",
                colorByPoint: true,
                data: data
            }
        ]
    })
}

$().ready(function () {
    try {
        let productId = getQueryParam('id'),
        Chart
    fetchReview(productId, function (reviews) {
        // let chart = opener.window.chartReview,
        //     cfg = chart.cfg
        reviews.map(review => {
            review.timeStamp = new Date(review.timeStamp).toLocaleDateString()
            return review
        })
        log(reviews)
        Chart = drawChart(
            data,
            cfg.title,
            cfg.subTitle,
            cfg.titleX,
            cfg.titleY
        )
    })
    } catch (error) {
        log(error)
    }
    
    $('#btnResize').click(function () {
        let width = $('#txtWidth').val()
        $('#container').width(width ? width : '100%')
        Chart.reflow();
    });
})