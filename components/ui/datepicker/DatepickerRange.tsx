import Icon from '@/components/Icon'
import { IPropWithClassNameChildren } from '@/types'
import { ReactNode, forwardRef } from 'react'
import { ReactDatePickerProps } from 'react-datepicker'
import Datepicker from './Datepicker'

export type DatepickerRangeProps = Omit<
	ReactDatePickerProps,
	'onChange' | 'selected' | 'startDate' | 'endDate'
> & {
	selectedStartDate: ReactDatePickerProps['selected']
	selectedEndDate: ReactDatePickerProps['selected']
	onChangeStart: ReactDatePickerProps['onChange']
	onChangeEnd: ReactDatePickerProps['onChange']
}

export type DatepickerRangeInputProps = {
	slotBefore?: ReactNode
}

const DatepickerRangeInput = forwardRef<
	HTMLInputElement,
	DatepickerRangeInputProps
>(({ slotBefore, ...props }, ref) => (
	<div className="relative">
		{slotBefore}
		<input {...props} ref={ref} type="text" />
		<Icon
			icon="ic:baseline-calendar-today"
			className="absolute top-1/2 -translate-y-1/2 right-4 pointer-events-none"
		/>
	</div>
))

const DatepickerPrefix = ({ children }: IPropWithClassNameChildren) => {
	return (
		<span className="absolute top-1/2 -translate-y-1/2 left-4 pointer-events-none">
			{children}
		</span>
	)
}

export const DatepickerRange = ({
	className,
	selectedStartDate,
	selectedEndDate,
	onChangeStart,
	onChangeEnd,
}: DatepickerRangeProps) => {
	return (
		<div
			className={className}
			css={{
				'.react-datepicker__tab-loop': {
					margin: '0 !important',
				},
			}}
		>
			<Datepicker
				className="!pl-16"
				selected={selectedStartDate}
				onChange={onChangeStart}
				selectsStart
				startDate={selectedStartDate}
				endDate={selectedEndDate}
				customInput={
					<DatepickerRangeInput
						slotBefore={<DatepickerPrefix>From:</DatepickerPrefix>}
					/>
				}
			/>
			<Datepicker
				className="!pl-11"
				selected={selectedEndDate}
				onChange={onChangeEnd}
				selectsEnd
				startDate={selectedStartDate}
				endDate={selectedEndDate}
				minDate={selectedStartDate}
				customInput={
					<DatepickerRangeInput
						slotBefore={<DatepickerPrefix>To:</DatepickerPrefix>}
					/>
				}
			/>
		</div>
	)
}
