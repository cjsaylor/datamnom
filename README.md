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
* Copy files into `inbound/` folder and run `node app/datamnom.js` for flat TXT file import.
* See [the wiki](../../wiki) for specific use-cases