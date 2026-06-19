export const SITE_TITLE = '个人笔记';
export const SITE_DESCRIPTION = '记录技术学习、英语笔记、生活感悟与阅读笔记';

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
		label: '生活与阅读',
		description: '日常思考、生活感悟与读书笔记',
		icon: '▤',
	},
} as const;

export type Category = keyof typeof CATEGORIES;

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as Category[];
