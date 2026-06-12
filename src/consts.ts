export const SITE_TITLE = '个人笔记';
export const SITE_DESCRIPTION = '记录技术学习、英语笔记与生活感悟';

export const GITHUB_REPO = 'https://github.com/duxuebing-gd/Blog';

export const CATEGORIES = {
	tech: {
		label: '技术',
		description: '编程、工具与工程实践笔记',
		icon: '{ }',
	},
	english: {
		label: '英语',
		description: '词汇、语法与阅读学习记录',
		icon: 'Aa',
	},
	life: {
		label: '生活',
		description: '日常思考与生活感悟',
		icon: '~',
	},
} as const;

export type Category = keyof typeof CATEGORIES;

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as Category[];
