import { KontentCurriculumCommonResultData } from '@/types'
import { getTaxoCodenames } from '@/utils'
import { useMemo } from 'react'

export function useDisabledStages(
	config: KontentCurriculumCommonResultData<any>['config'],
) {
	const disabledStages = useMemo(() => {
		return config?.item?.elements?.disabled_stages?.value.map(
			(item) => item.name,
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [JSON.stringify(config?.item?.elements?.disabled_stages?.value)])

	return disabledStages
}
export function useDisabledTaxoStages(
	config: KontentCurriculumCommonResultData<any>['config'],
) {
	const disabledStages = useMemo(() => {
		return getTaxoCodenames(config?.item?.elements?.disabled_stages)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [JSON.stringify(config?.item?.elements?.disabled_stages?.value)])

	return disabledStages
}

export function useDisabledTaxoLearningAreas(
	config: KontentCurriculumCommonResultData<any>['config'],
) {
	const disabledLearningAreas = useMemo(() => {
		return getTaxoCodenames(
			config?.item?.elements?.disabled_key_learning_areas,
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		// eslint-disable-next-line react-hooks/exhaustive-deps
		JSON.stringify(
			config?.item?.elements?.disabled_key_learning_areas?.value,
		),
	])
	return disabledLearningAreas
}

export default function useDisabledLearningAreasAndStages(
	config: KontentCurriculumCommonResultData<any>['config'],
) {
	const disabledStages = useDisabledTaxoStages(config)
	const disabledLearningAreas = useDisabledTaxoLearningAreas(config)

	return {
		disabledStages,
		disabledLearningAreas,
	}
}
