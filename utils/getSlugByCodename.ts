export const getSlugByCodename = (codename: string) =>
	codename.replace(/_/g, '-')
