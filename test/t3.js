var jsContent = `//<![CDATA[
    (function(){
      var a = function() {try{return !!window.addEventListener} catch(e) {return !1} },
      b = function(b, c) {a() ? document.addEventListener("DOMContentLoaded", b, c) : document.attachEvent("onreadystatechange", b)};
      b(function(){
        var a = document.getElementById('cf-content');a.style.display = 'block';
        setTimeout(function(){
          var s,t,o,p,b,r,e,a,k,i,n,g,f, kxJmdCU={"hh":+((!+[]+!![]+!![]+!![]+!![]+!![]+!![]+!![]+[])+(+!![])+(!+[]+!![]+!![]+!![]+!![]+!![]+!![])+(!+[]+!![]+!![]+!![]+!![])+(+[])+(!+[]+!![]+!![]+!![])+(!+[]+!![])+(!+[]+!![]+!![]+!![])+(!+[]+!![]+!![]))/+((!+[]+!![]+!![]+!![]+[])+(!+[]+!![]+!![]+!![]+!![])+(!+[]+!![]+!![]+!![]+!![]+!![])+(!+[]+!![]+!![]+!![]+!![]+!![]+!![])+(!+[]+!![]+!![]+!![]+!![]+!![]+!![])+(!+[]+!![]+!![]+!![])+(!+[]+!![]+!![]+!![]+!![]+!![]+!![]+!![])+(!+[]+!![]+!![]+!![]+!![]+!![]+!![]+!![]+!![])+(!+[]+!![]+!![]+!![]))};
          g = String.fromCharCode;
          o = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
          e = function(s) {
            s += "==".slice(2 - (s.length & 3));
            var bm, r = "", r1, r2, i = 0;
            for (; i < s.length;) {
                bm = o.indexOf(s.charAt(i++)) << 18 | o.indexOf(s.charAt(i++)) << 12
                        | (r1 = o.indexOf(s.charAt(i++))) << 6 | (r2 = o.indexOf(s.charAt(i++)));
                r += r1 === 64 ? g(bm >> 16 & 255)
                        : r2 === 64 ? g(bm >> 16 & 255, bm >> 8 & 255)
                        : g(bm >> 16 & 255, bm >> 8 & 255, bm & 255);
            }
            return r;
          };
          t = document.createElement('div');
          t.innerHTML="<a href='/'>x</a>";
          t = t.firstChild.href;r = t.match(/https?:\/\//)[0];
          t = t.substr(r.length); t = t.substr(0,t.length-1); 
          a = document.getElementById('jschl-answer');
          f = document.getElementById('challenge-form');
          ;kxJmdCU.hh+=+((!+[]+!![]+!![]+!![]+!![]+!![]+!![]+[])+(!+[]+!![]+!![]+!![]+!![]+!![]+!![]+!![]+!![])+(!+[]+!![]+!![]+!![]+!![]+!![]+!![])+(+[])+(+[])+(!+[]+!![]+!![])+(!+[]+!![]+!![]+!![])+(!+[]+!![]+!![])+(!+[]+!![]+!![]+!![]+!![]+!![]+!![]))/+((!+[]+!![]+!![]+!![]+!![]+[])+(!+[]+!![]+!![]+!![]+!![]+!![]+!![])+(!+[]+!![]+!![]+!![]+!![]+!![])+(!+[]+!![]+!![]+!![]+!![])+(!+[]+!![])+(+[])+(!+[]+!![]+!![]+!![]+!![]+!![]+!![])+(+[])+(!+[]+!![]+!![]));kxJmdCU.hh*=+((!+[]+!![]+!![]+!![]+!![]+!![]+!![]+!![]+[])+(!+[]+!![]+!![])+(!+[]+!![]+!![]+!![]+!![]+!![]+!![]+!![])+(+[])+(!+[]+!![]+!![]+!![])+(+!![])+(!+[]+!![]+!![]+!![]+!![]+!![])+(!+[]+!![]+!![]+!![])+(!+[]+!![]+!![]+!![]+!![]+!![]+!![]))/+((!+[]+!![]+[])+(!+[]+!![]+!![]+!![]+!![])+(+[])+(!+[]+!![]+!![]+!![]+!![]+!![]+!![]+!![]+!![])+(!+[]+!![]+!![]+!![]+!![]+!![])+(!+[]+!![]+!![]+!![]+!![]+!![])+(!+[]+!![]+!![])+(!+[]+!![]+!![]+!![]+!![]+!![]+!![])+(!+[]+!![]+!![]));kxJmdCU.hh-=+((!+[]+!![]+!![]+!![]+!![]+!![]+!![]+!![]+[])+(!+[]+!![]+!![]+!![]+!![])+(!+[]+!![]+!![]+!![]+!![]+!![]+!![]+!![])+(!+[]+!![]+!![]+!![]+!![])+(!+[]+!![]+!![]+!![]+!![]+!![]+!![]+!![]+!![])+(!+[]+!![]+!![]+!![]+!![]+!![]+!![]+!![]+!![])+(!+[]+!![]+!![]+!![]+!![])+(+[])+(!+[]+!![]+!![]))/+((!+[]+!![]+!![]+!![]+!![]+!![]+!![]+!![]+[])+(+[])+(!+[]+!![]+!![]+!![]+!![]+!![])+(+!![])+(+!![])+(!+[]+!![]+!![]+!![]+!![])+(!+[]+!![]+!![])+(!+[]+!![]+!![])+(+[]));kxJmdCU.hh*=+((!+[]+!![]+!![]+!![]+!![]+!![]+!![]+!![]+[])+(!+[]+!![]+!![])+(!+[]+!![]+!![]+!![]+!![]+!![]+!![]+!![])+(+[])+(!+[]+!![]+!![]+!![])+(+!![])+(!+[]+!![]+!![]+!![]+!![]+!![])+(!+[]+!![]+!![]+!![])+(+!![]))/+((!+[]+!![]+!![]+!![]+!![]+!![]+!![]+[])+(!+[]+!![]+!![]+!![]+!![]+!![]+!![]+!![])+(!+[]+!![]+!![])+(!+[]+!![]+!![]+!![]+!![]+!![]+!![]+!![]+!![])+(+[])+(!+[]+!![]+!![]+!![]+!![]+!![])+(!+[]+!![]+!![]+!![])+(!+[]+!![]+!![])+(!+[]+!![]+!![]+!![]+!![]+!![]+!![]+!![]));a.value = (+kxJmdCU.hh + t.length).toFixed(10); '; 121'
          f.action += location.hash;
          f.submit();
        }, 4000);
      }, false);
    })();
    //]]>`
    jsContent = jsContent.substring(jsContent.indexOf('var s,t,o,p,b,r,e,a,k,i,n,g,f'),jsContent.indexOf('f.action += location.hash;'));
    console.log(jsContent)