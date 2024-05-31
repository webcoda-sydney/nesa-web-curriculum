export interface CurrentViewingProps {
	syllabus: string
	stage?: string
	year?: string
}

export const CurrentViewing = ({
	syllabus,
	stage,
	year,
}: CurrentViewingProps) => {
	return (
		<div
			className="hidden xl:block fixed bottom-0 left-0 mb-7 ml-7 bg-nsw-grey-01/80 text-white nsw-small z-10"
			css={{
				minWidth: 200,
			}}
		>
			<div className="border-b border-white py-2 px-3 text-subtext">
				Currently viewing
			</div>
			<div className="py-2 px-3 space-y-1">
				{syllabus && (
					<div>
						<strong>Syllabus:</strong> {syllabus}
					</div>
				)}
				{stage && (
					<div>
						<strong>Stage:</strong> {stage}
					</div>
				)}
				{year && (
					<div>
						<strong>Year:</strong> {year}
					</div>
				)}
			</div>
		</div>
	)
}
