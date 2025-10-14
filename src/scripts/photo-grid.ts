import GLightbox from 'glightbox';

const GAP = 16; // gap in pixels

// Store user preference for mobile column count
let userMobileColumnPreference: number | null = null;

export async function setupGallery() {
	if (typeof document === 'undefined') return;

	const container = document.getElementById('photo-grid');
	if (!container) {
		console.error('Photo grid container not found.');
		return;
	}

	const imageLinks = Array.from(container.querySelectorAll('.photo-item')) as HTMLElement[];

	if (imageLinks.length === 0) {
		console.warn('No images found inside the photo grid.');
		return;
	}

	// Wait for all images to load
	await waitForImagesToLoad(container);

	// Get column count from data attribute (max columns)
	const maxColumns = parseInt(container.getAttribute('data-columns') || '4');

	// Apply masonry layout
	applyMasonryLayout(container, imageLinks, maxColumns);

	// Setup column toggle buttons (mobile only)
	setupColumnToggle(container, imageLinks, maxColumns);

	// Initialize GLightbox
	GLightbox({
		selector: '.glightbox',
		openEffect: 'zoom',
		closeEffect: 'fade',
		closeOnOutsideClick: true,
	});
}

function setupColumnToggle(container: HTMLElement, imageLinks: HTMLElement[], maxColumns: number) {
	const col1Btn = document.getElementById('col-1-btn');
	const col2Btn = document.getElementById('col-2-btn');

	if (!col1Btn || !col2Btn) return;

	// Load saved preference from localStorage
	const savedPreference = localStorage.getItem('mobile-column-preference');
	if (savedPreference) {
		userMobileColumnPreference = parseInt(savedPreference);
		updateActiveButton(userMobileColumnPreference === 1 ? col1Btn : col2Btn);
	}

	col1Btn.addEventListener('click', () => {
		userMobileColumnPreference = 1;
		localStorage.setItem('mobile-column-preference', '1');
		updateActiveButton(col1Btn);
		applyMasonryLayout(container, imageLinks, maxColumns);
	});

	col2Btn.addEventListener('click', () => {
		userMobileColumnPreference = 2;
		localStorage.setItem('mobile-column-preference', '2');
		updateActiveButton(col2Btn);
		applyMasonryLayout(container, imageLinks, maxColumns);
	});
}

function updateActiveButton(activeBtn: HTMLElement) {
	document.querySelectorAll('.column-toggle-btn').forEach(btn => {
		btn.classList.remove('active');
	});
	activeBtn.classList.add('active');
}

function applyMasonryLayout(container: HTMLElement, imageLinks: HTMLElement[], maxColumns: number) {
	const containerWidth = container.clientWidth;

	// Responsive column count based on screen width
	let columnCount = maxColumns;
	if (containerWidth < 640) {
		// Use user preference on mobile, default to 1 for better initial loading
		columnCount = userMobileColumnPreference !== null ? userMobileColumnPreference : 1;
	} else if (containerWidth < 768) {
		columnCount = 2; // tablet
	} else if (containerWidth < 1024) {
		columnCount = Math.min(3, maxColumns); // small desktop
	}

	const columnWidth = (containerWidth - GAP * (columnCount - 1)) / columnCount;
	const columnHeights = new Array(columnCount).fill(0);

	imageLinks.forEach((el, index) => {
		const img = el.querySelector('img') as HTMLImageElement;
		if (!img) return;

		// Place images left to right, then down (maintains gallery.yaml order)
		const columnIndex = index % columnCount;

		// Calculate image height based on aspect ratio
		const aspectRatio = img.naturalHeight / img.naturalWidth;
		const imageHeight = columnWidth * aspectRatio;

		// Position the element
		el.style.position = 'absolute';
		el.style.left = `${columnIndex * (columnWidth + GAP)}px`;
		el.style.top = `${columnHeights[columnIndex]}px`;
		el.style.width = `${columnWidth}px`;
		el.style.height = `${imageHeight}px`;

		// Update column height
		columnHeights[columnIndex] += imageHeight + GAP;
	});

	// Set container height to tallest column
	container.style.position = 'relative';
	container.style.height = `${Math.max(...columnHeights)}px`;
}

async function waitForImagesToLoad(container: HTMLElement) {
	const imageElements = Array.from(container.querySelectorAll('img')) as HTMLImageElement[];

	await Promise.all(
		imageElements.map(
			(img) =>
				new Promise((resolve) => {
					if (img.complete) {
						resolve(null);
					} else {
						img.onload = () => resolve(null);
						img.onerror = () => resolve(null);
					}
				}),
		),
	);
	return imageElements;
}
// Run setupGallery once the page is loaded
if (typeof window !== 'undefined') {
	const debouncedSetup = debounce(setupGallery, 250);

	document.addEventListener('DOMContentLoaded', setupGallery);
	window.addEventListener('resize', debouncedSetup);
}

// Debounce helper
function debounce<T extends (...args: unknown[]) => unknown>(func: T, wait: number) {
	let timeout: ReturnType<typeof setTimeout>;
	return function executedFunction(...args: Parameters<T>) {
		const later = () => {
			clearTimeout(timeout);
			func(...args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
}
