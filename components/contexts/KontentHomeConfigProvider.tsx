/**
 * Note:
 * Since config and mappings don't change and we want to access them almost everywhere in our codes,
 * then I decided to use React Context to provide config and mappings to all components
 */

import {
	KontentCurriculumCommonResultData,
	KontentCurriculumResult,
} from '@/types'
import {
	Elements,
	IContentItem,
	IContentItemsContainer,
} from '@kontent-ai/delivery-sdk'
import {
	ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
} from 'react'
interface KontentHomeConfigProviderProps {
	children: ReactNode
	config: KontentCurriculumCommonResultData<any>['config']
	mappings: KontentCurriculumResult<any>['mappings']
	preview: boolean
	pageResponseLinkedItems: IContentItemsContainer
	setPageResponseLinkedItems?: (
		_linkedItems: KontentHomeConfigProviderProps['pageResponseLinkedItems'],
	) => void
}

export const KontentHomeConfigContext = createContext<
	Omit<KontentHomeConfigProviderProps, 'children'>
>({
	config: null,
	mappings: [],
	preview: false,
	pageResponseLinkedItems: {},
	setPageResponseLinkedItems: (_linkedItems) => {},
})

export const useKontentHomeConfig = () => useContext(KontentHomeConfigContext)

export const KontentHomeConfigProvider = ({
	children,
	config,
	mappings,
	preview,
	pageResponseLinkedItems: initialPageResponseLinkedItems,
}: KontentHomeConfigProviderProps) => {
	const [pageResponseLinkedItems, setPageResponseLinkedItems] = useState(
		initialPageResponseLinkedItems,
	)

	const keysOfPageResponseLinkedItems = initialPageResponseLinkedItems
		? Object.keys(initialPageResponseLinkedItems)
		: []

	useEffect(() => {
		setPageResponseLinkedItems(initialPageResponseLinkedItems)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [JSON.stringify(keysOfPageResponseLinkedItems)])

	const value = {
		config,
		mappings,
		preview,
		pageResponseLinkedItems:
			pageResponseLinkedItems || initialPageResponseLinkedItems,
		setPageResponseLinkedItems,
	}

	return (
		<KontentHomeConfigContext.Provider value={value}>
			{children}
		</KontentHomeConfigContext.Provider>
	)
}

export const getLinkedItems = <T extends IContentItem>(
	linkedItemsElement: Elements.LinkedItemsElement<T>,
	linkedItems: IContentItemsContainer,
) => {
	if (!linkedItemsElement || !linkedItems) return null
	return linkedItemsElement?.value
		?.map((item) => linkedItems[item])
		.filter((t) => !!t) as T[]
}

export const getUnbindedLinkedItems = <T extends IContentItem>(
	linkedItemsElement: Elements.LinkedItemsElement<T>,
	linkedItems: IContentItem[],
) => {
	if (!linkedItemsElement || !linkedItems) return null
	return linkedItemsElement?.value.map((ruleName) => {
		return linkedItems.find((i) => i.system.codename == ruleName) as T
	})
}
