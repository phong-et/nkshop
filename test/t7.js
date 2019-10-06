// TEST PREVENT CRAWLING CLOUDFIRE - only apply when nk page on PREVENT CRAWLING mode
let rp = require('request-promise'),
  request = require('request'),
  cheerio = require('cheerio'),
  cfg = require('../nk.cfg.js'),
  log = console.log,
  headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36',
  }
function fetchProductsSGByPriceDescOnePage(pageNumber, callback, jar) {
    let offset = pageNumber == 1 ? 0 : pageNumber * 20
    log(`offset = ${offset} || pageNumber = ${pageNumber}`);
    var options = {
      url: cfg.productUrl + '?cityCode=' + cfg.cities[0] + '&mode=directory&offset=' + offset + '&orderBy=byPriceDesc',
      headers: headers,
    }
    if(jar) options['jar'] = jar
    request(options, function (error, response, body) {
      //log('error:', error);
      log('statusCode:', response && response.statusCode);
      log('headers:', response && response.headers);
      //console.log('body:', body);
      //writeProduct('fetchProductsSGByPriceDescOnePage' + new Date().getTime(), body)
      if (response && response.statusCode === 503) {
        requestChkJschl(body, response.headers['set-cookie'], pageNumber)
      }
      else {
        log(body)
        callback(body);
      }
    })
  }
//http://prntscr.com/ohw6xv
function getJschlAnswer(jsContent) {
    var jschl_answer;
    try {
      jsContent = jsContent.substring(jsContent.indexOf('var s,t,o,p,b,r,e,a,k,i,n,g,f'), jsContent.indexOf('f.action += location.hash;'));
      jsContent = jsContent.replace(/t = document/g, 't = \'' + cfg.nkDomain + '\'  //')
      jsContent = jsContent.replace(/t.innerHTML/g, '//t.innerHTML')
      jsContent = jsContent.replace(/t = t.firstChild.href/g, '//t = t.firstChild.href')
      jsContent = jsContent.replace(/t = t.substr/g, '//t = t.substr')
      jsContent = jsContent.replace(/a = document.getElementById/g, 'a = {value:0}  //')
      jsContent = jsContent.replace(/f = document.getElementById/g, '//f = document.getElementById')
      jsContent += 'exports.jschl_answer = a.value'
      //log(jsContent)
      var _eval = require('eval')
      jschl_answer = _eval(jsContent);
      log('jschl_answer=%s', jschl_answer.jschl_answer)
    } catch (error) {
      log(error)
    }
    return jschl_answer
  }
  async function requestChkJschl(body, arrCookie, pageNumber) {
    try {
      const $ = cheerio.load(body);
      let form = {
        s: encodeURIComponent($('input[name=s]').val()),
        jschl_vc: encodeURIComponent($('input[name=jschl_vc]').val()),
        pass: encodeURIComponent($('input[name=pass]').val()),
        jschl_answer: getJschlAnswer($('script').eq(0).html()).jschl_answer
      }
      request = request.defaults({ jar: true })
      var jar = request.jar()
      arrCookie.forEach((cookies) => {
        cookies.split(';').forEach((cookie) => {
          jar.setCookie(request.cookie(cookie.trim()), cfg.nkDomain)
        })
      })
      var options = {
        method: 'POST',
        url: cfg.chk_jschlUrl,
        headers: headers,
        qs: form,
        jar: jar
      }
  
      await delay(5000)
      //log(options)
      request(options, function (error, response, body) {
        log(response.headers)
        log(response.statusCode)
        switch (response.statusCode) {
          case 503: break;
          case 302:
            var arrCookies = response.headers['set-cookie'];
            request = request.defaults({ jar: true })
            var jar = request.jar()
            arrCookies.forEach((cookies) => {
              cookies.split(';').forEach((cookie) => {
                jar.setCookie(request.cookie(cookie.trim()), cfg.nkDomain)
              })
            })
            fetchProductsSGByPriceDescOnePage(pageNumber, null, jar)
            break;
        }
      })
      //log(json)
    } catch (error) {
      log('requestChkJschl:')
      log(error.message)
    }
  }
fetchProductsSGByPriceDescOnePage(1)
  
  