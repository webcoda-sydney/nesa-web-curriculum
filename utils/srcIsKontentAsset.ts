const kontentAssetHostnames = [
	'assets-eu-01.kc-usercontent.com',
	'preview-assets-eu-01.kc-usercontent.com',
	'assets-us-01.kc-usercontent.com',
	'preview-assets-us-01.kc-usercontent.com',
	'assets-au-01.kc-usercontent.com',
	'preview-assets-au-01.kc-usercontent.com',
	'library.curriculum.nsw.edu.au', //custom domain assets
	(process.env.NEXT_PUBLIC_ASSETS_BASE_PATH || '').replace('https://', ''),
].filter((item) => !!item)

const srcIsKontentAsset = (src: string) => {
	try {
		const srcUrl = new URL(src)
		return kontentAssetHostnames.includes(srcUrl.hostname)
	} catch {
		return false
	}
}

export default srcIsKontentAsset
