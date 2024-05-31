function handleResponse(response: any) {
	return response.text().then((text: any) => text && JSON.parse(text))
}

export default handleResponse
