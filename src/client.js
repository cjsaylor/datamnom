var elasticsearch = require('elasticsearch');
module.exports = new elasticsearch.Client({
	host: 'datamnom.dev:9200',
	apiVersion: '1.4'
});