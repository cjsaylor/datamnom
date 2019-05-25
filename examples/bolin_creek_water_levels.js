'use strict'

// @see https://waterdata.usgs.gov/nwis/uv?cb_00060=on&cb_00065=on&format=html&site_no=0209734440

module.exports = {
	"importer": {
		"class": "csv",
		"delimiter": "\t",
		"headers": [
			"Agency Code",
			"Site Number",
			"Timestamp",
			"Timezone",
			"Gauge Height (ft)",
			"GH Approval",
			"Discharge (ft/s)",
			"DC Approval"
		],
		"mapper": function (record) {
			record['Timestamp'] = new Date(`${record['Timestamp']} ${record['Timezone']}`)
			;[
				'Gauge Height (ft)',
				'Discharge (ft/s)'
			].forEach(key => record[key] = parseFloat(record[key]))
			delete record['Timezone']
			return record
		}
	},
	"destinations": {
		"elasticsearch": {
			"index": "bolin_creek_water_levels",
			"types": {
				"properties": {
					"Gauge Height (ft)": {
						"type": "float"
					},
					"Discharge (ft/s)": {
						"type": "float"
					},
					"Timestamp": {
						"type": "date"
					}
				}
			}
		}
	}
}