# Datamnom

tl;dr: Generic data ingestion for [Elasticsearch](https://www.elastic.co/products/elasticsearch) to be visualized by [Kibana](https://www.elastic.co/products/kibana).

Originally created for a local [Hack for Change event](https://medium.com/zumba-tech/zumbatech-takes-on-hackforchange-f8e8ebdc14d7#.2vfjxtk03), this project aims to get quick visualizations via Kibana that look like this:

![](docs/dashboard.png)

> Dashboard above produced in Kibana from an import of [Florida Vendor data](https://github.com/cjsaylor/datamnom/wiki/Florida-Vendor-Data) from 2014 that was open sourced by FL state government.

## Why this method, why not make an API

Elasticsearch serves as both a generic search tool, but it also functions as an API through
Elasticsearch's rest interface while simultaneously supplying an aggregation and visualization framework
through Kibana (among other tools).

## Requirements

* NodeJS `10+`

## Install

* `docker-compose up -d`
* `npm install`

## Usage

1. `docker-compose up -d` (if you don't already have elasticsearch running locally)
2. Create a configuration file (see [examples](examples/)).
3. Run `node bin/datamnom.js --config=/path/to/config/from/step/1 --files=/glob/path/to/files`
4. Open http://localhost:5601 to see your data imported
