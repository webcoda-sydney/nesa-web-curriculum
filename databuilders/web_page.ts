import type { WebPage } from '@/kontent/content-types'
import { getItemByCodename } from '@/lib/api'
import type { DataBuilderBuildDataParams, GetPageResponseParams } from '.'

function getPageResponse({ codename, preview }: GetPageResponseParams) {
	return getItemByCodename<WebPage>({
		depth: 3,
		codename,
		preview,
	})
}

async function buildData({ result }: DataBuilderBuildDataParams) {
	return {
		...result,
		rootLayoutClassName: 'max-w-none mx-0 px-0 !pt-0',
	}
}

const _ = {
	getPageResponse,
	buildData,
}

export default _
