import GLightbox from 'glightbox';

const COLUMN_COUNT = 4;
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

	// Apply masonry layout
	applyMasonryLayout(container, imageLinks);

	// Initialize GLightbox
	GLightbox({
		selector: '.glightbox',
		openEffect: 'zoom',
		closeEffect: 'fade',
		closeOnOutsideClick: true,
	});
}

function applyMasonryLayout(container: HTMLElement, imageLinks: HTMLElement[]) {
	const containerWidth = container.clientWidth;
	const columnWidth = (containerWidth - GAP * (COLUMN_COUNT - 1)) / COLUMN_COUNT;
	const columnHeights = new Array(COLUMN_COUNT).fill(0);

	imageLinks.forEach((el) => {
		const img = el.querySelector('img') as HTMLImageElement;
		if (!img) return;

		// Find shortest column
		const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));

		// Calculate image height based on aspect ratio
		const aspectRatio = img.naturalHeight / img.naturalWidth;
		const imageHeight = columnWidth * aspectRatio;

		// Position the element
		el.style.position = 'absolute';
		el.style.left = `${shortestColumnIndex * (columnWidth + GAP)}px`;
		el.style.top = `${columnHeights[shortestColumnIndex]}px`;
		el.style.width = `${columnWidth}px`;
		el.style.height = `${imageHeight}px`;

		// Update column height
		columnHeights[shortestColumnIndex] += imageHeight + GAP;
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
