import Grid, { GridProps } from '@mui/material/Grid'

export const GridWrapper = (props: GridProps) => {
	return <Grid container spacing={{ xs: 4, md: 8 }} {...props} />
}
