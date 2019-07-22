var arrCookie = [ '__cfduid=d99423fcebd4261ccf262d2b211ee32991563637286; expires=Sun, 19-Jul-20 15:41:26 GMT; path=/; domain=.nkshop.com; HttpOnly; Secure' ]
arrCookie.forEach((cookies) => {
    console.log(cookies)
    cookies.split(';').forEach((cookie) => {
        console.log(cookie)
        jar.setCookie(request.cookie(cookie.trim()), cfg.cookiesUrl)
    })
})