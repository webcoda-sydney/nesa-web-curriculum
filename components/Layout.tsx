import NavPage, { NavPageProps } from '@/legacy-ported/containers/NavPage'

function Layout({ children, ...props }: NavPageProps) {
	return <NavPage {...props}>{children}</NavPage>
}

export default Layout
