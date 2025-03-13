export default {
	get safari(): boolean {
		return navigator.userAgent.toLowerCase().indexOf('safari/') > -1;
	},
};
