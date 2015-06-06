# Datamnom

Generic data ingestion for Elasticsearch to be visualized by Kibana.

## Requirements

* VirtualBox `4.3+`
* Vagrant `1.7.2+`
	* `vagrant plugin install vagrant-triggers`
	* `vagrant plugin install vagrant-omnibus`
* NodeJS `0.12.*`


## install

* `gem install librarian-chef`
* `librarian-chef install`
* `vagrant up` (Get errors?  Check min requirements for Vagrant above including installing plugins)
* `npm install`

## use

* Access locally: http://datamnom.dev:5601/
* Copy files into `inbound/` folder and run `node bin/datamnom.js` for flat TXT file import.
* See [the wiki](../../wiki) for specific use-cases

In order to return JSON of your query, access: `http://datamnom.dev:9200/_search?<YOUR_QUERY>`

# Troubleshooting Install

__Unknown configuration section 'omnibus'__
* `vagrant plugin install vagrant-omnibus`

__Unknown configuration section 'trigger'__
* `vagrant plugin install vagrant-triggers`

__`http://datamnom.dev:5601/` Not connecting__
* You may need to edit your `/etc/hosts` to `33.33.0.75 datamnom.dev`

__Kibana is working but it's asking for index__
* replace `logstash-*` with the index specific to the dataset import.  See the [wiki](../../wiki) for specific use-cases.

__Kibana is working but I see `No Results Found`__
* top-right corner, change time frame from `Last 15 minutes` to a larger time scale
