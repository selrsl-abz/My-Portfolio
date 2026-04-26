const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('#siteNav');
const chips = document.querySelectorAll('.chip');
const cards = document.querySelectorAll('.card');
const sections = document.querySelectorAll('.portfolio-section');
const year = document.querySelector('#year');
const modal = document.querySelector('#previewModal');
const previewContent = document.querySelector('#previewContent');
const closePreview = document.querySelector('#closePreview');
let activeGallery = [];
let activeGalleryIndex = 0;
let activePreviewType = 'image';

const renderPreview = () => {
  if (!previewContent || !activeGallery.length) {
    return;
  }

  const currentSrc = activeGallery[activeGalleryIndex];

  if (activePreviewType === 'video') {
    previewContent.innerHTML = `<video controls autoplay muted loop><source src="${currentSrc}" type="video/mp4">Your browser does not support video.</video>`;
    return;
  }

  if (activeGallery.length > 1) {
    previewContent.innerHTML = `
      <div class="preview-gallery-wrap">
        <button class="preview-nav prev" type="button" aria-label="Previous image">&#10094;</button>
        <img src="${currentSrc}" alt="Portfolio preview">
        <button class="preview-nav next" type="button" aria-label="Next image">&#10095;</button>
      </div>
    `;

    const prevButton = previewContent.querySelector('.preview-nav.prev');
    const nextButton = previewContent.querySelector('.preview-nav.next');

    if (prevButton) {
      prevButton.addEventListener('click', (event) => {
        event.stopPropagation();
        activeGalleryIndex = (activeGalleryIndex - 1 + activeGallery.length) % activeGallery.length;
        renderPreview();
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', (event) => {
        event.stopPropagation();
        activeGalleryIndex = (activeGalleryIndex + 1) % activeGallery.length;
        renderPreview();
      });
    }

    return;
  }

  previewContent.innerHTML = `<img src="${currentSrc}" alt="Portfolio preview">`;
};

if (year) {
  year.textContent = new Date().getFullYear();
}

if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const applyFilter = (filter) => {
  cards.forEach((card) => {
    const category = card.dataset.category;
    const visible = filter === 'all' || category === filter;
    card.classList.toggle('hidden-by-filter', !visible);
  });

  sections.forEach((section) => {
    const visibleCards = section.querySelectorAll('.card:not(.hidden-by-filter)');
    section.style.display = visibleCards.length > 0 ? 'block' : 'none';
  });
};

chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    const filter = chip.dataset.filter;

    chips.forEach((item) => item.classList.remove('active'));
    chip.classList.add('active');
    applyFilter(filter);
  });
});

applyFilter('all');

const slideshowCards = document.querySelectorAll('.card[data-images]');

slideshowCards.forEach((card) => {
  const images = (card.dataset.images || '')
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);
  const preview = card.querySelector('.thumb-slide');

  if (!preview || images.length < 2) {
    return;
  }

  let index = 0;

  window.setInterval(() => {
    index = (index + 1) % images.length;
    const current = images[index];
    preview.src = current;
    card.dataset.src = current;
  }, 1200);
});

cards.forEach((card) => {
  card.addEventListener('click', () => {
    const src = card.dataset.src;
    const type = card.dataset.type;
    const galleryItems = (card.dataset.images || '')
      .split('|')
      .map((item) => item.trim())
      .filter(Boolean);

    if (!src || !modal || !previewContent) {
      return;
    }

    activePreviewType = type || 'image';
    activeGallery = galleryItems.length ? galleryItems : [src];
    activeGalleryIndex = activeGallery.findIndex(
      (item) => decodeURIComponent(item) === decodeURIComponent(src)
    );

    if (activeGalleryIndex < 0) {
      activeGalleryIndex = 0;
    }

    renderPreview();

    modal.showModal();
  });
});

if (closePreview && modal) {
  closePreview.addEventListener('click', () => {
    modal.close();
    previewContent.innerHTML = '';
  });

  modal.addEventListener('click', (event) => {
    const bounds = modal.getBoundingClientRect();
    const isInDialog =
      event.clientX >= bounds.left &&
      event.clientX <= bounds.right &&
      event.clientY >= bounds.top &&
      event.clientY <= bounds.bottom;

    if (!isInDialog) {
      modal.close();
      previewContent.innerHTML = '';
    }
  });
}

const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

revealElements.forEach((element, index) => {
  element.style.transitionDelay = `${index * 80}ms`;
  revealObserver.observe(element);
});
