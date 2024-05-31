export interface CommonPageAPIType<T> {
	pageProps: T
}

export const PAGE_API_BASE_PATH = `/_next/data/${
	process.env.NODE_ENV === 'development'
		? 'development'
		: process.env.NEXT_PUBLIC_BUILD_ID ||
		  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA
}`
