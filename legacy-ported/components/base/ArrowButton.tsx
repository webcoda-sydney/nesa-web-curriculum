import Link from '@/components/Link'

export interface ArrowButtonProps {
	/*
	 * Text above the title
	 * */
	prefix?: string
	/*
	 * Title e.g Primary, Secondary..
	 * */
	title: string
	/*
	 * Learn more path
	 * */
	path: string
	/*
	 * ClassName to be used on the text
	 * */
	className?: string | undefined

	/**
	 * Button's font colour
	 */
	fontColor?: string

	/**
	 * Arrow's font colour
	 */
	arrowColor?: string
}

export default function ArrowButton(props: ArrowButtonProps) {
	const { prefix, title, path, className, fontColor, arrowColor } = props
	props

	return (
		<div className="arrow-btn">
			<Link className={`arrow-btn__link ${className}`} href={path}>
				{prefix && <p>{prefix}</p>}
				<h3 style={{ color: fontColor }}>{title}</h3>
				<div className="arrow-btn__label">
					<i
						className="material-icons nsw-material-icons"
						aria-hidden="true"
						style={{ color: arrowColor }}
					>
						east
					</i>
				</div>
			</Link>
		</div>
	)
}
