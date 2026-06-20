const CJK_REGEX = /[\u4e00-\u9fff\u3400-\u4dbf]/g;
const ENGLISH_WORD_REGEX = /[a-zA-Z]+(?:'[a-zA-Z]+)?/g;
const READING_SPEED = 400;

export interface ReadingStats {
	wordCount: number;
	readingMinutes: number;
	wordCountLabel: string;
	readingTimeLabel: string;
}

function stripMarkdown(text: string): string {
	return text
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/`[^`]+`/g, ' ')
		.replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
		.replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
		.replace(/^#{1,6}\s+/gm, '')
		.replace(/^\s*[-*+]\s+/gm, '')
		.replace(/^\s*\d+\.\s+/gm, '')
		.replace(/[*_~>|]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

export function countWords(text: string): number {
	const cleaned = stripMarkdown(text);
	const cjkCount = cleaned.match(CJK_REGEX)?.length ?? 0;
	const withoutCjk = cleaned.replace(CJK_REGEX, ' ');
	const englishCount = withoutCjk.match(ENGLISH_WORD_REGEX)?.length ?? 0;

	return cjkCount + englishCount;
}

export function getReadingMinutes(wordCount: number): number {
	if (wordCount <= 0) return 1;
	return Math.max(1, Math.ceil(wordCount / READING_SPEED));
}

export function formatWordCount(wordCount: number): string {
	return `约 ${wordCount.toLocaleString('zh-CN')} 字`;
}

export function formatReadingTime(minutes: number): string {
	return `阅读约 ${minutes} 分钟`;
}

export function getReadingStats(text: string): ReadingStats {
	const wordCount = countWords(text);
	const readingMinutes = getReadingMinutes(wordCount);

	return {
		wordCount,
		readingMinutes,
		wordCountLabel: formatWordCount(wordCount),
		readingTimeLabel: formatReadingTime(readingMinutes),
	};
}
