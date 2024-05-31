import clsx from 'clsx'
import DatePicker, { ReactDatePickerProps } from 'react-datepicker'

export type DatepickerProps = ReactDatePickerProps

import 'react-datepicker/dist/react-datepicker.css'
import styles from './Datepicker.module.scss'

const Datepicker = ({
	className,
	dateFormat = 'dd MMMM yyyy',
	...props
}: DatepickerProps) => {
	return (
		<div className="relative">
			<DatePicker
				showPopperArrow={false}
				{...props}
				className={clsx(
					className,
					'border rounded border-nsw-grey-01 w-full py-[11px] px-4',
				)}
				wrapperClassName={clsx(
					props.wrapperClassName,
					styles.Datepicker,
				)}
				calendarClassName={clsx(
					props.wrapperClassName,
					styles.Datepicker__calendar,
				)}
				popperClassName={clsx(
					props.popperClassName,
					styles.Datepicker__popper,
				)}
				dateFormat={dateFormat}
			/>
		</div>
	)
}

export default Datepicker
