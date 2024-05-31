import { getAllAssetsWithTaxo } from '.'
import { fetchKontentRESTManagementAPIWithContinuationToken } from '../fetchUtils'

export const fetchAssetsFromKontentManagementRestApi = async () => {
	const taxonomies = await fetchKontentRESTManagementAPIWithContinuationToken(
		'taxonomies',
		'taxonomies',
	)
	const assets = await fetchKontentRESTManagementAPIWithContinuationToken(
		'assets',
		'assets',
	)

	return getAllAssetsWithTaxo(assets, taxonomies)
}
