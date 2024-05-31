import { getStaticPropsForRedirectToDefaultFocusArea } from '@/utils/syllabus'
import { GetServerSideProps } from 'next'

export default function TabStage() {
	return null
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { syllabus, tab } = context.params
	if (syllabus && tab === 'content') {
		const { redirect } =
			(await getStaticPropsForRedirectToDefaultFocusArea(context)) || {}

		return {
			redirect,
		}
	}
	return {
		redirect: {
			destination: '/',
			permanent: true,
		},
	}
}
