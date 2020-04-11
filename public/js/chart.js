Highcharts.theme = {
    // colors: ['#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572',   
    //          '#FF9655', '#FFF263', '#6AF9C4'],
    chart: {
        // backgroundColor: {
        //     linearGradient: [0, 0, 500, 500],
        //     stops: [
        //         [0, 'rgb(255, 255, 255)'],
        //         [1, 'rgb(240, 240, 255)']
        //     ]
        // },
    },
    title: {
        style: {
            color: '#000',
            font: 'bold 16px "Tahoma", Verdana, sans-serif'
        }
    },
    subtitle: {
        style: {
            color: '#666666',
            font: 'bold 12px "Trebuchet MS", Verdana, sans-serif'
        }
    },
    // legend: {
    //     itemStyle: {
    //         font: '9pt Trebuchet MS, Verdana, sans-serif',
    //         color: 'black'
    //     },
    //     itemHoverStyle:{
    //         color: 'gray'
    //     }   
    // }
};
// Apply the theme
Highcharts.setOptions(Highcharts.theme);
let chart = opener.window.chart,
    data = chart.data,
    cfg = chart.cfg,
    Chart = Highcharts.chart('container', {
        chart: {
            type: 'column',
        },
        title: {
            text: cfg.title,
        },
        subtitle: {
            text: cfg.subTitle
        },
        accessibility: {
            announceNewData: {
                enabled: true
            }
        },
        xAxis: {
            type: 'category',
            title: {
                text: cfg.titleX
            }
        },
        yAxis: {
            title: {
                text: cfg.titleY
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
                    format: '{point.percent:.1f} %<br/>{point.y}'
                }
            }
        },
        // tooltip: {
        //     headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
        //     pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.percent:.1f} %</b> of total<br/>'
        // },
        tootip:false,
        series: [
            {
                name: 'Chart Statistic',
                colorByPoint: true,
                data: data
            }
        ]
    })
