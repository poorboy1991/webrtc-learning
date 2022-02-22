export const NODE_ENV = process.env.NODE_ENV
export const HOST = process.env.HOST
const origin = window.location.origin

export function getBaseURL(type) {
	let baseURL
	switch (NODE_ENV) {
		case 'production':
		case 'testing':
		case 'preview':
			baseURL = `${origin}/api`
			break
		default:
			baseURL = '/api'
	}
	return baseURL
}

/* api列表 */
export const apis = {
	PULL_STREAM_DEVICE: '/pull-stream-device', // 提交offer和candidate 拉流

}
