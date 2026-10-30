(function () {
  document.querySelectorAll('.dc-picker').forEach(function (box) {
    var sel = box.querySelector('.dc-sel'), ord = box.querySelector('.dc-order'), span = ord.querySelector('span');
    var ask = document.querySelector('.dc-ask');
    box.querySelectorAll('.dc-sw').forEach(function (b) {
      b.addEventListener('click', function () {
        box.querySelectorAll('.dc-sw').forEach(function (x) { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        sel.textContent = b.dataset.label;
        span.textContent = b.dataset.order; ord.hidden = false;
        if (ask) ask.href = ask.dataset.base + '?zakaz=' + encodeURIComponent(b.dataset.order);
      });
    });
  });
})();
