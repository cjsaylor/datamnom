'use strict'

// @see https://www.chapelhillopendata.org/explore/dataset/local-air-quality/information/

module.exports = {
	"importer": {
		"class": "csv",
		"delimiter": ";",
		"headers": [
			"Last Check",
			"Current Particulate Matter 2.5 Value (PM 2.5)",
			"PM 2.5 (10 Minute Avg.)",
			"PM 2.5 (30 Minute Avg.)",
			"PM 2.5 (1 Hour Avg.)",
			"PM 2.5 (6 Hour Avg.)",
			"PM 2.5 (24 Hour Avg.)",
			"PM 2.5 (One Week Avg.)",
			"Temp (F)",
			"Humidity (%)",
			"Pressure (mbar)",
			"Site Label",
			"Inside/Outside",
			"Latitude",
			"Longitude",
			"Uptime (Seconds)",
			"RSSI (WiFi signal strength dBm)",
			"Hardware Issues",
			"Age of Data at Check (minutes)",
			"Geo Point (0)"
		],
		"mapper": function (record) {
			record['Geo Point'] = record['Geo Point (0)']
			;['Latitude', 'Longitude', 'Geo Point (0)'].forEach(key => delete record[key])
			;[
				"PM 2.5 (10 Minute Avg.)",
				"PM 2.5 (30 Minute Avg.)",
				"PM 2.5 (1 Hour Avg.)",
				"PM 2.5 (6 Hour Avg.)",
				"PM 2.5 (24 Hour Avg.)",
				"PM 2.5 (One Week Avg.)",
				'Pressure (mbar)'
			].forEach(key => {
				record[key] = parseFloat(record[key])
			})
			;[
				'Temp (F)',
				'Humidity (%)'
			].forEach(key => record[key] = parseInt(record[key], 10))
			return record
		}
	},
	"destinations": {
		"elasticsearch": {
			"index": "air_quality",
			"types": {
				"properties": {
					"Geo Point": {
						"type": "geo_point"
					}
				}
			}
		}
	}
}