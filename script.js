const serviceButtons = document.querySelectorAll('.service-btn');
const selectedCount = document.getElementById('selected-count');
const bookButton = document.getElementById('book-btn');
const aboutUsButton = document.getElementById('aboutus-btn');


const updateSelectionUI = () => {
	const selectedServices = [...serviceButtons].filter((button) =>
		button.classList.contains('active')
	);
	const count = selectedServices.length;
	const label = count === 1 ? 'service' : 'services';

	selectedCount.textContent = `${count} selected`;
	bookButton.textContent = count > 0 ? `Book ${count} ${label}` : 'Book Service';
};

serviceButtons.forEach((button) => {
	button.addEventListener('click', () => {
		button.classList.toggle('active');
		updateSelectionUI();
	});
});

if (aboutUsButton) {
	aboutUsButton.addEventListener('click', () => {
		window.location.href = 'about us.html';
	});
}



updateSelectionUI();
