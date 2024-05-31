import type { IStage, IStageRaw } from '../../utilities/backendTypes'
import { uriConvert } from '../../utilities/functions'

const StageIds = {
	earlyStage1: 'ES1',
	stage1: 'S1',
	stage2: 'S2',
	stage3: 'S3',
	stage4: 'S4',
	stage5: 'S5',
	stage6: 'S6',
} as const

// const StageCodes = {
//   earlyStage1: `K (${StageIds.earlyStage1})`,
//   stage1: `1-2 (${StageIds.stage1})`,
//   stage2: `3-4 (${StageIds.stage2})`,
//   stage3: `5-6 (${StageIds.stage3})`,
//   stage4: `7-8 (${StageIds.stage4})`,
//   stage5: `9-10 (${StageIds.stage5})`,
//   stage6: `11-12 (${StageIds.stage6})`,
// } as const;

export const RawStages = {
	earlyStage1: {
		// key: StageCodes.earlyStage1,
		// value: {
		key: StageIds.earlyStage1,
		value: 'Early Stage 1',
		// },
		available: true,
	},
	stage1: {
		// key: StageCodes.stage1,
		// value: {
		key: StageIds.stage1,
		value: 'Stage 1',
		// },
		available: true,
	},
	stage2: {
		// key: StageCodes.stage2,
		// value: {
		key: StageIds.stage2,
		value: 'Stage 2',
		// },
		available: false,
	},
	stage3: {
		// key: StageCodes.stage3,
		// value: {
		key: StageIds.stage3,
		value: 'Stage 3',
		// },
		available: false,
	},
	stage4: {
		// key: StageCodes.stage4,
		// value: {
		key: StageIds.stage4,
		value: 'Stage 4',
		// },
		available: false,
	},
	stage5: {
		// key: StageCodes.stage5,
		// value: {
		key: StageIds.stage5,
		value: 'Stage 5',
		// },
		available: false,
	},
	stage6: {
		// key: StageCodes.stage6,
		// value: {
		key: StageIds.stage6,
		value: 'Stage 6',
		// },
		available: false,
	},
}

// const extractYearRange = (stage: string): [string] | [string, string] => {
//   const years = stage.split(' ')[0].split('-');
//
//   if (years.length === 1) {
//     return [years[0]];
//   }
//   return [years[0], years[1]];
// };

export const StageStartYear: Record<IStage['id'], string> = {
	[StageIds.earlyStage1]: 'K',
	[StageIds.stage1]: '1',
	[StageIds.stage2]: '3',
	[StageIds.stage3]: '5',
	[StageIds.stage4]: '7',
	[StageIds.stage5]: '9',
	[StageIds.stage6]: '11',
}
export const StageEndYear: Record<IStage['id'], string> = {
	[StageIds.earlyStage1]: 'K',
	[StageIds.stage1]: '2',
	[StageIds.stage2]: '4',
	[StageIds.stage3]: '6',
	[StageIds.stage4]: '8',
	[StageIds.stage5]: '10',
	[StageIds.stage6]: '12',
}

export const convertStage = (raw: IStageRaw): IStage => ({
	id: uriConvert(raw.value),
	code: raw.key,
	label: raw.value,
	yearRange: [StageStartYear[raw.key], StageEndYear[raw.key]],
	available: raw.available ?? false,
})

export const Stages = {
	earlyStage1: convertStage(RawStages.earlyStage1),
	stage1: convertStage(RawStages.stage1),
	stage2: convertStage(RawStages.stage2),
	stage3: convertStage(RawStages.stage3),
	stage4: convertStage(RawStages.stage4),
	stage5: convertStage(RawStages.stage5),
	stage6: convertStage(RawStages.stage6),
}

export const PrimaryStages: IStage[] = [
	Stages.earlyStage1,
	Stages.stage1,
	Stages.stage2,
	Stages.stage3,
]

export const SecondaryStages: IStage[] = [Stages.stage4, Stages.stage5]

export const SeniorStages: IStage[] = [Stages.stage6]

export const AllStages = [...PrimaryStages, ...SecondaryStages, ...SeniorStages]

export const findStage = (id: IStage['id']): IStage =>
	AllStages.find((s) => s.id === id) ?? {
		id,
		code: id,
		label: 'Unknown Stage',
		yearRange: ['UNK'],
		available: false,
	}
