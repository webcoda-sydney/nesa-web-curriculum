/**
 * Note:
 * Since config and mappings don't change and we want to access them almost everywhere in our codes,
 * then I decided to use React Context to provide config and mappings to all components
 */

import { KontentCurriculumCommonResultData } from '@/types'
import { matchFilesWithResourceAssets } from '@/utils/assets'
import { Elements } from '@kontent-ai/delivery-sdk'
import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react'
interface AssetsProviderProps {
	children: ReactNode
	assets: KontentCurriculumCommonResultData<any>['assets']
}

export const AssetsContext = createContext<
	Omit<AssetsProviderProps, 'children'>
>({
	assets: [],
})

export const useAssets = () => useContext(AssetsContext)

export const useAssetsFromAssetsElement = (
	assetElements: Elements.AssetsElement,
) => {
	const { assets } = useAssets()

	return (
		assetElements?.value
			?.map((assetElement) => {
				return assets.find((asset) => {
					return matchFilesWithResourceAssets(asset, assetElement)
				})
			})
			?.filter((item) => !!item) || []
	)
}

export const AssetsProvider = ({
	children,
	assets: initialAssets,
}: AssetsProviderProps) => {
	const [assets, setAssets] = useState(initialAssets)

	const keysOfPageResponseLinkedItems = initialAssets
		? JSON.stringify(initialAssets.map((asset) => asset.id))
		: []

	useEffect(() => {
		setAssets(initialAssets)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [keysOfPageResponseLinkedItems])

	const value = {
		assets: assets || initialAssets,
		setAssets,
	}

	return (
		<AssetsContext.Provider value={value}>
			{children}
		</AssetsContext.Provider>
	)
}
