// Create the chart
function drawChart(data, title, subTitle, titleX, titleY) {
    Highcharts.chart('container', {
        chart: {
            type: 'column',
            //width:1700
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
                // [
                //     {
                //         name: "550K",
                //         y: 100,
                //     },
                //     {
                //         name: "Firefox",
                //         y: 10.57,
                //     },
                //     {
                //         name: "Internet Explorer",
                //         y: 7.23,
                //     },
                //     {
                //         name: "Safari",
                //         y: 5.58,
                //     },
                //     {
                //         name: "Edge",
                //         y: 4.02,
                //     },
                //     {
                //         name: "Opera",
                //         y: 1.92,
                //     },
                //     {
                //         name: "Other",
                //         y: 7.62,
                //     }
                // ]
            }
        ]
    })
}
let chart = opener.window['chart'],
    data = chart.data,
    cfg = chart.cfg
drawChart(
    data,
    cfg.title,
    cfg.subTitle,
    cfg.titleX,
    cfg.titleY
)
