/**
 * Creates a predicate function to check if an object is of a specific type.
 * @template T - The type of the object to check.
 * @param {string} contentTypeKey - The key of the content type.
 * @returns {(obj: any) => obj is T} - The predicate function.
 */
const makePredicateKontent = (contentTypeKey) => {
	/**
	 * @param {any} obj - The object to check.
	 * @returns {boolean} - True if the object is of the specified type, false otherwise.
	 */
	return (obj) => {
		if (!!obj && 'system' in obj) {
			let _obj = obj
			return _obj.system.type === contentTypeKey
		}
		return false
	}
}

/**
 * Checks if an object is an instance of Optionslist.
 * @param {any} obj - The object to check.
 * @returns {boolean} - True if the object is an instance of Optionslist, false otherwise.
 */
const isOptionList = makePredicateKontent('optionslist')
const isFocusarea = makePredicateKontent('focusarea')
const isFocusareaoption = makePredicateKontent('focusareaoption')

module.exports = {
	makePredicateKontent,
	isOptionList,
	isFocusarea,
	isFocusareaoption,
}
