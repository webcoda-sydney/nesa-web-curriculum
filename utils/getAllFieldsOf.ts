export const getAllFieldsOf = <T extends Record<string, { codename: string }>>(
	obj: T,
) => {
	return Object.values(obj).map((o) => o.codename)
}
