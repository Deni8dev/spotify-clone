(function () {

  // const $ = (el) => document.querySelector(el);
  const $$ = (el) => document.querySelectorAll(el);

  $$('.alert').forEach((popup) => {
    setTimeout(() => {
      popup.remove();
    }, 5000);
  });

  const tabButtons = Array.from($$('.tab .tab-btn'));
  const tabContentItems = Array.from($$('.tab-content .tab-content-item'));

  tabButtons.forEach((tabBtn) => tabBtn.addEventListener('click', openTab));

  function openTab(event) {

    const { target: tabBtn } = event;
    const { dataset } = tabBtn;

    console.log('Opening tab', dataset.tab);

    tabButtons.forEach((btn) => btn.classList.remove('active'));
    tabBtn.classList.add('active');

    tabContentItems.forEach((item) => item.classList.remove('active'));
    tabContentItems
      .find((child) => child.id === dataset.tab)
      .classList
      .add('active');
  }

})();
