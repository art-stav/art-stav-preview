(function () {
  var q = new URLSearchParams(location.search);
  function f(t, n, c) { return (t || '').replace('{n}', n).replace('{c}', c); }
  document.querySelectorAll('.dc-picker').forEach(function (box) {
    var d = box.dataset, ds = box.dataset.mode === 'ds259';
    var span = box.querySelector('.dc-order span'), desc = box.querySelector('.dc-desc'), select = box.querySelector('.dc-select');
    var add = box.querySelector('.dc-add input'), ask = document.querySelector('.dc-ask'), sws = box.querySelectorAll('.dc-sw');
    var cur = null;
    function render() {
      var text, info = '';
      if (!cur || cur.dataset.code === 'white') {
        text = ds ? d.oW : d.oPc0;
        info = cur ? d.dw : '';
      } else {
        var n = cur.dataset.name, c = cur.dataset.code, three = cur.dataset.bags === '3';
        if (ds) {
          info = f(three ? d.d3 : d.d1, n, c);
          text = add && !add.checked ? f(d.oNp, n, c) : f(three ? d.oP3 : d.oP1, n, c);
        } else {
          info = f(three ? d.p3 : d.p1, n, c);
          text = f(three ? d.oPc3 : d.oPc1, n, c);
        }
      }
      desc.textContent = info; desc.hidden = !info;
      if (add) add.closest('label').hidden = !cur || cur.dataset.code === 'white';
      span.textContent = text;
      if (ask) ask.href = ask.dataset.base + '?zakaz=' + encodeURIComponent(text);
    }
    function choose(code) {
      cur = null;
      sws.forEach(function (x) { var on = x.dataset.code === code; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); if (on) cur = x; });
      select.value = cur ? code : '';
      render();
    }
    sws.forEach(function (x) { x.addEventListener('click', function () { choose(x.dataset.code); }); });
    select.addEventListener('change', function () { choose(select.value); });
    if (add) add.addEventListener('change', render);
    choose(q.get('ottenok') || '');
  });
  var target = q.get('for') === 'powderc' ? '../durostick-durocolor-powder-c/' : '../durostick-ds-259/';
  document.querySelectorAll('a.dc-cell').forEach(function (a) {
    if (q.get('for') === 'powderc' && a.dataset.code === 'white') { a.removeAttribute('href'); a.style.cursor = 'default'; return; }
    a.href = target + '?ottenok=' + encodeURIComponent(a.dataset.code);
  });
})();
