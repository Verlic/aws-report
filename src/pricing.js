'use strict';

const assert = require('assert');
const axios = require('axios');

const AWS_PRICE_JS_URL = 'http://a0.awsstatic.com/pricing/1/ec2/linux-od.min.js';

function fetch () {
  return axios.get(AWS_PRICE_JS_URL)
    .then(response => {
      const payload = transformToJSON(response.data);

      return {
        getInstancePrice: getInstancePrice.bind(null, payload.config.regions),
      }
    });
}

function transformToJSON (data) {
  const payload = data
    .replace(/^(.|[\r\n])*callback\(|\);$/gmi, '')
    .replace(/(\s*?{\s*?|\s*?,\s*?)(['"])?([a-zA-Z0-9]+)(['"])?:/g, '$1"$3":');

  return JSON.parse(payload);
}

function getInstancePrice (pricing, regionName, instanceSize) {
  const regionPricing = pricing.find(p => p.region == regionName);

  if (!regionPricing) {
    throw new Error('No region with the given name ' + regionName);
  }

  const price = findInstancePriceBySize(regionPricing.instanceTypes, instanceSize);

  return {
    daily: () => {
      return price * 24;
    },
    hourly: () => {
      return price;
    },
    toString: () => {
      return price;
    },
    monthly: () => {
      return price * 730.001;
    },
  };
}

function findInstancePriceBySize (instances, size) {
  const instance = instances
    .reduce((acc, entry) => {
      return acc.concat(entry.sizes);
    }, [])
    .find(s => s.size === size);

  if (!instance) {
    throw new Error('No size with the given name ' + size);
  }


  return parseFloat(
    instance
      .valueColumns
      .filter(entry => !!entry['prices'])
      .shift()
      .prices
      .USD
  );
}

module.exports = {
  fetch: fetch,
};
