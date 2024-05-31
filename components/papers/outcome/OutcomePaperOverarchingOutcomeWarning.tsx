import { useKontentHomeConfig } from '@/components/contexts/KontentHomeConfigProvider'

export const OutcomePaperOverarchingOutcomeWarning = () => {
	const { config } = useKontentHomeConfig()
	return <>{config.item.elements.overarchingoutcome_message.value}</>
}
