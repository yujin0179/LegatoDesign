import GLightbox from 'glightbox';

const GAP = 16; // gap in pixels

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

	// Get column count from data attribute
	const columnCount = parseInt(container.getAttribute('data-columns') || '4');

	// Apply masonry layout
	applyMasonryLayout(container, imageLinks, columnCount);

	// Initialize GLightbox
	GLightbox({
		selector: '.glightbox',
		openEffect: 'zoom',
		closeEffect: 'fade',
		closeOnOutsideClick: true,
	});
}

function applyMasonryLayout(container: HTMLElement, imageLinks: HTMLElement[], columnCount: number) {
	const containerWidth = container.clientWidth;
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
