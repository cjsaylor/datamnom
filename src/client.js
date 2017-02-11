var elasticsearch = require('elasticsearch');
module.exports = new elasticsearch.Client({
	host: 'localhost:9200',
	apiVersion: '5.0'
});
