// format .toJSON() 10
function fetchReviewsByDate(date) {
    request('GET', 'reviews/' + date, {
        success: function (data) {
            document.write(data)
        },
        error: function (error) {
            log(error)
        }
    })
}
function fetchReviewsToday() {
    request('GET', 'reviews/last', {
        success: function (data) {
            document.write(data)
        },
        error: function (error) {
            log(error)
        }
    })
}
$().ready(function () {
    fetchReviewsToday()
    // day
    fetchReviewsByDate(new Date().toJSON().substring(0,10))
    // month
    fetchReviewsByDate(new Date().toJSON().substring(0,7))
    // year
    fetchReviewsByDate(new Date().toJSON().substring(0,4))
})