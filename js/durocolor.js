(function () {
  var q = new URLSearchParams(location.search);
  // карточка: квадратики + список + строка заявки
  document.querySelectorAll('.dc-picker').forEach(function (box) {
    var span = box.querySelector('.dc-order span'), select = box.querySelector('.dc-select');
    var ask = document.querySelector('.dc-ask'), sws = box.querySelectorAll('.dc-sw');
    function setOrder(text) { span.textContent = text; if (ask) ask.href = ask.dataset.base + '?zakaz=' + encodeURIComponent(text); }
    function choose(code) {
      var b = null;
      sws.forEach(function (x) { var on = x.dataset.code === code; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); if (on) b = x; });
      select.value = b ? code : '';
      setOrder(b ? b.dataset.order : box.dataset.default);
    }
    sws.forEach(function (x) { x.addEventListener('click', function () { choose(x.dataset.code); }); });
    select.addEventListener('change', function () { choose(select.value); });
    choose(q.get('ottenok') || '');
  });
  // карта цветов: клик ведёт в нужную карточку с выбранным оттенком
  var target = q.get('for') === 'powderc' ? '../durostick-durocolor-powder-c/' : '../durostick-ds-259/';
  document.querySelectorAll('a.dc-cell').forEach(function (a) {
    if (q.get('for') === 'powderc' && a.dataset.code === 'white') { a.removeAttribute('href'); a.style.cursor = 'default'; return; }
    a.href = target + '?ottenok=' + encodeURIComponent(a.dataset.code);
  });
})();
