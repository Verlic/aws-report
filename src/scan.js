'use strict';

const AWS = require('aws-sdk');

function fetchRegions () {
  const ec2 = new AWS.EC2();

  return new Promise((resolve, reject) => {
    ec2.describeRegions({}, (err, data) => {
      if (err) {
        return reject(err);
      }

      return resolve(mapRegions(data.Regions));
    });
  });
}

function mapRegions (regions) {
  return regions.map(region => region.RegionName);
}

function fetchInstancesForAllRegions () {
  return fetchRegions()
    .then(fetchInstancesForEachRegion);
}

function fetchInstancesForEachRegion (regions) {
  return Promise.all(regions.map(region => fetchInstancesByRegion(region)))
    .then(instances => {
      return addRegionToInstances(regions, instances);
    });
}

function fetchInstancesByRegion (region) {
  AWS.config.region = region;
  const ec2 = new AWS.EC2();

  return new Promise((resolve, reject) => {
    ec2.describeInstances({ MaxResults: 500 }, (err, data) => {
      if (err) {
        return reject(err);
      }

      return resolve(mapInstances(data));
    });
  });
}

function mapInstances (instances) {
  return instances
    .Reservations
    .filter(instance => !!instance.Instances)
    .map(instance => instance.Instances)
    .reduce((acc, instances) => {
      return acc.concat(instances);
    }, []);
}

function addRegionToInstances (regions, instances) {
  return instances.reduce((acc, regionInstance, index) => {
    return acc.concat(
      regionInstance.map(instance => {
        return Object.assign(instance, { region: regions[index] });
      })
    );
  }, []);
}

function filterInstancesByTagKey (instances, key) {
  return instances.filter(instance => instance.Tags.find(entry => entry.Key === key));
}

function filterInstancesByTag (instances, key, value) {
  return instances.filter(instance => {
    return instances.Tags.find(entry => entry.Key === key && entry.Value === value);
  });
}

module.exports = {
  fetchRegions: fetchRegions,
  fetchInstancesByRegion: fetchInstancesByRegion,
  fetchInstancesForAllRegions: fetchInstancesForAllRegions,
  fetchInstancesForEachRegion: fetchInstancesForEachRegion,
  filterInstancesByTag: filterInstancesByTag,
  filterInstancesByTagKey: filterInstancesByTagKey,
};
