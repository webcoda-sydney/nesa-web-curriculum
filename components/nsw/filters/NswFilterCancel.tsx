import { memo, MouseEvent } from 'react'

export interface NswFilterCancelProps {
	onReset: (_e: MouseEvent<HTMLButtonElement>) => void
}

const _NswFilterCancel = (props: NswFilterCancelProps) => {
	const { onReset } = props
	return (
		<div className="nsw-filters__cancel">
			<button type="reset" onClick={onReset}>
				Clear all filters
			</button>
		</div>
	)
}

export const NswFilterCancel = memo(_NswFilterCancel)
