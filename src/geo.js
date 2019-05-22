const R = 6271

function toRad(n) {
	return n * Math.PI / 180;
}

/**
 * Calculate the geo distance between coordinates.
 *
 * @see https: //en.wikipedia.org/wiki/Haversine_formula
 * @see https: //github.com/jaxgeller/node-geo-distance
 */
exports.haversine = function(coord1, coord2) {
	const [lat1, lon1] = coord1
	const [lat2, lon2] = coord2
	const dLat = toRad(lat2 - lat1)
	const dLong = toRad(lon2 - lon1)

	const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLong / 2) * Math.sin(dLong / 2)
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
	const d = R * c

	return (d * 1000).toFixed(3)
}