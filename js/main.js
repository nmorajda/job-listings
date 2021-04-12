'use strict';
import data from './data.js';

const _STORAGE_NAME = 'jobListing';

const initialSettings = {
  filters: [],
  offers: data,
};

const state = JSON.parse(localStorage.getItem(_STORAGE_NAME)) || {
  ...initialSettings,
};

// CRUD FILTERS functions
const addFilter = filter => {
  if (!state.filters.some(item => item.name === filter.name)) {
    state.filters.push(filter);
  }
};

// remove filter
const removeFilter = filter => {
  state.filters = state.filters.filter(item => item.name !== filter.name);
};

// remove all filters
const removeFilters = () => {
  state.filters = [];
};

// apply filters to offers
const filterOffers = () => {
  const offers = initialSettings.offers.filter(offer => {
    for (let i = 0; i < state.filters.length; i++) {
      const filterValue = state.filters[i].name;
      const offerValue = offer[state.filters[i].property];

      if (Array.isArray(offerValue)) {
        if (!offerValue.includes(filterValue)) {
          return false;
        }
      } else if (filterValue !== offerValue) {
        return false;
      }
    }

    return true;
  });

  return offers;
};

// RENDER functions
// render filters
const renderFilters = filters => {
  return filters
    .map(filter => {
      return `<a href="#" class="btn btn--filter" data-action="removeFilter" data-filter-property="${filter.property}" data-filter="${filter.name}">${filter.name}</a>`;
    })
    .join('');
};

// render offer
const renderOfferCard = ({
  id,
  company,
  logo,
  new: newOffer, // change property name because new is keyword
  featured,
  position,
  role,
  level,
  postedAt,
  contract,
  location,
  languages,
  tools,
} = data) => {
  return `
    <div class="card">
      <div class="offer">
        <div class="offer__description-wrapper">
          <div class="offer__logo">
            <img src="${logo}" alt="Logo ${company}">
          </div>
          <div class="offer__info">
            <div class="offer__meta">
              <span class="offer__firm-name">${company}</span>
              ${
                newOffer ? `<span class="badge badge--primary">NEW!</span>` : ''
              }
              ${
                featured
                  ? '<span class="badge badge--dark">FEATURED</span>'
                  : ''
              }
            </div>
            <div class="offer__title">
              ${position}
            </div>
            <div class="offer__note">
              <span class="offer__date">${postedAt}</span>
              <span class="offer__fulltime">${contract}</span>
              <span class="offer__region">${location}</span>
            </div>
          </div>
        </div>
        <div class="offer__tags">
          <a href="#" class="btn btn--tag" data-action="addFilter" data-filter-property="role" data-filter="${role}">${role}</a>
          <a href="#" class="btn btn--tag" data-action="addFilter" data-filter-property="level" data-filter="${level}">${level}</a>
          ${languages
            .map(lang => {
              return `<a href="#" class="btn btn--tag" data-action="addFilter" data-filter-property="languages" data-filter="${lang}">${lang}</a>`;
            })
            .join('')}
          ${tools
            .map(tool => {
              return `<a href="#" class="btn btn--tag" data-action="addFilter" data-filter-property="tools" data-filter="${tool}">${tool}</a>`;
            })
            .join('')}
        </div>
      </div>
    </div>
  `;
};

window.addEventListener('DOMContentLoaded', () => {
  const filters = document.querySelector('#filters');
  const filtersButtons = filters.querySelector('.filters__buttons');
  const offersContainer = document.querySelector('#offers .container');

  const updateStorageAndRender = () => {
    state.offers = !state.filters.length
      ? (state.offers = [...initialSettings.offers])
      : filterOffers();

    localStorage.setItem(_STORAGE_NAME, JSON.stringify(state));
    render();
  };

  const render = () => {
    // clear containers
    filtersButtons.innerHTML = '';
    offersContainer.innerHTML = '';

    // render filters
    if (state.filters.length === 0) {
      filters.classList.remove('active');
    } else {
      filters.classList.add('active');

      filtersButtons.insertAdjacentHTML(
        'beforeend',
        renderFilters(state.filters)
      );
    }

    // render offers
    state.offers.map(offer => {
      const offerCard = renderOfferCard(offer);
      offersContainer.insertAdjacentHTML('beforeend', offerCard);
    });
  };

  // Events
  document.addEventListener('click', e => {
    if (!e.target.hasAttribute('data-action')) return;

    e.preventDefault();

    if (e.target.getAttribute('data-action') === 'removeFilters') {
      removeFilters();
      updateStorageAndRender();
    }

    if (e.target.getAttribute('data-action') === 'addFilter') {
      addFilter({
        property: e.target.dataset.filterProperty,
        name: e.target.dataset.filter,
      });
      updateStorageAndRender();
    }

    if (e.target.getAttribute('data-action') === 'removeFilter') {
      removeFilter({
        name: e.target.dataset.filter,
      });
      updateStorageAndRender();
    }
  });

  updateStorageAndRender();
});
