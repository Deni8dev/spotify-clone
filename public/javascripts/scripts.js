(function () {

  const $ = (el) => document.querySelector(el);

  // $('#queryInput').addEventListener('keyup', (event) => {
  //
  //   const searchParams = new URLSearchParams(window.location.query);
  //   const { value } = event.target;
  //   searchParams.set('query', value);
  //
  //   if (window.history.replaceState) {
  //     const params = searchParams.toString();
  //     const { protocol, host, pathname } = window.location;
  //     const url = `${protocol}//${host}${pathname}?${params}`;
  //
  //     window.history.replaceState({ path: url }, '', url)
  //   }
  // });

})();
