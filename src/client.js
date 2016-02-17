var elasticsearch = require('elasticsearch');
module.exports = new elasticsearch.Client({
	host: 'docker:9200',
	apiVersion: '2.2'
});
