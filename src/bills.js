'use strict';

const scan = require('./scan');
const pricing = require('./pricing');

function currentMonthAllRegions () {
  return pricing.fetch()
    .then(fetchInstancesWithPrice);
}

function fetchInstancesWithPrice (price) {
  return scan
    .fetchInstancesForAllRegions()
    .then(populateInstancesPrice.bind(null, price));
}

function populateInstancesPrice(instancePricing, instances) {
  return instances.map(instance => {
    const price = instancePricing.getInstancePrice(
      instance.region,
      instance.InstanceType
    );
    instance.price = {
      month: price.monthly(),
      day: price.daily(),
      hour: price.hourly(),
    };

    return instance;
  });
}


module.exports = {
  currentMonthAllRegions: currentMonthAllRegions,
};
