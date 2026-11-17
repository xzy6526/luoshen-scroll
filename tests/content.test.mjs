import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';

const content = await import('../src/content.mjs').catch(() => null);
const normalize = text => text.replaceAll('𬴂', '騑').replace(/[^\p{Script=Han}]/gu, '');

test('序言和十四景原文连续、完整覆盖实际获取的底本', async () => {
  assert.ok(content, '尚未实现十四景阅读数据');
  const reference = await readFile(new URL('../docs/source-text.txt', import.meta.url), 'utf8');
  const actual = content.preface + content.chapters.flatMap(chapter => chapter.paragraphs).join('');
  assert.equal(normalize(actual), normalize(reference));
  assert.equal(content.chapters.length, 14);
});

test('章节编号、标题、引句、原文和图片对应', async () => {
  assert.ok(content, '尚未实现章节与插图映射');
  const titles = ['行旅初起', '山关暮途', '停驻洛川', '初见洛神', '临流采芝', '赠佩通辞', '众灵游江', '凌波微步', '神祇云会', '云车远去', '泛舟追寻', '月下不寐', '晨雾归途', '烟波回望'];
  for (const [index, chapter] of content.chapters.entries()) {
    assert.equal(chapter.id, index + 1);
    assert.equal(chapter.title, titles[index]);
    assert.equal(chapter.image, `art/${String(index + 1).padStart(2, '0')}.webp`);
    for (const quote of chapter.quotes) assert.ok(normalize(chapter.paragraphs.join('')).includes(normalize(quote)));
    assert.ok(chapter.translation && chapter.notes.length);
    await access(new URL(`../public/${chapter.image}`, import.meta.url));
  }
});

test('御者对话、犹疑、自持和完整别辞均保留', () => {
  assert.ok(content, '尚未录入必须保留的正文');
  assert.match(content.chapters[3].paragraphs.join(''), /御者对曰.*臣闻河洛之神/s);
  assert.match(content.chapters[5].paragraphs.join(''), /感交甫之弃言.*申礼防以自持/s);
  const farewell = content.chapters[9].paragraphs.join('');
  assert.match(farewell, /恨人神之道殊兮，怨盛年之莫当/);
  assert.match(farewell, /虽潜处于太阴，长寄心于君王/);
  assert.match(content.chapters[13].paragraphs.join(''), /揽騑辔以抗策/);
});
