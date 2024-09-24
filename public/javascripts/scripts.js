;(() => {
	const $$ = (el) => document.querySelectorAll(el)

	for (const alert of $$('.alert')) {
		setTimeout(() => {
			alert.remove()
		}, 5000)
	}

	const tabButtons = Array.from($$('.tab .tab-btn'))
	const tabContentItems = Array.from($$('.tab-content .tab-content-item'))

	const href = window.location.href
	const type = new URLSearchParams(href.split('?')[1]).get('type')

	const button = tabButtons.find((btn) => btn.dataset.tab === type)
	if (button) {
		button.classList.add('active')
	} else {
		tabButtons[0]?.classList.add('active')
	}

	const contentItem = tabContentItems.find((item) => item.id === type)
	if (contentItem) {
		contentItem.classList.add('active')
	} else {
		tabContentItems[0]?.classList.add('active')
	}
})()
